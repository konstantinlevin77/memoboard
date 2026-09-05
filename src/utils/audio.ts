// Minimalist, organic audio synthesis for tactile feedback using Web Audio API
// Zero external assets, instant playback, completely offline-compatible.

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Load mute preference from storage if exists
    const storedMute = localStorage.getItem('memoboard_sound_muted');
    if (storedMute === 'true') {
      this.isMuted = true;
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.createNoiseBuffer();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private createNoiseBuffer(): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 1.0; // 1 second of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink-ish noise filter for warmer paper sound
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
    }
    this.noiseBuffer = buffer;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('memoboard_sound_muted', String(this.isMuted));
    return this.isMuted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Minimalist, warm tactile tap when placing or pinning a note to the corkboard.
   * Combination of soft cork thud and paper contact.
   */
  playPlaceSound(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Soft cork thud (muted low sine thump)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

    oscGain.gain.setValueAtTime(0.18, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);

    // 2. Paper surface contact (soft filtered noise click)
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.05);
    }
  }

  /**
   * Minimalist paper crumple & discard sound when dropping a note into the wastebasket.
   */
  playTrashSound(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.noiseBuffer) return;

    const now = ctx.currentTime;

    // A sequence of 3 subtle modulated paper rustle bursts
    const bursts = [
      { delay: 0.00, freq: 1600, duration: 0.06, gain: 0.16 },
      { delay: 0.04, freq: 900, duration: 0.08, gain: 0.14 },
      { delay: 0.09, freq: 650, duration: 0.10, gain: 0.12 }
    ];

    bursts.forEach(({ delay, freq, duration, gain }) => {
      if (!ctx || !this.noiseBuffer) return;
      const t = now + delay;
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, t);
      filter.Q.setValueAtTime(2.0, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(gain, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(t);
      noise.stop(t + duration + 0.01);
    });

    // Muted bottom-of-can tap
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.16);

    oscGain.gain.setValueAtTime(0.12, now + 0.08);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now + 0.08);
    osc.stop(now + 0.17);
  }
}

export const soundManager = new SoundManager();
