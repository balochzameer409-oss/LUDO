// =====================================================
// LUDO OFFLINE MODE - ایک موبائل پر باری باری کھیلو
// =====================================================

const USERNAMES = ['Green Warrior', 'Red Fire', 'Blue Fox', 'Yellow Rhino'];
const COLORS    = ['green', 'red', 'blue', 'yellow'];
const COLOR_HEX = ['#27ae60', '#e74c3c', '#2980b9', '#f1c40f'];
const PIECES    = [];
const PASS_ICONS = ['🟢','🔴','🔵','🟡'];

let MYROOM   = [];
let chance   = 0;
let PLAYERS  = {};
let waitingForPieceClick = false;
let totalPlayers = 4;

var canvas = document.getElementById('theCanvas');
var ctx    = canvas.getContext('2d');
canvas.height = 750;
canvas.width  = 750;

// ── FIX 1: Touch کو صحیح canvas coordinates میں بدلو ──
// Touch handler - صرف touchstart، click event نہیں چلاتے
canvas.addEventListener('touchstart', function(e){
    e.preventDefault();
    let touch = e.touches[0];
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width  / rect.width;
    let scaleY = canvas.height / rect.height;
    let x = (touch.clientX - rect.left) * scaleX;
    let y = (touch.clientY - rect.top)  * scaleY;
    handleCanvasInput(x, y);
}, {passive: false});

// Desktop mouse click
canvas.addEventListener('click', function(e){
    // touch نے پہلے ہی handle کر لیا ہوگا
    if(canvas._justTouched){ canvas._justTouched = false; return; }
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width  / rect.width;
    let scaleY = canvas.height / rect.height;
    let x = (e.clientX - rect.left) * scaleX;
    let y = (e.clientY - rect.top)  * scaleY;
    handleCanvasInput(x, y);
});

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

class Player {
    constructor(id){
        this.id = String(id);
        this.myPieces = {};
        for(let i=0;i<4;i++) this.myPieces[i] = new Piece(String(i), String(id));
        this.won = 0;
    }
    draw(){ for(let i=0;i<4;i++) this.myPieces[i].draw(); }
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

    draw(){ ctx.drawImage(this.image, this.x, this.y, 50, 50); }

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

    oneStepToRight(id,pid) { window.PLAYERS[id].myPieces[pid].x += 50; }
    oneStepToLeft(id,pid)  { window.PLAYERS[id].myPieces[pid].x -= 50; }
    oneStepToTop(id,pid)   { window.PLAYERS[id].myPieces[pid].y -= 50; }
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

// ── Game init ──

// موبائل پر پہلی touch سے آواز unlock
document.addEventListener('touchstart', function unlockAudio(){
    if(window.LudoSound) LudoSound.unlock();
    document.removeEventListener('touchstart', unlockAudio);
}, {once: true});

function startOffline(numPlayers){
    totalPlayers = numPlayers;
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
                for(let i=0;i<4;i++){
                    let cd = document.getElementById('dice-' + i);
                    if(cd){
                        cd.addEventListener('click', function(){
                            if(this.classList.contains('disabled')) return;
                            if(Number(this.dataset.pid) !== chance) return;
                                if(window.LudoSound){ LudoSound.unlock(); }
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

function rollDice(){ return Math.floor(Math.random() * 6) + 1; }

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
        outputMessage('کوئی گوٹی نہیں چل سکتی!', 'server');
        setTimeout(() => nextTurn(num), 800);
        return;
    }

    waitingForPieceClick = true;
    outputMessage('گوٹی کو چھوئیں', 'server');

    waitingForPieceClick = true;
}

// ── مرکزی input handler — touch اور mouse دونوں یہاں آتے ہیں ──
function handleCanvasInput(Xp, Yp){
    if(!waitingForPieceClick) return;
    let num    = canvas._pendingNum;
    let spirit = canvas._pendingSpirit;
    if(num === undefined) return;

    for(let i=0;i<4;i++){
        let px = PLAYERS[chance].myPieces[i].x;
        let py = PLAYERS[chance].myPieces[i].y;
        // ہر طرف 5px extra tolerance دیں
        if(Xp >= px-5 && Xp <= px+55 && Yp >= py-5 && Yp <= py+55){
            let piece = PLAYERS[chance].myPieces[i];
            let canMove = spirit.includes(i) && (
                (piece.pos === -1 && num === 6) ||
                (piece.pos > -1 && piece.pos + num <= 56)
            );
            if(canMove){
                waitingForPieceClick = false;
                canvas._pendingNum = undefined;
                canvas._pendingSpirit = undefined;
                PLAYERS[chance].myPieces[i].update(num);
                if(window.LudoSound) LudoSound.move();
                iKill(chance, i);
                allPlayerHandler();
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
}

// ── FIX 2: Pass screen ہٹاؤ — خود بخود باری بدلے ──

function nextTurn(lastNum){
    deactivateAll();
    if(lastNum === 6){
        if(window.LudoSound) LudoSound.six();
        outputMessage(USERNAMES[chance] + ' کو چھکا — دوبارہ باری! 🎉', 'server');
        activateChance(chance);
    } else {
        let idx = MYROOM.indexOf(chance);
        let nextId = MYROOM[(idx + 1) % MYROOM.length];
        chance = nextId;
        activateChance(nextId);
        outputMessage('👉 ' + USERNAMES[nextId] + ' کی باری!', nextId);
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

// ── Win ──

function showWin(id){
    deactivateAll();
    if(window.LudoSound) LudoSound.win();
    let modal = document.getElementById('win-modal');
    document.getElementById('win-text').innerHTML = PASS_ICONS[id] + ' ' + USERNAMES[id] + ' جیت گیا! 🏆';
    document.getElementById('win-text').style.color = COLOR_HEX[id];
    modal.style.display = 'block';
}

// ── Kill ──

function iKill(id, pid){
    let boss = PLAYERS[id].myPieces[pid];
    for(let i=0;i<MYROOM.length;i++){
        for(let j=0;j<4;j++){
            if(MYROOM[i] != id && boss.x == PLAYERS[MYROOM[i]].myPieces[j].x && boss.y == PLAYERS[MYROOM[i]].myPieces[j].y){
                if(!inAhomeTile(id,pid)){
                    PLAYERS[MYROOM[i]].myPieces[j].kill();
                    if(window.LudoSound) LudoSound.kill();
                    outputMessage('💀 ' + USERNAMES[id] + ' نے ' + USERNAMES[MYROOM[i]] + ' کی گوٹی ماری!', 'server');
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

function allPlayerHandler(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0;i<MYROOM.length;i++) PLAYERS[MYROOM[i]].draw();
}

function updateDiceUI(id, num){
    let d = document.getElementById('dice-' + id);
    if(d){
        d.classList.add('rolling');
        setTimeout(()=>{ d.setAttribute('data-num', num); d.classList.remove('rolling'); }, 500);
    }
    setTimeout(()=>{
        let m = document.getElementById('cmsg-' + id);
        if(m) m.textContent = '🎲 ' + num + ' آیا!';
    }, 500);
}

function outputMessage(msg, who){
    let board = document.querySelector('.msgBoard');
    let div = document.createElement('div');
    div.classList.add(who === 'server' ? 'messageFromServer' : 'message');
    let color = (typeof who === 'number') ? COLOR_HEX[who] : '#aaa';
    div.innerHTML = '<p style="text-shadow: 0 0 6px ' + color + '">' + msg + '</p>';
    board.appendChild(div);
    board.scrollTop = board.scrollHeight;
}
