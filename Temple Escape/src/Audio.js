/**
 * Audio.js - Procedural Web Audio API Sound Synthesizer & Jungle Drums
 * Generates all game sound effects and tribal chase drums procedurally.
 * Works 100% offline without any external audio asset dependencies.
 */

class SoundSystem {
    constructor() {
        this.ctx = null;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        this.muted = false;
        this.musicPlaying = false;
        this.drumStep = 0;
        this.drumTimer = null;
        this.tempo = 128; // BPM
        
        // Load saved audio preferences
        try {
            const savedSfx = localStorage.getItem('temple_sfx_volume');
            if (savedSfx !== null) this.sfxVolume = parseFloat(savedSfx);
            const savedMusic = localStorage.getItem('temple_music_volume');
            if (savedMusic !== null) this.musicVolume = parseFloat(savedMusic);
            const savedMuted = localStorage.getItem('temple_muted');
            if (savedMuted !== null) this.muted = savedMuted === 'true';
        } catch (e) {
            console.warn('LocalStorage audio read error:', e);
        }
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // --- SFX GENERATORS ---

    playFootstep(surface = 'stone') {
        if (this.muted || !this.ctx || this.sfxVolume <= 0) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        const baseFreq = surface === 'wood' ? 140 : 180;
        osc.frequency.setValueAtTime(baseFreq + Math.random() * 20, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    playCoin() {
        if (this.muted || !this.ctx || this.sfxVolume <= 0) return;
        this.init();

        const now = this.ctx.currentTime;
        const notes = [987.77, 1174.66, 1318.51, 1567.98, 1760.00]; // B5, D6, E6, G6, A6 pentatonic
        const freq = notes[Math.floor(Math.random() * notes.length)];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.setValueAtTime(freq * 1.5, now + 0.03);

        gain.gain.setValueAtTime(0.28 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.23);
    }

    playJump() {
        if (this.muted || !this.ctx || this.sfxVolume <= 0) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);

        gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.23);
    }

    playSlide() {
        if (this.muted || !this.ctx || this.sfxVolume <= 0) return;
        this.init();

        const now = this.ctx.currentTime;
        // Filtered noise for slide scrape
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.4;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);
        filter.Q.value = 3.0;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.26);
    }

    playTurn() {
        if (this.muted || !this.ctx || this.sfxVolume <= 0) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

        gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playStumble() {
        if (this.muted || !this.ctx || this.sfxVolume <= 0) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

        gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
    }

    playPowerup() {
        if (this.muted || !this.ctx || this.sfxVolume <= 0) return;
        this.init();

        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880]; // A major triad fanfare
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + i * 0.06;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.28 * this.sfxVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    playRoar() {
        if (this.muted || !this.ctx || this.sfxVolume <= 0) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(95, now);
        osc1.frequency.linearRampToValueAtTime(70, now + 0.4);
        osc1.frequency.exponentialRampToValueAtTime(45, now + 0.7);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(98, now);
        osc2.frequency.linearRampToValueAtTime(73, now + 0.4);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, now);
        filter.frequency.linearRampToValueAtTime(550, now + 0.25);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.7);

        gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.76);
        osc2.stop(now + 0.76);
    }

    playCrash() {
        if (this.muted || !this.ctx || this.sfxVolume <= 0) return;
        this.init();

        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.45;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.8;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(260, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.45);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.46);
    }

    playClick() {
        if (this.muted || !this.ctx || this.sfxVolume <= 0) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

        gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    playCountdown(isFinal = false) {
        if (this.muted || !this.ctx || this.sfxVolume <= 0) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isFinal ? 'triangle' : 'sine';
        const freq = isFinal ? 880 : 587.33; // A5 for GO!, D5 for 3, 2, 1
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.35 : 0.18));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + (isFinal ? 0.36 : 0.19));
    }

    // --- PROCEDURAL JUNGLE CHASE DRUMS SOUNDTRACK ---

    startMusic() {
        if (this.musicPlaying) return;
        this.init();
        this.musicPlaying = true;
        this.drumStep = 0;
        this.scheduleDrums();
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this.drumTimer) {
            clearTimeout(this.drumTimer);
            this.drumTimer = null;
        }
    }

    scheduleDrums() {
        if (!this.musicPlaying || this.muted || this.musicVolume <= 0) {
            if (this.musicPlaying) {
                this.drumTimer = setTimeout(() => this.scheduleDrums(), 150);
            }
            return;
        }

        const stepTime = (60 / this.tempo) / 4; // 16th notes
        this.playDrumStep(this.drumStep);
        this.drumStep = (this.drumStep + 1) % 16;

        this.drumTimer = setTimeout(() => this.scheduleDrums(), stepTime * 1000);
    }

    playDrumStep(step) {
        if (!this.ctx || this.ctx.state !== 'running') return;
        const now = this.ctx.currentTime;
        const vol = this.musicVolume * 0.35;

        // Bass Kick: steps 0, 4, 8, 10, 12
        if (step === 0 || step === 4 || step === 8 || step === 10 || step === 12) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(110, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
            gain.gain.setValueAtTime(vol * 0.9, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        }

        // Tribal Tom / Conga: steps 2, 6, 9, 14
        if (step === 2 || step === 6 || step === 9 || step === 14) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const freq = (step === 2 || step === 14) ? 220 : 165;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);
            gain.gain.setValueAtTime(vol * 0.65, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.11);
        }

        // Shaker / Jungle Maraca: all odd steps
        if (step % 2 === 1) {
            const bufferSize = this.ctx.sampleRate * 0.035;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.3;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(3500, now);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(vol * 0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
            noise.stop(now + 0.04);
        }
    }

    setSfxVolume(v) {
        this.sfxVolume = Math.max(0, Math.min(1, v));
        try { localStorage.setItem('temple_sfx_volume', this.sfxVolume); } catch (e) {}
    }

    setMusicVolume(v) {
        this.musicVolume = Math.max(0, Math.min(1, v));
        try { localStorage.setItem('temple_music_volume', this.musicVolume); } catch (e) {}
    }

    toggleMute() {
        this.muted = !this.muted;
        try { localStorage.setItem('temple_muted', this.muted); } catch (e) {}
        return this.muted;
    }
}

window.soundSystem = new SoundSystem();

// Auto-unlock audio on first user gesture
const unlockAudio = () => {
    if (window.soundSystem) {
        window.soundSystem.init();
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
};
window.addEventListener('click', unlockAudio);
window.addEventListener('keydown', unlockAudio);
window.addEventListener('touchstart', unlockAudio);
