import AudioSettings from './AudioSettings';

export class SoundEffects {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings;

  constructor(settings: AudioSettings) {
    this.settings = settings;
  }

  /**
   * Initializes the AudioContext lazily on user action triggers.
   */
  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Synthesizes billiard ball-to-ball collisions (resin click).
   */
  public playCollision(intensity: number = 1.0): void {
    const sfxGain = this.settings.getSfxGain();
    if (sfxGain <= 0) return;

    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    const volume = Math.min(Math.max(intensity, 0.15), 1.0) * sfxGain * 0.8;

    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);

    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Synthesizes rail/cushion impacts (bass thud).
   */
  public playCushion(intensity: number = 1.0): void {
    const sfxGain = this.settings.getSfxGain();
    if (sfxGain <= 0) return;

    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    const volume = Math.min(Math.max(intensity, 0.15), 1.0) * sfxGain * 1.2;

    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);

    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * Synthesizes cue stick strikes (friction chalk brush + wood tap).
   */
  public playCue(power: number = 50): void {
    const sfxGain = this.settings.getSfxGain();
    if (sfxGain <= 0) return;

    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    const volume = (power / 100) * sfxGain * 0.9;

    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Chalk brush highpass noise burst
    try {
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(2200, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.05);
    } catch (e) {
      // Fallback
    }

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Synthesizes pocket drop plops (hollow pitch drops).
   */
  public playPocket(): void {
    const sfxGain = this.settings.getSfxGain();
    if (sfxGain <= 0) return;

    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';

    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.28);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.Q.setValueAtTime(3, now); // Add hollow resonance

    gainNode.gain.setValueAtTime(sfxGain * 1.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Synthesizes dual-oscillating foul alerts.
   */
  public playFoul(): void {
    const sfxGain = this.settings.getSfxGain();
    if (sfxGain <= 0) return;

    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(800, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(860, now);

    gainNode.gain.setValueAtTime(sfxGain * 0.45, now);
    gainNode.gain.linearRampToValueAtTime(sfxGain * 0.45, now + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.31);
    osc2.stop(now + 0.31);
  }

  /**
   * Plays a celebratory major arpeggio melody.
   */
  public playWin(): void {
    const sfxGain = this.settings.getSfxGain();
    if (sfxGain <= 0) return;

    const ctx = this.initContext();
    const now = ctx.currentTime;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4 -> E4 -> G4 -> C5 Major Arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(sfxGain * 0.5, now + idx * 0.12 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.42);
    });
  }

  /**
   * Plays a descending arpeggio melody on match loss.
   */
  public playLoss(): void {
    const sfxGain = this.settings.getSfxGain();
    if (sfxGain <= 0) return;

    const ctx = this.initContext();
    const now = ctx.currentTime;

    const notes = [293.66, 277.18, 261.63, 196.00]; // D4 -> C#4 -> C4 -> G3 Minor Descent
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(sfxGain * 0.5, now + idx * 0.16 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.6);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 0.62);
    });
  }
}

export default SoundEffects;
