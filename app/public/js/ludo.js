let socket = io('/ludo', {
    reconnection: false
});
let _fetchDone = false;

const room_code = window.location.href.substring(window.location.href.length-6)
const USERNAMES = ['Green Warrior', 'Red Fire', 'Blue Fox', 'Yellow Rhino'];
const PIECES = [];
const colors = ["green","red","blue","yellow"];
let MYROOM = [];
let myid = -1;
let chance = Number(-1);
var PLAYERS = {};
let waitingForPieceClick = false; // FIX: multiple listeners سے بچاؤ
let gameOver = false;
let rankings  = []; // {id, rank}
let consecutiveSixes = 0; // لگاتار چھکے گنو
let _animSpirit = [];      // bounce animation والی گوٹیاں
let _animFrame  = null;    // animation frame id

var canvas = document.getElementById('theCanvas');
var ctx = canvas.getContext('2d');
canvas.height = 750;
canvas.width = 750;

// موبائل touch support - touch کو click میں بدلیں
canvas.addEventListener('touchstart', function(e){
    e.preventDefault();
    let touch = e.touches[0];
    let mouseEvent = new MouseEvent('click', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}, {passive: false});

let allPiecesePos = {
    0:[{x: 50,y:125},{x:125,y: 50},{x:200,y:125},{x:125,y:200}],
    1:[{x:500,y:125},{x:575,y: 50},{x:650,y:125},{x:575,y:200}],
    2:[{x:500,y:575},{x:575,y:500},{x:650,y:575},{x:575,y:650}],
    3:[{x: 50,y:575},{x:125,y:500},{x:200,y:575},{x:125,y:650}]
}

let homeTilePos = {
    0:{0:{x: 50,y:300},1:{x:300,y:100}},
    1:{0:{x:400,y: 50},1:{x:600,y:300}},
    2:{0:{x:650,y:400},1:{x:400,y:600}},
    3:{0:{x:300,y:650},1:{x:100,y:400}}
}

class Player{
    constructor(id){
        this.id = String(id);
        this.myPieces = new Object();
        for(let i=0;i<4;i++){
            this.myPieces[i] = new Piece(String(i),String(id));
        }
        this.won = parseInt(0);        
    }
    draw(){
        for(let i=0;i<4;i++){
            this.myPieces[i].draw();
        }
    }

    didIwin(){
        if(this.won == 4){
            return 1;
        }else{return 0;}
    }
}

class Piece{
    constructor(i,id){
        this.path = [];
        this.color_id = String(id);
        this.Pid = String(i);
        this.pos = -1;
        this.x = parseInt(allPiecesePos[this.color_id][this.Pid].x);
        this.y = parseInt(allPiecesePos[this.color_id][this.Pid].y);
        this.image = PIECES[this.color_id];
        switch(id){
            case '0':
                for(let i=0;i<4;i++){this.path.push(this.oneStepToRight)}
                this.path.push(this.oneStepTowards45);
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                this.path.push(this.oneStepTowards315)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToBottom)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                this.path.push(this.oneStepTowards225)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                this.path.push(this.oneStepTowards135)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                this.path.push(this.oneStepToTop)
                for(let i=0;i<6;i++){this.path.push(this.oneStepToRight)}
                break;
            case '1':
                for(let i=0;i<4;i++){this.path.push(this.oneStepToBottom)}
                this.path.push(this.oneStepTowards315)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToBottom)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                this.path.push(this.oneStepTowards225)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                this.path.push(this.oneStepTowards135)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                this.path.push(this.oneStepTowards45);
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                this.path.push(this.oneStepToRight)
                for(let i=0;i<6;i++){this.path.push(this.oneStepToBottom)}
                break;
            case '2':
                for(let i=0;i<4;i++){this.path.push(this.oneStepToLeft)}
                this.path.push(this.oneStepTowards225)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                this.path.push(this.oneStepTowards135)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                this.path.push(this.oneStepTowards45);
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                this.path.push(this.oneStepTowards315)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                this.path.push(this.oneStepToBottom)
                for(let i=0;i<6;i++){this.path.push(this.oneStepToLeft)}
                break;
            case '3':
                for(let i=0;i<4;i++){this.path.push(this.oneStepToTop)}
                this.path.push(this.oneStepTowards135)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                this.path.push(this.oneStepTowards45);
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                this.path.push(this.oneStepTowards315)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<2;i++)this.path.push(this.oneStepToBottom)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                this.path.push(this.oneStepTowards225)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                this.path.push(this.oneStepToLeft)
                for(let i=0;i<6;i++){this.path.push(this.oneStepToTop)}
                break;
        }
    }

    draw(){
        ctx.drawImage(this.image, this.x, this.y, 50, 50);
    }

    update(num){
        if(this.pos != -1 && this.pos+num<=56){

            for(let i=this.pos;i<this.pos+num;i++){
                this.path[i](this.color_id,this.Pid);            }
            this.pos += num;
            if(this.pos ==56){
                window.PLAYERS[this.color_id].won +=1;
            }

        }else if(num == 6 && this.pos == -1){
            this.x = homeTilePos[this.color_id][0].x
            this.y = homeTilePos[this.color_id][0].y
            this.pos = 0;
        }
    }

    oneStepToRight(id,pid){
        window.PLAYERS[id].myPieces[pid].x += 50;
    }

    oneStepToLeft(id,pid){
        window.PLAYERS[id].myPieces[pid].x -= 50;
    }

    oneStepToTop(id,pid){
        window.PLAYERS[id].myPieces[pid].y -= 50;
    }

    oneStepToBottom(id,pid){
        window.PLAYERS[id].myPieces[pid].y += 50;
    }

    oneStepTowards45(id,pid){
        window.PLAYERS[id].myPieces[pid].x += 50;
        window.PLAYERS[id].myPieces[pid].y -= 50;
    }

    oneStepTowards135(id,pid){
        window.PLAYERS[id].myPieces[pid].x -= 50;
        window.PLAYERS[id].myPieces[pid].y -= 50;
    }

    oneStepTowards225(id,pid){
        window.PLAYERS[id].myPieces[pid].x -= 50;
        window.PLAYERS[id].myPieces[pid].y += 50;
    }

    oneStepTowards315(id,pid){
        window.PLAYERS[id].myPieces[pid].x += 50;
        window.PLAYERS[id].myPieces[pid].y += 50;
    }

    kill(){
        this.x = allPiecesePos[this.color_id][this.Pid].x;
        this.y = allPiecesePos[this.color_id][this.Pid].y;
        this.pos = -1;  
    }
}

// ── سب socket listeners connect سے باہر ── ghost fix ✅
socket.on('imposter',()=>{window.location.replace("/error-imposter");});

socket.on('is-it-your-chance',function(data){
        waitingForPieceClick = false; // نئی باری - پرانی listener reset
        consecutiveSixes = 0; // نئی باری پر reset
        chance = Number(data); // پہلے chance update کرو
        if(Number(data) === Number(myid)){
            styleButton(1);
            outputMessage({Name:'your',id:Number(data)},4)
        }else{
            outputMessage({Name:USERNAMES[data]+"'s",id:data},4);
            // highlight other player corner
            for(let i=0;i<4;i++){
                let c=document.getElementById('corner-'+i);
                let d=document.getElementById('dice-'+i);
                let m=document.getElementById('cmsg-'+i);
                if(i===Number(data)){
                    if(c) c.classList.add('my-turn');
                    if(d){d.classList.remove('disabled');d.classList.add('active');}
                    if(m) m.textContent='⚡ باری!';
                } else {
                    if(c) c.classList.remove('my-turn');
                    if(d){d.classList.add('disabled');d.classList.remove('active');}
                    if(m) m.textContent='Waiting...';
                }
            }
        }
    });

    socket.on('new-user-joined',function(data){
        if(!MYROOM.includes(+data.id)) MYROOM.push(+data.id);
        // ترتیب وہی رکھو جو server نے دی — sort مت کرو!
        loadNewPiece(data.id);
        outputMessage({Name:USERNAMES[data.id],id:data.id},0);
        //stop timer,and hide modal.
        document.getElementById("myModal-2").style.display = "none";
        let butt = document.getElementById('WAIT');
        butt.disabled = false;
        butt.style.opacity =  1;
        butt.style.cursor = "pointer"
        clearInterval(window.timer);
    });

    socket.on('user-disconnected',function(data){
        outputMessage({Name:USERNAMES[data],id:data},6);
        resumeHandler(data);    
    })

    socket.on('resume',function(data){
        resume(data.id);
        data.id==data.click?outputMessage({id:data.id,msg:`Resumed the game without ${USERNAMES[data.id]}`},5):outputMessage({id:data.click,msg:`${USERNAMES[data.click]} has resumed the game without ${USERNAMES[data.id]}`},5)
    });

    socket.on('wait',function(data){
        wait();
        outputMessage({id:data.click,msg:`${USERNAMES[data.click]} has decided to wait`},5)
    });

    socket.on('rolled-dice',function(data){
        Number(data.id) != myid?outputMessage({Name:USERNAMES[data.id],Num:data.num,id:data.id},1):outputMessage({Name: 'you', Num:data.num, id:data.id},1);
        if(data.num !== undefined){
            let od = document.getElementById('dice-' + data.id);
            if(od){
                od.setAttribute('data-num', '0'); // گھومتے وقت نمبر چھپاؤ
                od.classList.add('rolling');
                setTimeout(()=>{
                    od.setAttribute('data-num', data.num);
                    od.classList.remove('rolling');
                    let cm = document.getElementById('cmsg-' + data.id);
                    if(cm) cm.textContent = '🎲 ' + data.num + ' آیا!';
                }, 350);
            }
        }
    });

    socket.on('Thrown-dice',async function(data){
        if(Number(data.id) !== myid){
            // دوسرے player کی گوٹی — slide کرتے ہوئے جائے
            var _fromX = PLAYERS[data.id].myPieces[data.pid].x;
            var _fromY = PLAYERS[data.id].myPieces[data.pid].y;
            PLAYERS[data.id].myPieces[data.pid].pos = data.pos;
            PLAYERS[data.id].myPieces[data.pid].x   = data.x;
            PLAYERS[data.id].myPieces[data.pid].y   = data.y;
            if(iKill(data.id,data.pid)){
                outputMessage({msg:'Oops got killed',id:data.id},5);
                if(window.LudoSound) LudoSound.kill();
            }
            _slidePiece(data.id, data.pid, _fromX, _fromY, data.x, data.y, function(){
                allPlayerHandler();
            });
        } else {
            // اپنی گوٹی — پہلے ہی چل چکی ہے، صرف kill check کرو
            if(iKill(data.id,data.pid)){
                outputMessage({msg:'Oops got killed',id:data.id},5);
                if(window.LudoSound) LudoSound.kill();
                allPlayerHandler();
            }
        }
        if(PLAYERS[data.id].didIwin()){
            socket.emit('WON',{
                room: data.room,
                id: data.id,
                player:myid
            });
        }
    });

    socket.on('rank-update', function(data){
        rankings.push({ id: data.id, rank: data.rank });
        showRankNotif(data.id, data.rank);
    });

    socket.on('winner',function(data){
        showFinalModal(data);
    });

socket.on('connect',function(){
    if(_fetchDone) return;
    _fetchDone = true;
    socket.emit('fetch',room_code,function(data,id){
        MYROOM = data.map(function(x){ return +x; }); // ترتیب وہی رکھو
        myid = id;
        StartTheGame();
    });
});

//To know if the client has disconnected with the server
socket.on('disconnect', function(){
})

//Output the message through DOM manipulation
function outputMessage(anObject,k){
    let msgBoard = document.querySelector('.msgBoard');

    if(k===1 && !(anObject.Name.includes('<') || anObject.Name.includes('>') || anObject.Name.includes('/'))){    
        const div = document.createElement('div');
        div.classList.add('message')
        div.innerHTML = `<p><strong>&#9733;  <span id="color-message-span1"style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.Name}</span></strong><span id="color-message-span2"> got a ${anObject.Num}</span></p>`;
        msgBoard.appendChild(div);
    }
    else if(k===0 && !(anObject.Name.includes('<') || anObject.Name.includes('>') || anObject.Name.includes('/'))){
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<p>&#8605;  <span id="color-message-span1"style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.Name}</span><span id="color-message-span2"> entered the game</span></p>`;
        msgBoard.appendChild(div);
    }
    else if(k===3){
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<span id="color-message-span2" style="text-shadow: 0 0 4px ${colors[myid]};">${anObject}!!</span>`
        msgBoard.appendChild(div);
    }
    else if(k===4){
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<p><span id="color-message-span2">Its </span><span id="color-message-span1"style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.Name}</span><span id="color-message-span2"> chance!!</span></p>`
        msgBoard.appendChild(div);
    }

    else if(k===5){
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<span id="color-message-span2" style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.msg}!!</span>`
        msgBoard.appendChild(div);
    }

    else if(k===6){
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<p>&#8605;  <span id="color-message-span1"style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.Name}</span><span id="color-message-span2"> just left the game</span></p>`;
        msgBoard.appendChild(div);
    }
    msgBoard.scrollTop = msgBoard.scrollHeight - msgBoard.clientHeight;
};

//button disabling-enabling
function styleButton(k){
    let butt = document.getElementById("randomButt");
    if(k===0){
        if(butt){ butt.classList.add('disabled'); butt.classList.remove('active'); }
        // corner dice: disable MY corner
        let myCorner = document.getElementById('corner-' + myid);
        let myDice   = document.getElementById('dice-'   + myid);
        let myCmsg   = document.getElementById('cmsg-'   + myid);
        if(myCorner) myCorner.classList.remove('my-turn');
        if(myDice)  { myDice.classList.add('disabled'); myDice.classList.remove('active'); }
        if(myCmsg)   myCmsg.textContent = 'Waiting...';
    }
    else if(k===1){
        if(butt){ butt.classList.remove('disabled'); butt.classList.add('active'); }
        // corner dice: activate MY corner, deactivate rest
        for(let i=0;i<4;i++){
            let c = document.getElementById('corner-' + i);
            let d = document.getElementById('dice-'   + i);
            let m = document.getElementById('cmsg-'   + i);
            if(i === myid){
                if(c) c.classList.add('my-turn');
                if(d){ d.classList.remove('disabled'); d.classList.add('active'); }
                if(m) m.textContent = '⚡ آپ کی باری!';
            } else {
                if(c) c.classList.remove('my-turn');
                if(d){ d.classList.add('disabled'); d.classList.remove('active'); }
                if(m) m.textContent = 'Waiting...';
            }
        }
    }
}

// Update dice face
function updateDice(num){

    // corner dice: update MY corner face
    let myDice = document.getElementById('dice-' + myid);
    if(myDice){
        myDice.setAttribute('data-num', '0'); // گھومتے وقت نمبر چھپاؤ
        myDice.classList.add('rolling');
        setTimeout(()=>{
            myDice.setAttribute('data-num', num);
            myDice.classList.remove('rolling');
            let myCmsg = document.getElementById('cmsg-' + myid);
            if(myCmsg) myCmsg.textContent = '🎲 ' + num + ' آیا!';
        }, 350);
    }
}

//simulates the action of dice and also chance rotation.
function diceAction(){
    if(gameOver) return;
    socket.emit('roll-dice',{room:room_code,id:myid},function(num){
        if(window.LudoSound) LudoSound.dice();
        updateDice(num);

        // تین لگاتار چھکے چیک کریں
        if(num === 6){
            consecutiveSixes++;
            if(consecutiveSixes >= 3){
                consecutiveSixes = 0;
                outputMessage({msg:'تین چھکے! باری ختم', id:myid}, 5);
                styleButton(0);
                socket.emit('chance',{room: room_code, nxt_id: chanceRotation(myid, 0)});
                return;
            }
            // چھکا آیا — پہلے باری confirm کرو، پھر گوٹی چنو
            outputMessage({msg:'چھکا! دوبارہ باری ملی 🎲', id:myid}, 3);
        } else {
            consecutiveSixes = 0;
        }
        // BUG FIX 3: spirit includes movable pieces
        // - pos>-1: گوٹی باہر ہے اور آگے جا سکتی ہے
        // - pos==-1 && num==6: گوٹی گھر میں ہے، چھکے سے نکل سکتی ہے
        let spirit = [];
        for(let i=0;i<4;i++){
            let piece = PLAYERS[myid].myPieces[i];
            if(piece.pos > -1 && piece.pos + num <= 56){
                spirit.push(i); // باہر والی گوٹی آگے جا سکتی ہے
            } else if(piece.pos === -1 && num === 6){
                spirit.push(i); // گھر والی گوٹی چھکے سے نکلے گی
            }
        }
        if(spirit.length != 0){
            // FIX: اگر پہلے سے listener لگی ہے تو دوبارہ مت لگاؤ
            if(waitingForPieceClick) return;
            waitingForPieceClick = true;
            _startBounce(spirit); // bounce animation شروع
            outputMessage({msg:'گوٹی پر کلک کریں!', id:myid},3)
            canvas.addEventListener('click',function clickHandler(e){
                let rect = e.target.getBoundingClientRect();
                // موبائل پر canvas CSS سے چھوٹا ہوتا ہے - scale factor لگاؤ
                let scaleX = canvas.width  / rect.width;
                let scaleY = canvas.height / rect.height;
                let Xp = (e.clientX - rect.left) * scaleX;
                let Yp = (e.clientY - rect.top)  * scaleY;
                let playerObj = {
                    room: room_code,
                    id: myid,
                    num: num
                }
                for(let i=0;i<4;i++){
                    if(Xp-PLAYERS[myid].myPieces[i].x<45 && Xp-PLAYERS[myid].myPieces[i].x>0 && Yp-PLAYERS[myid].myPieces[i].y<45 && Yp-PLAYERS[myid].myPieces[i].y>0){
                        let piece = PLAYERS[myid].myPieces[i];
                        let canMove = spirit.includes(i) && (
                            (piece.pos === -1 && num === 6) ||          // گھر سے نکلے گی
                            (piece.pos > -1 && piece.pos + num <= 56)   // آگے جا سکتی ہے
                        );
                        if(canMove){
                            playerObj['pid'] = i;
                            _stopBounce(); // bounce بند

                            // آواز — چھکے پر six sound، باقی animation میں ٹپ ٹپ
                            if(window.LudoSound){
                                if(num === 6 && PLAYERS[myid].myPieces[i].pos === -1) LudoSound.six();
                            }

                            // پرانی position یاد رکھو
                            var fromX = PLAYERS[myid].myPieces[i].x;
                            var fromY = PLAYERS[myid].myPieces[i].y;

                            // update چلاؤ — نئی x,y,pos بدلے
                            PLAYERS[myid].myPieces[i].update(num);

                            // نئی position
                            var toX = PLAYERS[myid].myPieces[i].x;
                            var toY = PLAYERS[myid].myPieces[i].y;

                            // server کو بھیجو
                            playerObj['pos'] = PLAYERS[myid].myPieces[i].pos;
                            playerObj['x']   = toX;
                            playerObj['y']   = toY;
                            // پہلے kill check کرو — update کے بعد فوری
                            var killed  = iKill(myid, i);
                            var reached = PLAYERS[myid].myPieces[i].pos === 56;

                            socket.emit('random', playerObj, function(data){
                                styleButton(0);
                                var nextId = (killed || reached) ? myid : chanceRotation(myid, data);
                                socket.emit('chance',{room: room_code, nxt_id: nextId});
                            });

                            // sliding animation — پرانی سے نئی جگہ
                            _slidePiece(myid, i, fromX, fromY, toX, toY, function(){
                                allPlayerHandler();
                            });

                            canvas.removeEventListener('click',clickHandler);
                            waitingForPieceClick = false;
                            return 0;
                        }// غلط گوٹی — کچھ نہ کرو
                    }
        
                }
                // غلط جگہ — کچھ نہ کرو
            })
        } else {
            // کوئی گوٹی نہیں چل سکتی - اگلے کی باری
            waitingForPieceClick = false;
            _stopBounce();
            socket.emit('chance',{room: room_code, nxt_id: chanceRotation(myid,num)});
        }
    })
}

//Initialise the game with the one who created the room.
function StartTheGame(){

    MYROOM.forEach(function(numb){
        numb==myid?outputMessage({Name:'You',id:numb},0):outputMessage({Name:USERNAMES[numb],id:numb},0)
    });
    document.getElementById('my-name').innerHTML += USERNAMES[myid]; //my-name
    if(typeof initShare === 'function') initShare();
    let copyText = `\n\nMy room:\n${window.location.href} \nor join the room via\nMy room code:${room_code}`
    document.getElementById('copy').innerHTML += copyText;
    if(MYROOM.length === 1){
        chance = Number(myid);
        styleButton(1);
    }else{
        // جو پہلے سے chance ہے اگر میں ہوں تو activate کرو
        if(Number(chance) === Number(myid)){
            styleButton(1);
        } else {
            styleButton(0);
        }
    }
    loadAllPieces();

    // Wire corner dice click → diceAction (only MY corner, only when active)
    for(let i=0;i<4;i++){
        let cd = document.getElementById('dice-' + i);
        if(cd){
            cd.addEventListener('click', function(){
                if(this.classList.contains('disabled')) return;
                if(Number(this.dataset.playerid || i) !== myid && i !== myid) return;
                styleButton(0);
                diceAction();
            });
            cd.dataset.playerid = i;
        }
    }
}

//Load all the images of the pieces
function loadAllPieces(){
    let cnt = 0;
    for(let i=0;i<colors.length;i++){
        let img = new Image();
        img.src = "../images/pieces/"+colors[i]+".png";
        img.onload = ()=>{
            ++cnt;
            if(cnt >= colors.length){
                //all images are loaded
                for(let j=0;j<MYROOM.length;j++){
                    PLAYERS[MYROOM[j]] = new Player(MYROOM[j]);
                }
                allPlayerHandler();
            }
        }
        PIECES.push(img);
    }
}

// BUG FIX 1: chance rotation - use indexOf not chance as index
// باری order گھڑی کی سوئی: Yellow(3) → Green(0) → Red(1) → Blue(2)
const TURN_ORDER = [3, 0, 1, 2];

function chanceRotation(id, num){
    if(num == 6){
        return id; // چھکا - دوبارہ اسی کی باری
    } else {
        // TURN_ORDER میں سے صرف active players فلٹر کرو
        let activeTurns = TURN_ORDER.filter(p => MYROOM.includes(p));
        let currentIndex = activeTurns.indexOf(Number(id));
        if(currentIndex === -1) currentIndex = 0;
        let nextIndex = (currentIndex + 1) % activeTurns.length;
        return activeTurns[nextIndex];
    }
}

//draws 4 x 4 = 16 pieces per call
// ── sliding animation ──
function _slidePiece(colorId, pid, fromX, fromY, toX, toY, onDone) {
    var piece = window.PLAYERS[colorId].myPieces[pid];
    piece.x = fromX;
    piece.y = fromY;

    var totalSteps = Math.round((Math.abs(toX - fromX) + Math.abs(toY - fromY)) / 50);
    if (totalSteps === 0) { if (onDone) onDone(); return; }

    var stepDx = (toX - fromX) / totalSteps;
    var stepDy = (toY - fromY) / totalSteps;
    var current = 0;

    var interval = setInterval(function() {
        if (current >= totalSteps) {
            clearInterval(interval);
            piece.x = toX;
            piece.y = toY;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < MYROOM.length; i++) PLAYERS[MYROOM[i]].draw();
            if (onDone) onDone();
            return;
        }
        piece.x = Math.round(fromX + stepDx * (current + 1));
        piece.y = Math.round(fromY + stepDy * (current + 1));
        if (window.LudoSound) LudoSound.move();
        current++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var j = 0; j < MYROOM.length; j++) PLAYERS[MYROOM[j]].draw();
    }, 120);
}

// ── bounce animation ──
function _startBounce(spiritArr) {
    _animSpirit = spiritArr;
    if(_animFrame) cancelAnimationFrame(_animFrame);
    _animLoop();
}

function _stopBounce() {
    _animSpirit = [];
    if(_animFrame) cancelAnimationFrame(_animFrame);
    _animFrame = null;
    allPlayerHandler(); // آخری بار draw کرو
}

function _animLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // سب گوٹیاں draw کرو
    for(let i = 0; i < Object.keys(PLAYERS).length; i++){
        PLAYERS[MYROOM[i]].draw();
    }

    // spirit والی گوٹیاں scale + glow
    let t = Date.now();
    _animSpirit.forEach(function(pid) {
        let piece = PLAYERS[myid].myPieces[pid];
        let scale = 1 + Math.sin(t / 200) * 0.15; // 1.0 سے 1.15 تک
        let size  = 50 * scale;
        let offset = (size - 50) / 2; // مرکز میں رکھو

        // glow ring
        ctx.save();
        ctx.shadowBlur  = 20;
        ctx.shadowColor = 'gold';
        ctx.strokeStyle = 'gold';
        ctx.lineWidth   = 3;
        ctx.globalAlpha = 0.6 + Math.sin(t / 200) * 0.4;
        ctx.beginPath();
        ctx.arc(piece.x + 25, piece.y + 25, 28 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // گوٹی scale کے ساتھ — وہیں پر
        ctx.drawImage(piece.image, piece.x - offset, piece.y - offset, size, size);
    });

    _animFrame = requestAnimationFrame(_animLoop);
}

function allPlayerHandler(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0;i<Object.keys(PLAYERS).length;i++){
        PLAYERS[MYROOM[i]].draw();
    }

}

//Load a new Player instance
function loadNewPiece(id){
if(PLAYERS[id]) return;
    PLAYERS[id] = new Player(id);
    allPlayerHandler();
}

function iKill(id,pid){
    let boss = PLAYERS[id].myPieces[pid];
    for(let i=0;i<MYROOM.length;i++){
        for(let j=0;j<4;j++){
            if(MYROOM[i]!=id && boss.x == PLAYERS[MYROOM[i]].myPieces[j].x && boss.y == PLAYERS[MYROOM[i]].myPieces[j].y){
                if(!inAhomeTile(id,pid)){
                    PLAYERS[MYROOM[i]].myPieces[j].kill();
                    return 1;
                }
            }
        }
    }
    return 0;
}

function inAhomeTile(id,pid){
    const safeTiles = [
        {x:50,  y:300}, {x:300, y:100},
        {x:400, y:50},  {x:600, y:300},
        {x:650, y:400}, {x:400, y:600},
        {x:300, y:650}, {x:100, y:400}
    ];
    let px = PLAYERS[id].myPieces[pid].x;
    let py = PLAYERS[id].myPieces[pid].y;
    return safeTiles.some(t => t.x === px && t.y === py);
}

// rank notification — ہر بار جب کوئی گھر پہنچے
function showRankNotif(id, rank) {
    var medals = ['🥇','🥈','🥉','🏳️'];
    var medal  = medals[rank - 1] || '🏳️';
    var color  = ["green","red","blue","yellow"][id];
    var name   = USERNAMES[id];
    var txt    = rank === 1 ? 'پہلا نمبر! 🎉' : rank === 2 ? 'دوسرا نمبر' : rank === 3 ? 'تیسرا نمبر' : 'چوتھا نمبر 😢';

    // چھوٹا notification بیچ میں
    var notif = document.createElement('div');
    notif.className = 'rank-notif-center';
    notif.innerHTML = `<span class="rnc-medal">${medal}</span>
        <span class="rnc-name" style="color:${color}">${name}</span>
        <span class="rnc-txt">${txt}</span>`;
    document.body.appendChild(notif);

    setTimeout(function(){ notif.classList.add('rnc-hide'); }, 1800);
    setTimeout(function(){ if(notif.parentNode) notif.parentNode.removeChild(notif); }, 2500);

    if(window.LudoSound){ rank === 1 ? LudoSound.win() : LudoSound.move(); }
}

// آخری modal — مکمل ranking
function showFinalModal(winnerId) {
    gameOver = true;
    waitingForPieceClick = false;
    _stopBounce();
    styleButton(0);
    if(window.LudoSound) LudoSound.win();

    var modal = document.getElementById('rank-modal');
    var list  = document.getElementById('rank-list');
    var medals = ['🥇','🥈','🥉','🏳️'];
    var rankTxt = ['پہلا نمبر 🎉','دوسرا نمبر','تیسرا نمبر','چوتھا نمبر 😢'];
    list.innerHTML = '';

    // ranking کے حساب سے sort
    var sorted = [...rankings].sort(function(a,b){ return a.rank - b.rank; });
    sorted.forEach(function(r){
        var color = ["green","red","blue","yellow"][r.id];
        var li = document.createElement('div');
        li.className = 'rank-row rank-row-' + r.rank;
        li.innerHTML = `<span class="rank-medal">${medals[r.rank-1]||'🏳️'}</span>
            <div class="rank-info">
                <span class="rank-player" style="color:${color}">${USERNAMES[r.id]}</span>
                <span class="rank-pos-txt">${rankTxt[r.rank-1]||''}</span>
            </div>`;
        list.appendChild(li);
    });

    // 1 سیکنڈ بعد modal دکھاؤ
    setTimeout(function(){
        modal.style.display = 'flex';
        _confetti();
    }, 1000);
}

// confetti animation
function _confetti(){
    var colors = ['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7'];
    for(var i = 0; i < 80; i++){
        (function(i){
            setTimeout(function(){
                var c = document.createElement('div');
                c.className = 'confetti-piece';
                c.style.cssText = `left:${Math.random()*100}vw;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${1.5+Math.random()*2}s;animation-delay:${Math.random()*0.5}s;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;`;
                document.body.appendChild(c);
                setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); }, 4000);
            }, i * 30);
        })(i);
    }
}

function showModal(id){ showFinalModal(id); }

async function copyhandler() {
    var copyText = document.getElementById("copy").innerHTML;
    await navigator.clipboard.writeText(copyText);
    
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copied!!";
}
  
function outFunc() {
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copy to clipboard";
}

async function copyhandlerLink() {
    var copyText = window.location.href;
    await navigator.clipboard.writeText(copyText);
    
    var tooltip = document.getElementById("myTooltipLink");
    tooltip.innerHTML = "Copied!!";
}
  
function outFuncLink() {
    var tooltip = document.getElementById("myTooltipLink");
    tooltip.innerHTML = "Copy room link to clipboard";
}

function resumeHandler(id){
    document.getElementById("myModal-2").style.display = "block";
    //who left+timer!
    let theOneWhoLeft = document.getElementById('theOneWhoLeft');
    let seconds = document.getElementById('seconds');
    let i = 10
    theOneWhoLeft.innerHTML = USERNAMES[id]
    theOneWhoLeft.style.textShadow = `0 0 4px ${colors[id]}`;
    document.getElementById('RESUME').onclick = function(){
        resume(id);
        socket.emit('resume',{
            room:room_code,
            id:id,
            click:myid
        },function(){
            outputMessage({id:myid,msg:`You have resumed the game without ${USERNAMES[id]}`},5);
            if(chance==id){
                socket.emit('chance',{room: room_code, nxt_id: chanceRotation(id,0)});
            }
        });

    };
    document.getElementById('WAIT').onclick = function(){
        wait();
        socket.emit('wait',{
            room:room_code,
            click:myid
        },function(){
            outputMessage({id:myid,msg:`You have decided to wait`},5)
        });

    };
    window.timer = setInterval(function(){
        i-=1;
        seconds.innerHTML = ` in ${i}`;
        if(i==0){
            resume(id);
            socket.emit('resume',{
                room:room_code,
                id:id,
                click:id
            },function(){
                outputMessage({id:id,msg:`Resumed the game without ${USERNAMES[id]}`},5);
                if(chance==id){
                    socket.emit('chance',{room: room_code, nxt_id: chanceRotation(id,0)});
                }
            });

        }
    }, 1000)
}

function resume(id){
    document.getElementById("myModal-2").style.display = "none";
    clearInterval(timer);
    let idx = MYROOM.indexOf(Number(id));
    if(idx !== -1) MYROOM.splice(idx, 1);
    delete PLAYERS[id];
    allPlayerHandler();
}

function wait(){
    clearInterval(timer);
    document.getElementById('seconds').innerHTML = '';
    let butt = document.getElementById('WAIT');
    butt.disabled = true;
    butt.style.opacity =  0.6;
    butt.style.cursor = "not-allowed"
}