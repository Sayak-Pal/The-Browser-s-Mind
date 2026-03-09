/**
 * audio.js
 * Generates procedural, copyright-free soothing audio and sound effects using the Web Audio API.
 * Features a generative pentatonic melody engine.
 */

window.GameAudio = (function () {
    let ctx = null;
    let masterGain = null;
    let ambientOscl = [];
    let isPlayingAmbient = false;
    let melodyInterval = null;

    // A soothing pentatonic scale (C Major Pentatonic)
    // Frequencies: C4, D4, E4, G4, A4, C5, D5, E5
    const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

    function init() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.5; // Master volume
        masterGain.connect(ctx.destination);
    }

    // A soothing harmonic drone pad
    function startAmbient() {
        if (!ctx) init();
        if (isPlayingAmbient) return;

        ctx.resume();
        const freqs = [130.81, 196.00, 261.63]; // Base C, G, C(octave up)

        freqs.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Softer sine/triangle mix perception
            osc.type = 'sine';
            osc.frequency.value = freq;

            // Slow LFO for volume pulsing
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.05 + (Math.random() * 0.05); // Very slow

            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 0.08; // Pulse depth
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);

            gain.gain.value = 0.08; // Base volume for this osc

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start();
            lfo.start();

            ambientOscl.push({ osc, lfo, gain, lfoGain });
        });

        isPlayingAmbient = true;
        startMelodyEngine();
    }

    // Generative, sparse melody engine
    function startMelodyEngine() {
        if (!ctx) return;

        const playPluck = () => {
            if (!isPlayingAmbient) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Choose random note from pentatonic scale
            const freq = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];

            osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            // Soft mallet envelope
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start();
            osc.stop(ctx.currentTime + 3.5);

            // Schedule next pluck randomly between 2s and 6s
            const nextTime = 2000 + (Math.random() * 4000);
            melodyInterval = setTimeout(playPluck, nextTime);
        };

        // Start first pluck after 3 seconds
        melodyInterval = setTimeout(playPluck, 3000);
    }

    function stopAmbient() {
        ambientOscl.forEach(node => {
            node.osc.stop();
            node.lfo.stop();
            node.osc.disconnect();
        });
        ambientOscl = [];
        isPlayingAmbient = false;
        if (melodyInterval) {
            clearTimeout(melodyInterval);
            melodyInterval = null;
        }
    }

    // A pleasant chime when a rule is discovered
    function playDiscoveryChime() {
        if (!ctx) init();
        ctx.resume();

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator(); // 3rd voice for harmony
        const gain = ctx.createGain();

        // Harmonious Major Chord (C, E, G)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(783.99, ctx.currentTime); // G5

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);

        osc1.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(masterGain);

        osc1.start();
        osc2.start();
        osc3.start();
        osc1.stop(ctx.currentTime + 3.5);
        osc2.stop(ctx.currentTime + 3.5);
        osc3.stop(ctx.currentTime + 3.5);
    }

    function playCheckFound() {
        if (!ctx) init();
        ctx.resume();
        const now = ctx.currentTime;

        // A satisfying AAA "Rule Found" chime (A major arpeggio going up)
        const A4 = 440.0;
        const Cs5 = 554.37;
        const E5 = 659.25;
        const A5 = 880.0;

        const playNote = (freq, timeOffset) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.value = freq;
            osc.type = 'triangle';

            gain.gain.setValueAtTime(0, now + timeOffset);
            gain.gain.linearRampToValueAtTime(0.4, now + timeOffset + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 1.5);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now + timeOffset);
            osc.stop(now + timeOffset + 1.6);
        };

        playNote(A4, 0.0);
        playNote(Cs5, 0.1);
        playNote(E5, 0.2);
        playNote(A5, 0.35); // Satisfying resolution
    }

    function playClick() {
        if (!ctx) init();
        ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }

    return {
        init,
        startAmbient,
        stopAmbient,
        playDiscoveryChime: playCheckFound, // Map Rule Discovery to new AAA function
        playVictoryChime: playDiscoveryChime, // The big chord is now for victory
        playClick,
        setVolume: (val) => {
            if (!ctx) init();
            masterGain.gain.value = val;
        }
    };
})();
