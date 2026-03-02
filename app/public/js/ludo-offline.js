// =====================================================
// LUDO OFFLINE MODE - ایک موبائل پر باری باری کھیلو
// =====================================================

const USERNAMES = ['Green Warrior', 'Red Fire', 'Blue Fox', 'Yellow Rhino'];
const COLORS    = ['green', 'red', 'blue', 'yellow'];
const COLOR_HEX = ['#27ae60', '#e74c3c', '#2980b9', '#f1c40f'];
const PIECES    = [];

const PASS_ICONS = ['🟢','🔴','🔵','🟡'];

let MYROOM   = [];   // active players e.g. [0,1,2,3]
let chance   = 0;
let PLAYERS  = {};
let waitingForPieceClick = false;
let totalPlayers = 4;

var canvas = document.getElementById('theCanvas');
var ctx    = canvas.getContext('2d');
canvas.height = 750;
canvas.width  = 750;

canvas.addEventListener('touchstart', function(e){
    e.preventDefault();
    let touch = e.touches[0];
    canvas.dispatchEvent(new MouseEvent('click', { clientX: touch.clientX, clientY: touch.clientY }));
}, {passive: false});

let allPiecesePos = {
    0:[{x: 50,y:125},{x:125,y: 50},{x:200,y:125},{x:125,y:200}],
    1:[{x:500,y:125},{x:575,y: 50},{x:650,y:125},{x:575,y:200}],
    2:[{x:500,y:575},{x:575,y:500},{x:650,y:575},{x:575,y:650}],
    3:[{x: 50,y:575},{x:125,y:500},{x:200,y:575},{x:125,y:650}]
};

let homeTilePos = {
    0:{0:{x: 50,y:300},1:{x:300,y:100}},
    1:{0:{x:400,y: 50},1:{x:600,y:300}},
    2:{0:{x:650,y:400},1:{x:400,y:600}},
    3:{0:{x:300,y:650},1:{x:100,y:400}}
};

// ── Player & Piece classes (same as online) ──

class Player {
    constructor(id){
        this.id = String(id);
        this.myPieces = {};
        for(let i=0;i<4;i++) this.myPieces[i] = new Piece(String(i), String(id));
        this.won = 0;
    }
    draw(){
        for(let i=0;i<4;i++) this.myPieces[i].draw();
    }
    didIwin(){ return this.won == 4 ? 1 : 0; }
}

class Piece {
    constructor(i, id){
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
        if(this.pos != -1 && this.pos + num <= 56){
            for(let i=this.pos; i<this.pos+num; i++) this.path[i](this.color_id, this.Pid);
            this.pos += num;
            if(this.pos == 56) window.PLAYERS[this.color_id].won += 1;
        } else if(num == 6 && this.pos == -1){
            this.x = homeTilePos[this.color_id][0].x;
            this.y = homeTilePos[this.color_id][0].y;
            this.pos = 0;
        }
    }

    oneStepToRight(id,pid){ window.PLAYERS[id].myPieces[pid].x += 50; }
    oneStepToLeft(id,pid) { window.PLAYERS[id].myPieces[pid].x -= 50; }
    oneStepToTop(id,pid)  { window.PLAYERS[id].myPieces[pid].y -= 50; }
    oneStepToBottom(id,pid){ window.PLAYERS[id].myPieces[pid].y += 50; }
    oneStepTowards45(id,pid) { window.PLAYERS[id].myPieces[pid].x += 50; window.PLAYERS[id].myPieces[pid].y -= 50; }
    oneStepTowards135(id,pid){ window.PLAYERS[id].myPieces[pid].x -= 50; window.PLAYERS[id].myPieces[pid].y -= 50; }
    oneStepTowards225(id,pid){ window.PLAYERS[id].myPieces[pid].x -= 50; window.PLAYERS[id].myPieces[pid].y += 50; }
    oneStepTowards315(id,pid){ window.PLAYERS[id].myPieces[pid].x += 50; window.PLAYERS[id].myPieces[pid].y += 50; }

    kill(){
        this.x = allPiecesePos[this.color_id][this.Pid].x;
        this.y = allPiecesePos[this.color_id][this.Pid].y;
        this.pos = -1;
    }
}

// ── Game init from player select ──

function startOffline(numPlayers){
    totalPlayers = numPlayers;
    // Use first N players: 0=green,1=red,2=blue,3=yellow
    MYROOM = [];
    for(let i=0;i<numPlayers;i++) MYROOM.push(i);
    document.getElementById('player-select-modal').style.display = 'none';
    loadAllPieces();
}

function loadAllPieces(){
    let cnt = 0;
    for(let i=0;i<COLORS.length;i++){
        let img = new Image();
        img.src = '../images/pieces/' + COLORS[i] + '.png';
        img.onload = () => {
            ++cnt;
            if(cnt >= COLORS.length){
                for(let j=0;j<MYROOM.length;j++) PLAYERS[MYROOM[j]] = new Player(MYROOM[j]);
                chance = MYROOM[0];
                allPlayerHandler();
                activateChance(chance);
                // Wire corner dice
                for(let i=0;i<4;i++){
                    let cd = document.getElementById('dice-' + i);
                    if(cd){
                        cd.addEventListener('click', function(){
                            if(this.classList.contains('disabled')) return;
                            if(Number(this.dataset.pid) !== chance) return;
                            offlineDiceAction();
                        });
                        cd.dataset.pid = i;
                    }
                }
                outputMessage('🎮 گیم شروع! ' + USERNAMES[chance] + ' پہلے کھیلے گا', 'server');
            }
        };
        PIECES.push(img);
    }
}

// ── Dice ──

function rollDice(){
    return Math.floor(Math.random() * 6) + 1;
}

function offlineDiceAction(){
    if(waitingForPieceClick) return;
    let num = rollDice();
    if(window.LudoSound) LudoSound.dice();
    updateDiceUI(chance, num);
    outputMessage(USERNAMES[chance] + ' کو ' + num + ' آیا! 🎲', chance);

    let spirit = [];
    for(let i=0;i<4;i++){
        let piece = PLAYERS[chance].myPieces[i];
        if(piece.pos > -1 && piece.pos + num <= 56) spirit.push(i);
        else if(piece.pos === -1 && num === 6) spirit.push(i);
    }

    if(spirit.length === 0){
        // no move possible
        outputMessage('کوئی گوٹی نہیں چل سکتی!', 'server');
        setTimeout(() => nextTurn(num), 800);
        return;
    }

    waitingForPieceClick = true;
    outputMessage('گوٹی کو چھوئیں', 'server');

    canvas.addEventListener('click', function clickHandler(e){
        let rect = e.target.getBoundingClientRect();
        let scaleX = canvas.width  / rect.width;
        let scaleY = canvas.height / rect.height;
        let Xp = (e.clientX - rect.left) * scaleX;
        let Yp = (e.clientY - rect.top)  * scaleY;

        for(let i=0;i<4;i++){
            let px = PLAYERS[chance].myPieces[i].x;
            let py = PLAYERS[chance].myPieces[i].y;
            if(Xp-px<50 && Xp-px>0 && Yp-py<50 && Yp-py>0){
                let piece = PLAYERS[chance].myPieces[i];
                let canMove = spirit.includes(i) && (
                    (piece.pos === -1 && num === 6) ||
                    (piece.pos > -1 && piece.pos + num <= 56)
                );
                if(canMove){
                    PLAYERS[chance].myPieces[i].update(num);
                    if(window.LudoSound) LudoSound.move();
                    iKill(chance, i);
                    allPlayerHandler();
                    canvas.removeEventListener('click', clickHandler);
                    waitingForPieceClick = false;
                    // check win
                    if(PLAYERS[chance].didIwin()){
                        showWin(chance);
                        return;
                    }
                    setTimeout(() => nextTurn(num), 400);
                    return;
                } else {
                    outputMessage('یہ گوٹی نہیں چل سکتی!', 'server');
                    return;
                }
            }
        }
        outputMessage('اپنے رنگ کی گوٹی کو چھوئیں', 'server');
    });
}

// ── Turn management ──

function nextTurn(lastNum){
    deactivateAll();
    let nextId;
    if(lastNum === 6){
        // چھکا — دوبارہ اسی کی باری
        nextId = chance;
        if(window.LudoSound) LudoSound.six();
        outputMessage(USERNAMES[nextId] + ' کو چھکا ملا — دوبارہ باری! 🎉', 'server');
        activateChance(nextId);
    } else {
        let idx = MYROOM.indexOf(chance);
        nextId = MYROOM[(idx + 1) % MYROOM.length];
        chance = nextId;
        // Pass screen دکھاؤ
        showPassScreen(nextId);
    }
}

function activateChance(id){
    chance = id;
    deactivateAll();
    let corner = document.getElementById('corner-' + id);
    let dice   = document.getElementById('dice-'   + id);
    let cmsg   = document.getElementById('cmsg-'   + id);
    if(corner) corner.classList.add('my-turn');
    if(dice)  { dice.classList.remove('disabled'); dice.classList.add('active'); }
    if(cmsg)   cmsg.textContent = '⚡ آپ کی باری!';
}

function deactivateAll(){
    for(let i=0;i<4;i++){
        let c = document.getElementById('corner-' + i);
        let d = document.getElementById('dice-'   + i);
        let m = document.getElementById('cmsg-'   + i);
        if(c) c.classList.remove('my-turn');
        if(d){ d.classList.add('disabled'); d.classList.remove('active'); }
        if(m) m.textContent = 'Waiting...';
    }
}

// ── Pass Screen ──

function showPassScreen(nextId){
    let screen = document.getElementById('pass-screen');
    let nameEl = document.getElementById('pass-name');
    let iconEl = document.getElementById('pass-icon');
    let btn    = document.getElementById('pass-btn');

    nameEl.textContent  = USERNAMES[nextId];
    nameEl.style.color  = COLOR_HEX[nextId];
    iconEl.textContent  = PASS_ICONS[nextId];
    btn.style.background = COLOR_HEX[nextId];
    btn.style.color = '#fff';

    screen.classList.add('show');
}

function hidePasScreen(){
    document.getElementById('pass-screen').classList.remove('show');
    activateChance(chance);
    outputMessage(USERNAMES[chance] + ' کی باری ہے!', chance);
}

// ── Win ──

function showWin(id){
    if(window.LudoSound) LudoSound.win();
    deactivateAll();
    let modal = document.getElementById('win-modal');
    document.getElementById('win-text').innerHTML =
        PASS_ICONS[id] + ' ' + USERNAMES[id] + ' جیت گیا! 🏆';
    document.getElementById('win-text').style.color = COLOR_HEX[id];
    modal.style.display = 'block';
}

// ── Kill logic ──

function iKill(id, pid){
    let boss = PLAYERS[id].myPieces[pid];
    for(let i=0;i<MYROOM.length;i++){
        for(let j=0;j<4;j++){
            if(MYROOM[i] != id && boss.x == PLAYERS[MYROOM[i]].myPieces[j].x && boss.y == PLAYERS[MYROOM[i]].myPieces[j].y){
                if(!inAhomeTile(id,pid)){
                    PLAYERS[MYROOM[i]].myPieces[j].kill();
                    if(window.LudoSound) LudoSound.kill();
                    outputMessage('💀 ' + USERNAMES[id] + ' نے ' + USERNAMES[MYROOM[i]] + ' کی گوٹی مار دی!', 'server');
                    return 1;
                }
            }
        }
    }
    return 0;
}

function inAhomeTile(id, pid){
    for(let i=0;i<4;i++){
        if((PLAYERS[id].myPieces[pid].x == homeTilePos[i][0].x && PLAYERS[id].myPieces[pid].y == homeTilePos[i][0].y) ||
           (PLAYERS[id].myPieces[pid].x == homeTilePos[i][1].x && PLAYERS[id].myPieces[pid].y == homeTilePos[i][1].y)){
            return true;
        }
    }
    return false;
}

// ── Draw all players ──

function allPlayerHandler(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0;i<MYROOM.length;i++) PLAYERS[MYROOM[i]].draw();
}

// ── UI helpers ──

function updateDiceUI(id, num){
    let d = document.getElementById('dice-' + id);
    if(d){
        d.classList.add('rolling');
        setTimeout(()=>{ d.setAttribute('data-num', num); d.classList.remove('rolling'); }, 500);
    }
    let m = document.getElementById('cmsg-' + id);
    if(m) setTimeout(()=>{ m.textContent = '🎲 ' + num + ' آیا!'; }, 500);
}

function outputMessage(msg, who){
    let board = document.querySelector('.msgBoard');
    let div = document.createElement('div');
    div.classList.add(who === 'server' ? 'messageFromServer' : 'message');
    let color = (typeof who === 'number') ? COLOR_HEX[who] : '#aaa';
    div.innerHTML = `<p style="text-shadow: 0 0 6px ${color}">${msg}</p>`;
    board.appendChild(div);
    board.scrollTop = board.scrollHeight;
}
