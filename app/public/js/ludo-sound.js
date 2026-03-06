var LudoSound = (function () {

    var _unlocked = false;

    var _sounds = {
        dice:     new Audio('../sounds/dice.mp3'),
        move:     new Audio('../sounds/move.mp3'),
        kill:     new Audio('../sounds/kill.mp3'),
        win:      new Audio('../sounds/win.mp3'),
        six:      new Audio('../sounds/six.mp3'),
        gameOver: new Audio('../sounds/game-over.mp3')
    };

    _sounds.dice.volume     = 0.8;
    _sounds.move.volume     = 0.6;
    _sounds.kill.volume     = 1.0;
    _sounds.win.volume      = 1.0;
    _sounds.six.volume      = 0.9;
    _sounds.gameOver.volume = 0.8;

    function _play(sound) {
        try {
            sound.currentTime = 0;
            var p = sound.play();
            if (p && p.catch) p.catch(function(e) {
                console.log('Sound error:', e);
            });
        } catch(e) {
            console.log('Sound error:', e);
        }
    }

    // پہلے touch/click پر سب sounds کو 0 volume پر play کرو
    // تاکہ browser unlock ہو اور بعد میں sounds چلیں
    function unlock() {
        if (_unlocked) return;
        _unlocked = true;
        Object.values(_sounds).forEach(function(s) {
            var origVol = s.volume;
            s.volume = 0;
            var p = s.play();
            if (p && p.then) {
                p.then(function() {
                    s.pause();
                    s.currentTime = 0;
                    s.volume = origVol;
                }).catch(function(){
                    s.volume = origVol;
                });
            } else {
                s.volume = origVol;
            }
        });
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
