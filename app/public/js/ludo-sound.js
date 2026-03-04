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

    // ── بنیادی tone ──
    function _tone(freq, type, start, dur, vol, ac, freqEnd) {
        var osc  = ac.createOscillator();
        var gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, start + dur);
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.start(start);
        osc.stop(start + dur + 0.01);
    }

    // ── noise burst ──
    function _noise(start, dur, vol, ac, filterFreq) {
        var size = Math.floor(ac.sampleRate * dur);
        var buf  = ac.createBuffer(1, size, ac.sampleRate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;

        var src  = ac.createBufferSource();
        src.buffer = buf;

        var filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = filterFreq || 1000;
        filter.Q.value = 0.8;

        var gain = ac.createGain();
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        src.start(start);
        src.stop(start + dur + 0.01);
    }

    // ── reverb جیسا echo ──
    function _echo(ac, gainNode) {
        try {
            var delay = ac.createDelay(0.5);
            var fb    = ac.createGain();
            delay.delayTime.value = 0.12;
            fb.gain.value = 0.25;
            gainNode.connect(delay);
            delay.connect(fb);
            fb.connect(delay);
            delay.connect(ac.destination);
        } catch(e) {}
    }

    // ════════════════════════════════
    //  🎲 DICE — اصل پانسے کی آواز
    // ════════════════════════════════
    function dice() {
        var ac = _getCtx(); if (!ac || ac.state === 'suspended') return;
        var n = ac.currentTime;

        // لکڑی کی کھڑکھڑاہٹ
        _noise(n,       0.04, 0.6, ac, 2500);
        _noise(n+0.05,  0.03, 0.5, ac, 2000);
        _noise(n+0.10,  0.04, 0.6, ac, 2500);
        _noise(n+0.15,  0.03, 0.4, ac, 1800);
        _noise(n+0.19,  0.05, 0.7, ac, 3000); // آخری ٹھک

        // گہری لکڑی کی bass
        _tone(120, 'sine', n,       0.06, 0.5, ac);
        _tone(100, 'sine', n+0.10,  0.06, 0.4, ac);
        _tone(90,  'sine', n+0.19,  0.08, 0.6, ac);
    }

    // ════════════════════════════════
    //  👣 MOVE — smooth ٹک
    // ════════════════════════════════
    function move() {
        var ac = _getCtx(); if (!ac || ac.state === 'suspended') return;
        var n = ac.currentTime;

        // پلاسٹک ٹک آواز
        _noise(n, 0.015, 0.5, ac, 3500);

        // اوپر جانے والی tone
        var osc  = ac.createOscillator();
        var gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, n);
        osc.frequency.exponentialRampToValueAtTime(640, n + 0.06);
        gain.gain.setValueAtTime(0.3, n);
        gain.gain.exponentialRampToValueAtTime(0.001, n + 0.1);
        osc.start(n);
        osc.stop(n + 0.12);

        // ہلکی echo
        _echo(ac, gain);
    }

    // ════════════════════════════════
    //  💀 KILL — زوردار دھماکہ
    // ════════════════════════════════
    function kill() {
        var ac = _getCtx(); if (!ac || ac.state === 'suspended') return;
        var n = ac.currentTime;

        // زوردار impact
        _noise(n, 0.08, 0.9, ac, 800);
        _noise(n, 0.15, 0.5, ac, 200);

        // گرنے والی آواز
        var osc  = ac.createOscillator();
        var gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, n);
        osc.frequency.exponentialRampToValueAtTime(40, n + 0.4);
        gain.gain.setValueAtTime(0.5, n);
        gain.gain.exponentialRampToValueAtTime(0.001, n + 0.45);
        osc.start(n);
        osc.stop(n + 0.5);

        // bass thud
        _tone(60, 'sine', n, 0.2, 0.7, ac);
        _tone(45, 'sine', n+0.05, 0.25, 0.5, ac);

        // echo
        _echo(ac, gain);
    }

    // ════════════════════════════════
    //  🎉 WIN — خوشی والی دھن
    // ════════════════════════════════
    function win() {
        var ac = _getCtx(); if (!ac || ac.state === 'suspended') return;
        var n = ac.currentTime;

        // خوشی کی دھن — C major arpeggio
        var melody = [
            [523, 0.00],  // C5
            [659, 0.13],  // E5
            [784, 0.26],  // G5
            [1047,0.39],  // C6
            [784, 0.52],  // G5
            [880, 0.62],  // A5
            [1047,0.72],  // C6
            [1319,0.85],  // E6
        ];

        melody.forEach(function(x) {
            var osc  = ac.createOscillator();
            var gain = ac.createGain();
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(x[0], n + x[1]);
            gain.gain.setValueAtTime(0.0, n + x[1]);
            gain.gain.linearRampToValueAtTime(0.35, n + x[1] + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, n + x[1] + 0.18);
            osc.start(n + x[1]);
            osc.stop(n + x[1] + 0.2);
            _echo(ac, gain);
        });

        // خوشی کے sparkle effects
        [0, 0.3, 0.6, 0.9].forEach(function(t) {
            _noise(n + t, 0.08, 0.2, ac, 6000 + Math.random() * 2000);
        });
    }

    // ════════════════════════════════
    //  6️⃣ SIX — واہ والی آواز
    // ════════════════════════════════
    function six() {
        var ac = _getCtx(); if (!ac || ac.state === 'suspended') return;
        var n = ac.currentTime;

        // تیزی سے اوپر جانے والی آواز
        var osc  = ac.createOscillator();
        var gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, n);
        osc.frequency.exponentialRampToValueAtTime(990, n + 0.25);
        gain.gain.setValueAtTime(0.4, n);
        gain.gain.exponentialRampToValueAtTime(0.001, n + 0.3);
        osc.start(n);
        osc.stop(n + 0.32);

        // تین چمکیلے notes
        _tone(660,  'sine', n + 0.05, 0.08, 0.25, ac);
        _tone(880,  'sine', n + 0.13, 0.08, 0.25, ac);
        _tone(1100, 'sine', n + 0.21, 0.10, 0.30, ac);

        // sparkle
        _noise(n + 0.22, 0.1, 0.3, ac, 5000);

        _echo(ac, gain);
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
