const {join} = require('path');
const express = require('express');
const {createServer} = require('http');
const socketIO = require('socket.io');

const {PORT} = require('./config/config');

const rootRouter = require('./routes/rootRouter')
const ludoRouter = require('./routes/ludoRouter')

let {rooms,NumberOfMembers,win} = require('./models/model');
let socketToRoomMap = {}; // socket → {room, id} tracking

const app = express();
const server = createServer(app);
const io = socketIO(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost'],
      credentials: true
    }});

app.use(express.static(join(__dirname, 'public/')));
app.use(express.urlencoded({ extended: true }));
app.enable('trust proxy');

let nsp = io.of('/ludo');

nsp.on('connection',(socket)=>{
    console.log('A User has connected to the game');
    socket.on('fetch',(data,cb)=>{
        try{
            if(!data || typeof data !== 'string' || !rooms[data]){
                socket.emit('imposter');
                return;
            }

            // ✅ KEY FIX: پہلے چیک کرو - کیا یہ socket اسی room میں پہلے سے ہے؟
            // یہ check پہلے ہونا ضروری ہے - ورنہ نیچے والا code Yellow delete کر دیتا ہے
            let existingId = Object.keys(rooms[data]).find(k => rooms[data][k].sid === socket.id);
            if(existingId !== undefined){
                // دوبارہ fetch آیا - وہی id واپس کرو، کچھ delete مت کرو
                socketToRoomMap[socket.id] = {room: data, id: existingId};
                socket.join(data);
                cb(Object.keys(rooms[data]), Number(existingId));
                return;
            }

            // نئے room میں جا رہا ہے تو پرانا ہٹاؤ
            if(socketToRoomMap[socket.id]){
                let {room: oldRoom, id: oldId} = socketToRoomMap[socket.id];
                if(rooms[oldRoom] && rooms[oldRoom][oldId]){
                    delete rooms[oldRoom][oldId];
                }
                socket.leave(oldRoom);
                delete socketToRoomMap[socket.id];
            }

            let member_id = generate_member_id(socket.id,data);
            socket.join(data);
            if(member_id !== -1){
                socketToRoomMap[socket.id] = {room: data, id: member_id};
                cb(Object.keys(rooms[data]),member_id);
                socket.to(data).emit('new-user-joined',{id:member_id});
            }else{
                socket.emit('imposter');
            }
        }
        catch(err){
            console.error('ERROR in fetch:', err.message);
            socket.emit('imposter');
        }
    });

    socket.on('roll-dice',(data,cb)=>{
        if(!data || !data.room || !rooms[data.room] || !rooms[data.room][data.id]){
            console.error('❌ Invalid dice roll data:', data);
            return;
        }
        rooms[data.room][data.id]['num'] = Math.floor((Math.random()*6) + 1);
        data['num'] = rooms[data.room][data.id]['num']
        nsp.to(data.room).emit('rolled-dice',data);
        cb(rooms[data.room][data.id]['num']);
    })

    socket.on('chance',(data)=>{
        nsp.to(data.room).emit('is-it-your-chance', Number(data.nxt_id));
    });

    socket.on('random',(playerObj,cb)=>{
        if(!playerObj || !playerObj.room || !rooms[playerObj.room] || !rooms[playerObj.room][playerObj.id]){
            console.error('❌ Invalid random data:', playerObj);
            return;
        }
        if(playerObj['num'] != rooms[playerObj.room][playerObj.id]['num']){
            console.log('⚠️ Someone is trying to cheat!', playerObj.id);
        }
        playerObj['num'] = rooms[playerObj.room][playerObj.id]['num']
        nsp.to(playerObj.room).emit('Thrown-dice', playerObj);
        cb(playerObj['num']);
    });

    if(!global.rankings) global.rankings = {};

    socket.on('WON',(OBJ)=>{
        if(!OBJ || !OBJ.room || !rooms[OBJ.room]){
            console.error('❌ Invalid WON data:', OBJ);
            return;
        }

        if(!win[OBJ.room]) win[OBJ.room] = {};

        if(!global.rankings[OBJ.room]) global.rankings[OBJ.room] = [];
        let alreadyRanked = global.rankings[OBJ.room].find(r => r.id === OBJ.id);
        if(!alreadyRanked){
            global.rankings[OBJ.room].push({ id: OBJ.id, rank: global.rankings[OBJ.room].length + 1 });
            let rankData = global.rankings[OBJ.room][global.rankings[OBJ.room].length - 1];
            console.log(`🏆 Rank ${rankData.rank}: Player ${OBJ.id} in room ${OBJ.room}`);
            nsp.to(OBJ.room).emit('rank-update', { id: OBJ.id, rank: rankData.rank });
        }

        if(validateWinner(OBJ, socket)){
            let winnerId = OBJ.id;
            delete global.rankings[OBJ.room];
            delete win[OBJ.room];
            delete NumberOfMembers[OBJ.room];
            if(rooms[OBJ.room]) delete rooms[OBJ.room];
            nsp.to(OBJ.room).emit('winner', winnerId);
        }
    });

    socket.on('resume',(data,cb)=>{
        if(!data || !data.room){
            console.error('❌ Invalid resume data');
            return;
        }
        socket.to(data.room).emit('resume',data);
        if(NumberOfMembers[data.room]){
            NumberOfMembers[data.room].members = NumberOfMembers[data.room].members <= 2 ? 2 : NumberOfMembers[data.room].members - 1;
            NumberOfMembers[data.room].constant = true;
        }
        cb();
    });

    socket.on('wait',(data,cb)=>{
        if(!data || !data.room){
            console.error('❌ Invalid wait data');
            return;
        }
        socket.to(data.room).emit('wait',data);
        cb();
    });

    socket.on('disconnect',()=>{
        if(socketToRoomMap[socket.id]){
            let {room, id} = socketToRoomMap[socket.id];
            if(rooms[room] && rooms[room][id]){
                delete rooms[room][id];
                socket.to(room).emit('user-disconnected', id);
                if(Object.keys(rooms[room]).length === 0){
                    delete rooms[room];
                    if(win[room]) delete win[room];
                    if(NumberOfMembers[room]) delete NumberOfMembers[room];
                }
            }
            delete socketToRoomMap[socket.id];
        }
    });
});

function generate_member_id(s_id, rc){
    if(Object.keys(rooms[rc]).length >= 4) return -1;

    // ترتیب: Yellow(3) → Red(1) → Blue(2) → Green(0)
    const order = [3, 1, 2, 0];
    for(let i = 0; i < order.length; i++){
        if(!rooms[rc][order[i]]){
            rooms[rc][order[i]] = {sid: s_id, num: 0};
            return order[i];
        }
    }
    return -1;
}

function validateWinner(OBJ, socket){
    if(!win[OBJ.room]) win[OBJ.room] = {};
    
    let reportKey = OBJ.reportedBy !== undefined ? OBJ.reportedBy : OBJ.player;
    win[OBJ.room][reportKey] = {o: OBJ, s: socket.id};
    
    let roomPlayers = Object.keys(rooms[OBJ.room] || {});
    let reportCount = Object.keys(win[OBJ.room]).length;
    
    if(reportCount < roomPlayers.length) {
        console.log(`⏳ Waiting for winner confirmation: ${reportCount}/${roomPlayers.length} reports`);
        return false;
    }
    
    let winnerId = null;
    for(let key in win[OBJ.room]){
        let currentWinnerId = win[OBJ.room][key].o.id;
        if(winnerId === null){
            winnerId = currentWinnerId;
        } else if(winnerId !== currentWinnerId){
            console.error('❌ Conflicting winner reports!');
            return false;
        }
    }
    
    console.log(`✅ Winner validated: ${winnerId}`);
    return true;
}

app.use('/', rootRouter);
app.use('/ludo', ludoRouter);
app.use(function (req, res) {
    res.statusCode = 404;
    res.end('404!');
});

server.listen(PORT,()=>{
    console.log(`The server has started working on http://localhost:${PORT}`);
});
