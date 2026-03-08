var LudoSound = (function () {
    var _sounds = {
        dice:     new Audio('../sounds/dice.mp3'),
        move:     new Audio('../sounds/move.mp3'),
        kill:     new Audio('../sounds/kill.mp3'),
        win:      new Audio('../sounds/win.mp3'),
        six:      new Audio('../sounds/six.mp3'),
        gameOver: new Audio('../sounds/game-over.mp3')
    };
    
    // والیوم سیٹ کریں
    _sounds.dice.volume     = 0.8;
    _sounds.move.volume     = 0.6;
    _sounds.kill.volume     = 1.0;
    _sounds.win.volume      = 1.0;
    _sounds.six.volume      = 0.9;
    _sounds.gameOver.volume = 0.8;
    
    // تمام ساؤنڈز کو پری لوڈ کریں
    Object.values(_sounds).forEach(function(sound) {
        sound.load(); // mp3 فائلز لوڈ ہو جائیں گی
        sound.preload = 'auto'; // خودکار لوڈنگ
    });
    
    function _play(sound) {
        try {
            // ری سیٹ اور پلے
            sound.currentTime = 0;
            
            var playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(function(error) {
                    console.log('Sound play error:', error);
                    // اگر پلے نہ ہو سکے تو دوبارہ کوشش کریں
                    setTimeout(function() {
                        sound.play().catch(function(e) {});
                    }, 100);
                });
            }
        } catch(e) {
            console.log('Sound error:', e);
        }
    }
    
    // انلاک فنکشن - صارف کے کلک پر ایک بار چلے گا
    function unlock() {
        // تمام ساؤنڈز کو خاموشی سے پلے کریں
        Object.values(_sounds).forEach(function(s) {
            var originalVolume = s.volume;
            s.volume = 0; // خاموش
            
            var p = s.play();
            if (p !== undefined) {
                p.then(function() {
                    // پلے ہو گیا تو روک دیں
                    s.pause();
                    s.currentTime = 0;
                    s.volume = originalVolume; // والیوم واپس
                }).catch(function() {
                    s.volume = originalVolume;
                });
            }
        });
        
        // ایک ڈمی ساؤنڈ بھی بجا دیں
        var silentContext = new (window.AudioContext || window.webkitAudioContext)();
        if (silentContext.state === 'suspended') {
            silentContext.resume();
        }
    }
    
    // پبلک فنکشنز
    function dice()     { _play(_sounds.dice);     }
    function move()     { _play(_sounds.move);     }
    function kill()     { _play(_sounds.kill);     }
    function win()      { _play(_sounds.win);      }
    function six()      { _play(_sounds.six);      }
    function gameOver() { _play(_sounds.gameOver); }
    
    return {
        unlock: unlock,
        dice: dice,
        move: move,
        kill: kill,
        win: win,
        six: six,
        gameOver: gameOver
    };
})();

// صارف کے کلک پر انلاک
(function(){
    function unlockHandler() {
        LudoSound.unlock();
        // پہلی بار کے بعد event ہٹا دیں
        document.removeEventListener('click', unlockHandler);
        document.removeEventListener('touchstart', unlockHandler);
        document.removeEventListener('keydown', unlockHandler);
    }
    
    document.addEventListener('click', unlockHandler);
    document.addEventListener('touchstart', unlockHandler);
    document.addEventListener('keydown', unlockHandler); // کی بورڈ کے لیے بھی
})();