class AudioSystem {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.ambientOscl = [];
        this.isPlayingAmbient = false;
        this.melodyInterval = null;
        this.pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.ctx.destination);
    }

    startAmbient() {
        if (!this.ctx) this.init();
        if (this.isPlayingAmbient) return;

        this.ctx.resume();
        const freqs = [130.81, 196.00, 261.63];

        freqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const lfo = this.ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.05 + (Math.random() * 0.05);

            const lfoGain = this.ctx.createGain();
            lfoGain.gain.value = 0.08;
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);
            gain.gain.value = 0.08;

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            lfo.start();
            this.ambientOscl.push({ osc, lfo, gain, lfoGain });
        });

        this.isPlayingAmbient = true;
        this.startMelodyEngine();
    }

    startMelodyEngine() {
        if (!this.ctx) return;
        const playPluck = () => {
            if (!this.isPlayingAmbient) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const freq = this.pentatonicScale[Math.floor(Math.random() * this.pentatonicScale.length)];
            osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 3.5);

            const nextTime = 2000 + (Math.random() * 4000);
            this.melodyInterval = setTimeout(playPluck, nextTime);
        };
        this.melodyInterval = setTimeout(playPluck, 3000);
    }

    stopAmbient() {
        this.ambientOscl.forEach(node => {
            node.osc.stop();
            node.lfo.stop();
            node.osc.disconnect();
        });
        this.ambientOscl = [];
        this.isPlayingAmbient = false;
        if (this.melodyInterval) {
            clearTimeout(this.melodyInterval);
            this.melodyInterval = null;
        }
    }

    playCheckFound() {
        if (!this.ctx) this.init();
        this.ctx.resume();
        const now = this.ctx.currentTime;
        const A4 = 440.0;
        const Cs5 = 554.37;
        const E5 = 659.25;
        const A5 = 880.0;

        const playNote = (freq, timeOffset) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.value = freq;
            osc.type = 'triangle';
            gain.gain.setValueAtTime(0, now + timeOffset);
            gain.gain.linearRampToValueAtTime(0.4, now + timeOffset + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 1.5);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + timeOffset);
            osc.stop(now + timeOffset + 1.6);
        };

        playNote(A4, 0.0);
        playNote(Cs5, 0.1);
        playNote(E5, 0.2);
        playNote(A5, 0.35);
    }

    playVictoryChime() {
        if (!this.ctx) this.init();
        this.ctx.resume();
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const osc3 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine'; osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
        osc2.type = 'sine'; osc2.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5
        osc3.type = 'sine'; osc3.frequency.setValueAtTime(783.99, this.ctx.currentTime); // G5

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3);

        osc1.connect(gain); osc2.connect(gain); osc3.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(); osc2.start(); osc3.start();
        osc1.stop(this.ctx.currentTime + 3.5);
        osc2.stop(this.ctx.currentTime + 3.5);
        osc3.stop(this.ctx.currentTime + 3.5);
    }

    playClick() {
        if (!this.ctx) this.init();
        this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    setVolume(val) {
        if (!this.ctx) this.init();
        this.masterGain.gain.value = val;
    }
}

export const audio = new AudioSystem();
