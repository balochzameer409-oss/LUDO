// =====================================================
// LUDO SOUND SYSTEM - Web Audio API
// کوئی فائل نہیں — سب آوازیں خود بنتی ہیں!
// =====================================================

const LudoSound = (() => {
    let ctx = null;

    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    // ── Helper: ایک tone بجاؤ ──
    function playTone(freq, type, startTime, duration, gainVal, ac) {
        let osc  = ac.createOscillator();
        let gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type      = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(gainVal, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    // ── Helper: noise burst (shake effect) ──
    function playNoise(startTime, duration, gainVal, ac) {
        let bufferSize = ac.sampleRate * duration;
        let buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        let data   = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        let source = ac.createBufferSource();
        source.buffer = buffer;
        let gain = ac.createGain();
        // band-pass filter for dice rattle feel
        let filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.8;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        gain.gain.setValueAtTime(gainVal, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        source.start(startTime);
        source.stop(startTime + duration);
    }

    // ── 🎲 Dice Roll — rattle + 8bit click ──
    function dice() {
        let ac = getCtx();
        let now = ac.currentTime;
        // noise rattle
        playNoise(now,       0.08, 0.4, ac);
        playNoise(now + 0.09, 0.07, 0.3, ac);
        playNoise(now + 0.17, 0.06, 0.25, ac);
        // final click
        playTone(180, 'square', now + 0.22, 0.06, 0.3, ac);
        playTone(220, 'square', now + 0.26, 0.05, 0.2, ac);
    }

    // ── 👑 گوٹی چلنا — cute hop ──
    function move() {
        let ac  = getCtx();
        let now = ac.currentTime;
        // بوند کی طرح اوپر جانا
        let osc  = ac.createOscillator();
        let gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(520, now + 0.08);
        osc.frequency.linearRampToValueAtTime(380, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    // ── 💀 گوٹی مارنا — dramatic crash ──
    function kill() {
        let ac  = getCtx();
        let now = ac.currentTime;
        // نیچے گرنے والی آواز
        let osc  = ac.createOscillator();
        let gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.start(now);
        osc.stop(now + 0.4);
        // noise burst ساتھ
        playNoise(now, 0.12, 0.3, ac);
        // low thud
        playTone(60, 'sine', now + 0.05, 0.25, 0.5, ac);
    }

    // ── 🏆 جیتنا — fanfare melody ──
    function win() {
        let ac  = getCtx();
        let now = ac.currentTime;
        // خوشی کی دھن — C major arpeggio
        let notes = [
            { f: 523, t: 0.00, d: 0.12 },  // C5
            { f: 659, t: 0.12, d: 0.12 },  // E5
            { f: 784, t: 0.24, d: 0.12 },  // G5
            { f: 1047,t: 0.36, d: 0.20 },  // C6
            { f: 784, t: 0.52, d: 0.10 },  // G5
            { f: 1047,t: 0.60, d: 0.35 },  // C6 — long
        ];
        notes.forEach(n => {
            playTone(n.f, 'square', now + n.t, n.d, 0.3, ac);
            // harmony
            playTone(n.f * 1.25, 'sine', now + n.t, n.d, 0.1, ac);
        });
        // sparkle effect
        for (let i = 0; i < 6; i++) {
            playTone(1200 + i * 200, 'sine', now + 0.05 * i, 0.08, 0.08, ac);
        }
    }

    // ── 🎲 چھکا! — special six sound ──
    function six() {
        let ac  = getCtx();
        let now = ac.currentTime;
        playTone(440, 'square', now,       0.08, 0.3, ac);
        playTone(550, 'square', now + 0.09, 0.08, 0.3, ac);
        playTone(660, 'square', now + 0.18, 0.12, 0.35, ac);
    }

    // Public API
    return { dice, move, kill, win, six };
})();

// ── Mobile پر AudioContext unlock ──
// پہلی touch پر unlock کرنا ضروری ہے
LudoSound.unlock = function(){
    let ac = getCtx();
    if(ac.state === 'suspended') ac.resume();
};
