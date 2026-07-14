import AudioSettings from './AudioSettings';

export class MusicManager {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings;
  private gainNode: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isActive = false;

  constructor(settings: AudioSettings) {
    this.settings = settings;
  }

  /**
   * Initializes the AudioContext lazily on trigger.
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
   * Starts synthesizing BGM ambient chord loops.
   */
  public start(): void {
    if (this.isActive) return;
    this.isActive = true;

    const musicGain = this.settings.getMusicGain();
    const ctx = this.initContext();
    const now = ctx.currentTime;

    // 1. Create arpeggiation gain controls node
    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, now);
    
    // Smooth arpeggiated music fade-in over 2.0s
    this.gainNode.gain.linearRampToValueAtTime(musicGain * 0.15, now + 2.0);
    this.gainNode.connect(ctx.destination);

    // 2. Synthesize ambient chord drone (C Major 9)
    // C2 (65.4Hz), G2 (98.0Hz), C3 (130.8Hz), E3 (164.8Hz), B3 (246.9Hz)
    const chordFrequencies = [65.41, 97.99, 130.81, 164.81, 246.94];

    chordFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      oscGain.gain.setValueAtTime(0.04, now);

      // Low Frequency Oscillator (LFO) to create swelling chord wave effects
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.05 + idx * 0.02, now); // 0.05Hz to 0.13Hz
      lfoGain.gain.setValueAtTime(0.015, now);

      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);

      osc.connect(oscGain);
      oscGain.connect(this.gainNode!);

      lfo.start(now);
      osc.start(now);

      this.oscillators.push(osc);
      this.oscillators.push(lfo);
    });
  }

  /**
   * Refreshes active BGM volume based on player settings.
   */
  public updateVolume(): void {
    if (!this.gainNode || !this.ctx) return;
    const musicGain = this.settings.getMusicGain();
    this.gainNode.gain.setTargetAtTime(musicGain * 0.15, this.ctx.currentTime, 0.3);
  }

  /**
   * Stops BGM, executing smooth fade-out.
   */
  public stop(): void {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(0, now + 1.0);

      setTimeout(() => {
        this.oscillators.forEach((osc) => {
          try {
            osc.stop();
          } catch (e) {}
        });
        this.oscillators = [];
        if (this.gainNode) {
          this.gainNode.disconnect();
          this.gainNode = null;
        }
      }, 1100);
    }
  }
}

export default MusicManager;
