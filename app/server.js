const {join} = require('path');
const express = require('express');
const {createServer} = require('http');
const socketIO = require('socket.io');

const {PORT} = require('./config/config');

const rootRouter = require('./routes/rootRouter')
const ludoRouter = require('./routes/ludoRouter')

let {rooms,NumberOfMembers,win} = require('./models/model');

const app = express();
const server = createServer(app);
const io = socketIO(server, {
    cors: {
      // ✅ FIX: CORS کو محدود کریں
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost'],
      credentials: true
    }});

app.use(express.static(join(__dirname, 'public/')));
app.use(express.urlencoded({ extended: true }));
app.enable('trust proxy');

//
///sockets
//
let nsp = io.of('/ludo');

nsp.on('connection',(socket)=>{
    console.log('A User has connected to the game');
    socket.on('fetch',(data,cb)=>{
        try{
            // ✅ FIX: data اور room validate کریں
            if(!data || typeof data !== 'string' || !rooms[data]){
                socket.emit('imposter');
                return;
            }
            
            let member_id = generate_member_id(socket.id,data);
            socket.join(data);
            if(member_id !== -1){
                cb(Object.keys(rooms[data]),member_id);
                socket.to(data).emit('new-user-joined',{id:member_id});
            }else{
                console.log('⚠️ Room is full or error in member_id generation');
                socket.emit('imposter');
            }
        }
        catch(err){
            console.error('ERROR in fetch:', err.message);
            socket.emit('imposter');
        }
    });

    socket.on('roll-dice',(data,cb)=>{
        // ✅ FIX: data validation
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
        // nxt_id کو number میں convert کرکے بھیجو - type mismatch سے بچاؤ
        nsp.to(data.room).emit('is-it-your-chance', Number(data.nxt_id));
    });

    socket.on('random',(playerObj,cb)=>{
        // ✅ FIX: data validation پہلے
        if(!playerObj || !playerObj.room || !rooms[playerObj.room] || !rooms[playerObj.room][playerObj.id]){
            console.error('❌ Invalid random data:', playerObj);
            return;
        }
        
        // playerObj ={
        //     room: room_code,
        //     id: myid,
        //     pid: pid,
        //     num: temp
        // }
        if(playerObj['num'] != rooms[playerObj.room][playerObj.id]['num']){
            console.log('⚠️ Someone is trying to cheat!', playerObj.id);
        }
        playerObj['num'] = rooms[playerObj.room][playerObj.id]['num']
        nsp.to(playerObj.room).emit('Thrown-dice', playerObj);
        cb(playerObj['num']);
    });

    // ranking track کرنے کے لیے
    if(!global.rankings) global.rankings = {};

    socket.on('WON',(OBJ)=>{
        if(!OBJ || !OBJ.room || !rooms[OBJ.room]){
            console.error('❌ Invalid WON data:', OBJ);
            return;
        }

        if(!win[OBJ.room]) win[OBJ.room] = {};

        // ranking track کرو
        if(!global.rankings[OBJ.room]) global.rankings[OBJ.room] = [];
        let alreadyRanked = global.rankings[OBJ.room].find(r => r.id === OBJ.id);
        if(!alreadyRanked){
            global.rankings[OBJ.room].push({ id: OBJ.id, rank: global.rankings[OBJ.room].length + 1 });
            let rankData = global.rankings[OBJ.room][global.rankings[OBJ.room].length - 1];
            console.log(`🏆 Rank ${rankData.rank}: Player ${OBJ.id} in room ${OBJ.room}`);
            // سب کو rank update بھیجو
            nsp.to(OBJ.room).emit('rank-update', { id: OBJ.id, rank: rankData.rank });
        }

        if(validateWinner(OBJ, socket)){
            let winnerId = OBJ.id;
            // cleanup
            delete global.rankings[OBJ.room];
            delete win[OBJ.room];
            delete NumberOfMembers[OBJ.room];
            if(rooms[OBJ.room]) delete rooms[OBJ.room];
            nsp.to(OBJ.room).emit('winner', winnerId);
        }
    });

    socket.on('resume',(data,cb)=>{
        // ✅ FIX: data validation
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
        let roomKey = deleteThisid(socket.id);
        if(roomKey != undefined){
            console.log('🔌 Player disconnected from room:', roomKey.room);
            socket.to(roomKey.room).emit('user-disconnected', roomKey.key)
        }
        console.log('A client just got disconnected');
    });
});


//
///CUSTOM FUNCTIONS
//

//to randomise the color a player can get when he 'fetch'es.
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

//to delete the extra place when (only one) user refreshes.
function deleteThisid(id){
    for(var roomcd in rooms){
        if(rooms.hasOwnProperty(roomcd)){
            let ky = Object.keys(rooms[roomcd]).find( key => rooms[roomcd][key]['sid'] == id);
            if(typeof(ky) === 'string'){
                delete rooms[roomcd][ky];
                
                // ✅ FIX: خالی room کو delete کریں
                if(Object.keys(rooms[roomcd]).length == 0){
                    delete rooms[roomcd];
                    // ✅ FIX: cleanup win اور NumberOfMembers بھی
                    if(win[roomcd]) delete win[roomcd];
                    if(NumberOfMembers[roomcd]) delete NumberOfMembers[roomcd];
                }
                
                return {key:ky,room:roomcd};
            }
        }
    }
    return undefined;
}

// ✅ FIX: بہتر winner validation
function validateWinner(OBJ, socket){
    if(!win[OBJ.room]) win[OBJ.room] = {};
    
    // ✅ FIX: OBJ.reportedBy یا OBJ.player - واضح ہونا چاہیے
    let reportKey = OBJ.reportedBy !== undefined ? OBJ.reportedBy : OBJ.player;
    win[OBJ.room][reportKey] = {o: OBJ, s: socket.id};
    
    let roomPlayers = Object.keys(rooms[OBJ.room] || {});
    let reportCount = Object.keys(win[OBJ.room]).length;
    
    // سب players نے report کیا؟
    if(reportCount < roomPlayers.length) {
        console.log(`⏳ Waiting for winner confirmation: ${reportCount}/${roomPlayers.length} reports`);
        return false;
    }
    
    // سب کا winner ID ایک ہی ہونا چاہیے
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

//
///Routes management
//
app.use('/', rootRouter);
app.use('/ludo', ludoRouter);
app.use(function (req, res) {
    res.statusCode = 404;
    res.end('404!');
});

server.listen(PORT,()=>{
    console.log(`The server has started working on http://localhost:${PORT}`);
});