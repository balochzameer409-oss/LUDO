var LudoSound = (function () {
    var _sounds = {
        dice:     '../sounds/dice.mp3',
        move:     '../sounds/move.mp3',
        kill:     '../sounds/kill.mp3',
        win:      '../sounds/win.mp3',
        six:      '../sounds/six.mp3',
        gameOver: '../sounds/game-over.mp3'
    };

    var _volume = {
        dice:     0.8,
        move:     0.6,
        kill:     1.0,
        win:      1.0,
        six:      0.9,
        gameOver: 0.8
    };

    // ہر sound کے لیے پہلے سے تیار Audio objects کا pool
    var _pool = {};
    var _poolSize = 4; // ہر sound کی 4 copies — ٹپ ٹپ ٹپ کے لیے

    Object.keys(_sounds).forEach(function(key) {
        _pool[key] = [];
        for (var i = 0; i < _poolSize; i++) {
            var audio = new Audio(_sounds[key]);
            audio.volume = _volume[key];
            audio.preload = 'auto';
            audio.load();
            _pool[key].push(audio);
        }
    });

    // pool میں سے جو فارغ ہو وہ بجاؤ
    var _index = {};
    Object.keys(_sounds).forEach(function(key) { _index[key] = 0; });

    function _play(key) {
        try {
            var pool = _pool[key];
            var idx  = _index[key];
            var sound = pool[idx];
            // اگلی باری کے لیے index بڑھاؤ
            _index[key] = (idx + 1) % pool.length;
            sound.currentTime = 0;
            var p = sound.play();
            if (p !== undefined) {
                p.catch(function() {});
            }
        } catch(e) {}
    }

    // انلاک — صارف کے پہلے touch پر
    function unlock() {
        Object.keys(_pool).forEach(function(key) {
            _pool[key].forEach(function(s) {
                var v = s.volume;
                s.volume = 0;
                var p = s.play();
                if (p !== undefined) {
                    p.then(function() {
                        s.pause();
                        s.currentTime = 0;
                        s.volume = v;
                    }).catch(function() { s.volume = v; });
                }
            });
        });

        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();
        } catch(e) {}
    }

    return {
        unlock:   unlock,
        dice:     function() { _play('dice');     },
        move:     function() { _play('move');     },
        kill:     function() { _play('kill');     },
        win:      function() { _play('win');      },
        six:      function() { _play('six');      },
        gameOver: function() { _play('gameOver'); }
    };
})();

// پہلے touch/click پر انلاک
(function(){
    function unlockHandler() {
        LudoSound.unlock();
        document.removeEventListener('click',      unlockHandler);
        document.removeEventListener('touchstart', unlockHandler);
        document.removeEventListener('keydown',    unlockHandler);
    }
    document.addEventListener('click',      unlockHandler);
    document.addEventListener('touchstart', unlockHandler);
    document.addEventListener('keydown',    unlockHandler);
})();
