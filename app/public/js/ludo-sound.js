var LudoSound = (function () {

    var _unlocked = false;

    // ہر sound کی copies — فوری آواز کے لیے
    function _makePool(src, vol, size) {
        var pool = [];
        for (var i = 0; i < (size || 3); i++) {
            var a = new Audio(src);
            a.volume = vol;
            a.preload = 'auto';
            a.load();
            pool.push(a);
        }
        return { pool: pool, idx: 0 };
    }

    var _pools = {
        dice:     _makePool('/sounds/dice.mp3',      1.0, 2),
        move:     _makePool('/sounds/move.mp3',      0.6, 4),
        kill:     _makePool('/sounds/kill.mp3',      1.0, 2),
        win:      _makePool('/sounds/win.mp3',       1.0, 2),
        six:      _makePool('/sounds/six.mp3',       0.9, 2),
        gameOver: _makePool('/sounds/game-over.mp3', 0.8, 2)
    };

    function _play(key) {
        try {
            var p = _pools[key];
            var sound = p.pool[p.idx];
            p.idx = (p.idx + 1) % p.pool.length;
            sound.currentTime = 0;
            var pr = sound.play();
            if (pr && pr.catch) pr.catch(function() {});
        } catch(e) {}
    }

    function unlock() {
        if (_unlocked) return;
        _unlocked = true;
        Object.keys(_pools).forEach(function(key) {
            _pools[key].pool.forEach(function(s) {
                var v = s.volume;
                s.volume = 0;
                var p = s.play();
                if (p && p.then) {
                    p.then(function() {
                        s.pause();
                        s.currentTime = 0;
                        s.volume = v;
                    }).catch(function() { s.volume = v; });
                } else {
                    s.volume = v;
                }
            });
        });
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

(function(){
    function _u() {
        LudoSound.unlock();
        document.removeEventListener('click',      _u);
        document.removeEventListener('touchstart', _u);
    }
    document.addEventListener('click',      _u);
    document.addEventListener('touchstart', _u);
})();
