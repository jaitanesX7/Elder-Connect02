/**
 * Elder Connect - Speech & Audio Assistance Module
 * Uses Web Speech API for reading screen contents aloud
 * and Web Audio API for accessible feedback chimes & SOS sirens.
 */

const SpeechAssistant = {
  enabled: false,
  synth: window.speechSynthesis || null,
  audioCtx: null,
  sosOscillator: null,
  sosGain: null,
  sosInterval: null,

  init() {
    this.enabled = Storage.get('speech_enabled', false);
    this.updateToggleUI();

    // Listen for speech button clicks across document
    document.addEventListener('click', (e) => {
      const readBtn = e.target.closest('[data-read-aloud]');
      if (readBtn) {
        e.preventDefault();
        const textToRead = readBtn.getAttribute('data-read-aloud') || readBtn.innerText;
        this.speak(textToRead, true); // force read even if global toggle is off
      }
    });
  },

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  toggle() {
    this.enabled = !this.enabled;
    Storage.set('speech_enabled', this.enabled);
    this.updateToggleUI();

    if (this.enabled) {
      this.speak("Voice assistance is now turned on. I will read important updates and buttons for you.", true);
      this.playChime(660, 0.2);
    } else {
      if (this.synth) {
        this.synth.cancel();
      }
      this.speak("Voice assistance is turned off.", true);
    }
    return this.enabled;
  },

  updateToggleUI() {
    const toggleBtn = document.getElementById('toggle-speech-btn');
    if (!toggleBtn) return;
    const indicator = toggleBtn.querySelector('.toggle-indicator');
    if (this.enabled) {
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-pressed', 'true');
      if (indicator) indicator.textContent = 'Voice: ON';
    } else {
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-pressed', 'false');
      if (indicator) indicator.textContent = 'Voice: OFF';
    }
  },

  speak(text, force = false) {
    if ((!this.enabled && !force) || !this.synth) return;

    this.synth.cancel(); // Stop any pending speech

    // Clean text of markdown/emojis for smoother speech
    const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}|[\u{2600}-\u{26FF}]/gu, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9; // Slightly slower, clear cadence for seniors
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.synth.speak(utterance);
  },

  playChime(freq = 587.33, duration = 0.25) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      // Gentle harmonic chord
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio chime failed:", e);
    }
  },

  playSuccessBeep() {
    this.playChime(523.25, 0.15); // C5
    setTimeout(() => {
      this.playChime(659.25, 0.25); // E5
    }, 120);
  },

  startSOSSiren() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      this.stopSOSSiren();

      let high = false;
      const step = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(high ? 880 : 660, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.38);
        high = !high;
      };

      step();
      this.sosInterval = setInterval(step, 400);
    } catch (e) {
      console.warn("SOS siren error:", e);
    }
  },

  stopSOSSiren() {
    if (this.sosInterval) {
      clearInterval(this.sosInterval);
      this.sosInterval = null;
    }
  }
};
