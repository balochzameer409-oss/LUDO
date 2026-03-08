// =====================================================
// LUDO OFFLINE MODE — final clean version
// =====================================================

const USERNAMES  = ['Green Warrior', 'Red Fire', 'Blue Fox', 'Yellow Rhino'];
const COLORS     = ['green', 'red', 'blue', 'yellow'];
const COLOR_HEX  = ['#27ae60', '#e74c3c', '#2980b9', '#f1c40f'];
const PIECES     = [];
const PASS_ICONS = ['🟢','🔴','🔵','🟡'];

let MYROOM  = [];
let chance  = 0;
let PLAYERS = {};
let totalPlayers = 4;

// pending state — module scope میں
let _waiting = false;
let _num     = undefined;
let _spirit  = undefined;

var canvas = document.getElementById('theCanvas');
var ctx    = canvas.getContext('2d');
canvas.height = 750;
canvas.width  = 750;

// ── scaled coordinates ──
function scaledXY(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    return {
        x: (clientX - r.left) * (750 / r.width),
        y: (clientY - r.top)  * (750 / r.height)
    };
}

// ── گوٹی hit test ──
function tryMovePiece(x, y) {
    if (!_waiting || _num === undefined || !_spirit) return;

    for (var i = 0; i < 4; i++) {
        var px = PLAYERS[chance].myPieces[i].x;
        var py = PLAYERS[chance].myPieces[i].y;
        // piece 50x50 ہے
        if (x >= px && x <= px + 50 && y >= py && y <= py + 50) {
            var piece = PLAYERS[chance].myPieces[i];
            var canMove = _spirit.includes(i) && (
                (piece.pos === -1 && _num === 6) ||
                (piece.pos  >  -1 && piece.pos + _num <= 56)
            );
            if (canMove) {
                var movedNum = _num;
                _waiting = false;
                _num     = undefined;
                _spirit  = undefined;

                var currentChance = chance;
                var currentI = i;
                var currentMovedNum = movedNum;
                piece.animateMove(movedNum, function () {
                    var killed = iKill(currentChance, currentI);
                    // گوٹی گھر پہنچی؟ — didIwin سے پہلے check کرو
                    var justWon = PLAYERS[currentChance].myPieces[currentI].pos === 56;
                    allPlayerHandler();

                    if (PLAYERS[currentChance].didIwin()) {
                        // سب 4 گوٹیاں گھر — گیم ختم!
                        showWin(currentChance);
                        return;
                    }

                    if (killed) {
                        outputMessage('🎉 ' + USERNAMES[currentChance] + ' نے گوٹی ماری — دوبارہ باری!', 'server');
                        setTimeout(function () { activateChance(currentChance); }, 400);
                    } else if (justWon) {
                        // ایک گوٹی گھر پہنچی — دوبارہ باری!
                        outputMessage('🏠 ' + USERNAMES[currentChance] + ' کی گوٹی گھر پہنچی — دوبارہ باری!', 'server');
                        setTimeout(function () { activateChance(currentChance); }, 400);
                    } else {
                        setTimeout(function () { nextTurn(currentMovedNum); }, 400);
                    }
                });
            } else {
                outputMessage('یہ گوٹی نہیں چل سکتی!', 'server');
            }
            return; // hit ہوا — چاہے چلی یا نہیں، return
        }
    }
    // خالی جگہ پر click
    outputMessage('اپنی گوٹی چھوئیں', 'server');
}

// ── canvas touch ──
canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!_waiting) return;
    var t = e.touches[0];
    var p = scaledXY(t.clientX, t.clientY);
    tryMovePiece(p.x, p.y);
}, { passive: false });

// ── canvas click (desktop) ──
canvas.addEventListener('click', function (e) {
    if (!_waiting) return;
    var p = scaledXY(e.clientX, e.clientY);
    tryMovePiece(p.x, p.y);
});

// ── Piece positions ──
var allPiecesePos = {
    0: [{ x: 50, y: 125 }, { x: 125, y: 50  }, { x: 200, y: 125 }, { x: 125, y: 200 }],
    1: [{ x: 500, y: 125 }, { x: 575, y: 50  }, { x: 650, y: 125 }, { x: 575, y: 200 }],
    2: [{ x: 500, y: 575 }, { x: 575, y: 500 }, { x: 650, y: 575 }, { x: 575, y: 650 }],
    3: [{ x: 50,  y: 575 }, { x: 125, y: 500 }, { x: 200, y: 575 }, { x: 125, y: 650 }]
};

var homeTilePos = {
    0: { 0: { x: 50,  y: 300 }, 1: { x: 300, y: 100 } },
    1: { 0: { x: 400, y: 50  }, 1: { x: 600, y: 300 } },
    2: { 0: { x: 650, y: 400 }, 1: { x: 400, y: 600 } },
    3: { 0: { x: 300, y: 650 }, 1: { x: 100, y: 400 } }
};

// ── Player & Piece classes ──
class Player {
    constructor(id) {
        this.id = String(id);
        this.myPieces = {};
        for (let i = 0; i < 4; i++) this.myPieces[i] = new Piece(String(i), String(id));
        this.won = 0;
    }
    draw() { for (let i = 0; i < 4; i++) this.myPieces[i].draw(); }
    didIwin() { return this.won === 4 ? 1 : 0; }
}

class Piece {
    constructor(i, id) {
        this.path     = [];
        this.color_id = String(id);
        this.Pid      = String(i);
        this.pos      = -1;
        this.x        = allPiecesePos[id][i].x;
        this.y        = allPiecesePos[id][i].y;
        this.image    = PIECES[id];

        switch (id) {
            case '0':
                for (let i = 0; i < 4; i++) this.path.push(this.oneStepToRight);
                this.path.push(this.oneStepTowards45);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToTop);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToRight);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToBottom);
                this.path.push(this.oneStepTowards315);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToRight);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToBottom);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToLeft);
                this.path.push(this.oneStepTowards225);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToBottom);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToLeft);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToTop);
                this.path.push(this.oneStepTowards135);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToLeft);
                this.path.push(this.oneStepToTop);
                for (let i = 0; i < 6; i++) this.path.push(this.oneStepToRight);
                break;
            case '1':
                for (let i = 0; i < 4; i++) this.path.push(this.oneStepToBottom);
                this.path.push(this.oneStepTowards315);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToRight);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToBottom);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToLeft);
                this.path.push(this.oneStepTowards225);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToBottom);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToLeft);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToTop);
                this.path.push(this.oneStepTowards135);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToLeft);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToTop);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToRight);
                this.path.push(this.oneStepTowards45);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToTop);
                this.path.push(this.oneStepToRight);
                for (let i = 0; i < 6; i++) this.path.push(this.oneStepToBottom);
                break;
            case '2':
                for (let i = 0; i < 4; i++) this.path.push(this.oneStepToLeft);
                this.path.push(this.oneStepTowards225);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToBottom);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToLeft);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToTop);
                this.path.push(this.oneStepTowards135);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToLeft);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToTop);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToRight);
                this.path.push(this.oneStepTowards45);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToTop);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToRight);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToBottom);
                this.path.push(this.oneStepTowards315);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToRight);
                this.path.push(this.oneStepToBottom);
                for (let i = 0; i < 6; i++) this.path.push(this.oneStepToLeft);
                break;
            case '3':
                for (let i = 0; i < 4; i++) this.path.push(this.oneStepToTop);
                this.path.push(this.oneStepTowards135);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToLeft);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToTop);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToRight);
                this.path.push(this.oneStepTowards45);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToTop);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToRight);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToBottom);
                this.path.push(this.oneStepTowards315);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToRight);
                for (let i = 0; i < 2; i++) this.path.push(this.oneStepToBottom);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToLeft);
                this.path.push(this.oneStepTowards225);
                for (let i = 0; i < 5; i++) this.path.push(this.oneStepToBottom);
                this.path.push(this.oneStepToLeft);
                for (let i = 0; i < 6; i++) this.path.push(this.oneStepToTop);
                break;
        }
    }

    draw() { ctx.drawImage(this.image, this.x, this.y, 50, 50); }

    update(num) {
        // اگر گوٹی ابھی home میں ہے (pos === -1) اور چھکا ہے
        if (this.pos === -1 && num === 6) {
            this.x   = homeTilePos[this.color_id][0].x;
            this.y   = homeTilePos[this.color_id][0].y;
            this.pos = 0;
        } 
        // اگر گوٹی پہلے سے board میں ہے اور آگے جا سکتی ہے
        else if (this.pos > -1 && this.pos + num <= 56) {
            for (let i = 0; i < num; i++) {
                let pathIndex = this.pos + i;
                if (pathIndex < this.path.length) {
                    this.path[pathIndex](this.color_id, this.Pid);
                }
            }
            this.pos += num;
            if (this.pos === 56) PLAYERS[this.color_id].won += 1;
        }
    }

    // ── Smooth Animation ──
    animateMove(num, onDone) {
        if (this.pos === -1 && num === 6) {
            // گھر سے نکلنا — سیدھا
            this.x   = homeTilePos[this.color_id][0].x;
            this.y   = homeTilePos[this.color_id][0].y;
            this.pos = 0;
            allPlayerHandler();
            if (onDone) onDone();
            return;
        }
        if (this.pos > -1 && this.pos + num <= 56) {
            let steps = num;
            let current = 0;
            const id  = this.color_id;
            const pid = this.Pid;
            const piece = this;
            const interval = setInterval(function () {
                if (current >= steps) {
                    clearInterval(interval);
                    if (piece.pos === 56) PLAYERS[piece.color_id].won += 1;
                    allPlayerHandler();
                    if (onDone) onDone();
                    return;
                }
                let pathIndex = piece.pos - (steps - current) + steps - current;
                // صحیح pathIndex
                let realIndex = (piece.pos - steps) + current;
                if (realIndex < 0) realIndex = 0;
                if (realIndex < piece.path.length) {
                    piece.path[realIndex](id, pid);
                }
                if (window.LudoSound) LudoSound.move();
                current++;
                allPlayerHandler();
            }, 120); // ہر قدم 120ms
            this.pos += steps;
        }
    }

    oneStepToRight(id, pid)  { PLAYERS[id].myPieces[pid].x += 50; }
    oneStepToLeft(id, pid)   { PLAYERS[id].myPieces[pid].x -= 50; }
    oneStepToTop(id, pid)    { PLAYERS[id].myPieces[pid].y -= 50; }
    oneStepToBottom(id, pid) { PLAYERS[id].myPieces[pid].y += 50; }
    oneStepTowards45(id, pid)  { PLAYERS[id].myPieces[pid].x += 50; PLAYERS[id].myPieces[pid].y -= 50; }
    oneStepTowards135(id, pid) { PLAYERS[id].myPieces[pid].x -= 50; PLAYERS[id].myPieces[pid].y -= 50; }
    oneStepTowards225(id, pid) { PLAYERS[id].myPieces[pid].x -= 50; PLAYERS[id].myPieces[pid].y += 50; }
    oneStepTowards315(id, pid) { PLAYERS[id].myPieces[pid].x += 50; PLAYERS[id].myPieces[pid].y += 50; }

    kill() {
        this.x   = allPiecesePos[this.color_id][this.Pid].x;
        this.y   = allPiecesePos[this.color_id][this.Pid].y;
        this.pos = -1;
    }
}

// ── Game start ──

function startOffline(numPlayers) {
    totalPlayers = numPlayers;
    // order: Yellow(3), Red(1), Blue(2), Green(0)
    const orderAll = [3, 1, 2, 0];
    MYROOM = orderAll.slice(0, numPlayers);
    document.getElementById('player-select-modal').style.display = 'none';
    loadAllPieces();
}

function loadAllPieces() {
    let cnt = 0;
    for (let i = 0; i < COLORS.length; i++) {
        let img = new Image();
        img.src = '../images/pieces/' + COLORS[i] + '.png';
        img.onload = () => {
            if (++cnt >= COLORS.length) {
                for (let j = 0; j < MYROOM.length; j++) PLAYERS[MYROOM[j]] = new Player(MYROOM[j]);
                chance = MYROOM[0];
                allPlayerHandler();
                activateChance(chance);

                // ── ہر dice کا touch اور click ──
                for (let i = 0; i < 4; i++) {
                    (function (pid) {
                        var d = document.getElementById('dice-' + pid);
                        if (!d) return;
                        d.dataset.pid = pid;

                        // touch
                        d.addEventListener('touchstart', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (this.classList.contains('disabled')) return;
                            if (pid !== chance) return;
                            if (window.LudoSound) LudoSound.unlock();
                            rollAndWait();
                        }, { passive: false });

                        // click (desktop)
                        d.addEventListener('click', function (e) {
                            e.stopPropagation();
                            if (this.classList.contains('disabled')) return;
                            if (pid !== chance) return;
                            rollAndWait();
                        });
                    })(i);
                }

                outputMessage('🎮 گیم شروع! ' + USERNAMES[chance] + ' پہلے کھیلے گا', 'server');
            }
        };
        PIECES.push(img);
    }
}

// ── Dice roll ──

function rollAndWait() {
    if (_waiting) return;

    var num = Math.floor(Math.random() * 6) + 1;
    if (window.LudoSound) LudoSound.dice();
    updateDiceUI(chance, num);
    outputMessage(USERNAMES[chance] + ' کو ' + num + ' آیا! 🎲', chance);

    // چل سکنے والی گوٹیاں
    var spirit = [];
    for (var i = 0; i < 4; i++) {
        var p = PLAYERS[chance].myPieces[i];
        if (p.pos === -1 && num === 6)          spirit.push(i);
        else if (p.pos > -1 && p.pos + num <= 56) spirit.push(i);
    }

    if (spirit.length === 0) {
        outputMessage('کوئی گوٹی نہیں چل سکتی!', 'server');
        setTimeout(function () { nextTurn(num); }, 800);
        return;
    }

    _num    = num;
    _spirit = spirit;
    _waiting = true;
    outputMessage('✋ ' + USERNAMES[chance] + ' — گوٹی چھوئیں', 'server');
}

// ── Turn ──

function nextTurn(lastNum) {
    deactivateAll();
    if (lastNum === 6) {
        if (window.LudoSound) LudoSound.six();
        outputMessage(USERNAMES[chance] + ' کو چھکا — دوبارہ باری! 🎉', 'server');

        // چھکے کے بعد check کریں کہ کوئی گوٹی چل سکتی ہے یا نہیں
        var hasMovablePiece = false;
        for (var i = 0; i < 4; i++) {
            var p = PLAYERS[chance].myPieces[i];
            // اگر کوئی گوٹی ہے تو چھکے کے بعد موقع دیں
            if (p.pos === -1 || p.pos > -1) {
                hasMovablePiece = true;
                break;
            }
        }

        if (hasMovablePiece) {
            activateChance(chance); // دوبارہ یہی کھیل سکتا ہے
        } else {
            // کوئی گوٹی نہیں چل سکتی — اگلے کی باری
            outputMessage('⚠️ ' + USERNAMES[chance] + ' کے پاس کوئی گوٹی نہیں چل سکتی!', 'server');
            var idx    = MYROOM.indexOf(chance);
            var nextId = MYROOM[(idx + 1) % MYROOM.length];
            chance = nextId;
            activateChance(nextId);
            outputMessage('👉 ' + USERNAMES[nextId] + ' کی باری!', nextId);
        }
    } else {
        var idx    = MYROOM.indexOf(chance);
        var nextId = MYROOM[(idx + 1) % MYROOM.length];
        chance = nextId;
        activateChance(nextId);
        outputMessage('👉 ' + USERNAMES[nextId] + ' کی باری!', nextId);
    }
}

function activateChance(id) {
    chance   = id;
    _waiting = false;
    _num     = undefined;
    _spirit  = undefined;
    deactivateAll();
    var corner = document.getElementById('corner-' + id);
    var dice   = document.getElementById('dice-'   + id);
    var cmsg   = document.getElementById('cmsg-'   + id);
    if (corner) corner.classList.add('my-turn');
    if (dice)  { dice.classList.remove('disabled'); dice.classList.add('active'); }
    if (cmsg)   cmsg.textContent = '⚡ آپ کی باری!';
}

function deactivateAll() {
    for (var i = 0; i < 4; i++) {
        var c = document.getElementById('corner-' + i);
        var d = document.getElementById('dice-'   + i);
        var m = document.getElementById('cmsg-'   + i);
        if (c) c.classList.remove('my-turn');
        if (d) { d.classList.add('disabled'); d.classList.remove('active'); }
        if (m) m.textContent = 'Waiting...';
    }
}

// ── Win ──

function showWin(id) {
    deactivateAll();
    if (window.LudoSound) LudoSound.win();
    var modal = document.getElementById('win-modal');
    document.getElementById('win-text').innerHTML = PASS_ICONS[id] + ' ' + USERNAMES[id] + ' جیت گیا! 🏆';
    document.getElementById('win-text').style.color = COLOR_HEX[id];
    modal.style.display = 'block';
}

// ── Kill ──

function iKill(id, pid) {
    var boss = PLAYERS[id].myPieces[pid];
    for (var i = 0; i < MYROOM.length; i++) {
        for (var j = 0; j < 4; j++) {
            if (MYROOM[i] != id &&
                boss.x === PLAYERS[MYROOM[i]].myPieces[j].x &&
                boss.y === PLAYERS[MYROOM[i]].myPieces[j].y) {
                if (!inAhomeTile(id, pid)) {
                    PLAYERS[MYROOM[i]].myPieces[j].kill();
                    if (window.LudoSound) LudoSound.kill();
                    outputMessage('💀 ' + USERNAMES[id] + ' نے ' + USERNAMES[MYROOM[i]] + ' کی گوٹی ماری!', 'server');
                    return 1;
                }
            }
        }
    }
    return 0;
}

function inAhomeTile(id, pid) {
    for (var i = 0; i < 4; i++) {
        if ((PLAYERS[id].myPieces[pid].x === homeTilePos[i][0].x && PLAYERS[id].myPieces[pid].y === homeTilePos[i][0].y) ||
            (PLAYERS[id].myPieces[pid].x === homeTilePos[i][1].x && PLAYERS[id].myPieces[pid].y === homeTilePos[i][1].y)) {
            return true;
        }
    }
    return false;
}

function allPlayerHandler() {
    ctx.clearRect(0, 0, 750, 750);
    for (var i = 0; i < MYROOM.length; i++) PLAYERS[MYROOM[i]].draw();
}

function updateDiceUI(id, num) {
    var d = document.getElementById('dice-' + id);
    if (d) {
        d.classList.add('rolling');
        setTimeout(function () { d.setAttribute('data-num', num); d.classList.remove('rolling'); }, 500);
    }
    setTimeout(function () {
        var m = document.getElementById('cmsg-' + id);
        if (m) m.textContent = '🎲 ' + num + ' آیا!';
    }, 500);
}

function outputMessage(msg, who) {
    var board = document.querySelector('.msgBoard');
    var div   = document.createElement('div');
    div.classList.add(who === 'server' ? 'messageFromServer' : 'message');
    var color = (typeof who === 'number') ? COLOR_HEX[who] : '#aaa';
    div.innerHTML = '<p style="text-shadow:0 0 6px ' + color + '">' + msg + '</p>';
    board.appendChild(div);
    board.scrollTop = board.scrollHeight;
}