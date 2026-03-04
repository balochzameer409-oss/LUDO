var LudoSound = (function () {

    // آوازوں کو پہلے سے load کریں
    var _sounds = {
        dice:     new Audio('../sounds/dice.mp3'),
        move:     new Audio('../sounds/move.mp3'),
        kill:     new Audio('../sounds/kill.mp3'),
        win:      new Audio('../sounds/win.mp3'),
        six:      new Audio('../sounds/six.mp3'),
        gameOver: new Audio('../sounds/game-over.mp3')
    };

    // volume set کریں
    _sounds.dice.volume     = 0.8;
    _sounds.move.volume     = 0.6;
    _sounds.kill.volume     = 1.0;
    _sounds.win.volume      = 1.0;
    _sounds.six.volume      = 0.9;
    _sounds.gameOver.volume = 0.8;

    function _play(sound) {
        try {
            sound.currentTime = 0;
            sound.play().catch(function(e) {
                console.log('Sound error:', e);
            });
        } catch(e) {
            console.log('Sound error:', e);
        }
    }

    function unlock() {
        Object.values(_sounds).forEach(function(s) { s.load(); });
    }

    function dice()     { _play(_sounds.dice);     }
    function move()     { _play(_sounds.move);     }
    function kill()     { _play(_sounds.kill);     }
    function win()      { _play(_sounds.win);      }
    function six()      { _play(_sounds.six);      }
    function gameOver() { _play(_sounds.gameOver); }

    return { unlock:unlock, dice:dice, move:move, kill:kill, win:win, six:six, gameOver:gameOver };
})();

(function(){
    function _u() {
        LudoSound.unlock();
        document.removeEventListener('click', _u);
        document.removeEventListener('touchstart', _u);
    }
    document.addEventListener('click', _u);
    document.addEventListener('touchstart', _u);
})();
