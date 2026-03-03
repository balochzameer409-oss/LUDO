var LudoSound = (function () {
    var _ctx = null;

    function _getCtx() {
        if (!_ctx) {
            try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch(e) { return null; }
        }
        return _ctx;
    }

    function unlock() {
        var ac = _getCtx();
        if (!ac) return;
        if (ac.state === 'suspended') ac.resume();
        var buf = ac.createBuffer(1, 1, 22050);
        var src = ac.createBufferSource();
        src.buffer = buf;
        src.connect(ac.destination);
        src.start(0);
    }

    function _tone(freq, type, start, dur, vol, ac) {
        var osc = ac.createOscillator();
        var gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.start(start); osc.stop(start + dur);
    }

    function _noise(start, dur, vol, ac) {
        var size = Math.floor(ac.sampleRate * dur);
        var buf = ac.createBuffer(1, size, ac.sampleRate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
        var src = ac.createBufferSource();
        src.buffer = buf;
        var gain = ac.createGain();
        src.connect(gain); gain.connect(ac.destination);
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        src.start(start); src.stop(start + dur);
    }

    function dice() {
        var ac = _getCtx(); if (!ac || ac.state === 'suspended') return;
        var n = ac.currentTime;
        _noise(n, 0.08, 0.4, ac); _noise(n+0.09, 0.07, 0.3, ac);
        _tone(180,'square',n+0.22,0.06,0.3,ac);
        _tone(220,'square',n+0.26,0.05,0.2,ac);
    }

    function move() {
        var ac = _getCtx(); if (!ac || ac.state === 'suspended') return;
        var n = ac.currentTime;
        var osc = ac.createOscillator(), gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, n);
        osc.frequency.linearRampToValueAtTime(520, n+0.08);
        osc.frequency.linearRampToValueAtTime(380, n+0.15);
        gain.gain.setValueAtTime(0.25, n);
        gain.gain.exponentialRampToValueAtTime(0.001, n+0.18);
        osc.start(n); osc.stop(n+0.18);
    }

    function kill() {
        var ac = _getCtx(); if (!ac || ac.state === 'suspended') return;
        var n = ac.currentTime;
        var osc = ac.createOscillator(), gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, n);
        osc.frequency.exponentialRampToValueAtTime(80, n+0.35);
        gain.gain.setValueAtTime(0.4, n);
        gain.gain.exponentialRampToValueAtTime(0.001, n+0.38);
        osc.start(n); osc.stop(n+0.4);
        _noise(n, 0.12, 0.3, ac);
        _tone(60,'sine',n+0.05,0.25,0.5,ac);
    }

    function win() {
        var ac = _getCtx(); if (!ac || ac.state === 'suspended') return;
        var n = ac.currentTime;
        [[523,0],[659,.12],[784,.24],[1047,.36],[784,.52],[1047,.60]].forEach(function(x){
            _tone(x[0],'square',n+x[1],0.15,0.3,ac);
        });
    }

    function six() {
        var ac = _getCtx(); if (!ac || ac.state === 'suspended') return;
        var n = ac.currentTime;
        _tone(440,'square',n,0.08,0.3,ac);
        _tone(550,'square',n+0.09,0.08,0.3,ac);
        _tone(660,'square',n+0.18,0.12,0.35,ac);
    }

    return { unlock:unlock, dice:dice, move:move, kill:kill, win:win, six:six };
})();

// پہلی click/touch پر خود بخود unlock
(function(){
    function _u() {
        LudoSound.unlock();
        document.removeEventListener('click', _u);
        document.removeEventListener('touchstart', _u);
    }
    document.addEventListener('click', _u);
    document.addEventListener('touchstart', _u);
})();
