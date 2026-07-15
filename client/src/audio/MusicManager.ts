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

  private currentTrack: 'home' | 'lobby' | 'game' | 'victory' | 'game-over' | null = null;

  /**
   * Starts synthesizing track-specific ambient BGM chord loops.
   */
  public start(track: 'home' | 'lobby' | 'game' | 'victory' | 'game-over' = 'home'): void {
    if (this.isActive && this.currentTrack === track) return;

    // If switching tracks, stop the current one instantly first
    if (this.isActive) {
      this.stopInstant();
    }
    
    this.isActive = true;
    this.currentTrack = track;

    const musicGain = this.settings.getMusicGain();
    const ctx = this.initContext();
    const now = ctx.currentTime;

    // 1. Create gain control node
    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, now);
    
    // Smooth arpeggiated music fade-in over 2.0s
    this.gainNode.gain.linearRampToValueAtTime(musicGain * 0.15, now + 2.0);
    this.gainNode.connect(ctx.destination);

    // 2. Select chord frequencies and LFO rates depending on BGM track context
    let chordFrequencies: number[] = [];
    let lfoRateMultiplier = 1.0;
    let volumeMultiplier = 0.04;

    switch (track) {
      case 'home':
        // Uplifting warm Major 7 (F -> C tones)
        chordFrequencies = [87.31, 130.81, 174.61, 220.00, 261.63];
        lfoRateMultiplier = 1.2;
        break;
      case 'lobby':
        // Suspended anticipation chord
        chordFrequencies = [73.42, 110.00, 146.83, 196.00, 220.00];
        lfoRateMultiplier = 0.9;
        break;
      case 'game':
        // Low focus deep pool salon drone (C Major 9)
        chordFrequencies = [65.41, 97.99, 130.81, 164.81, 246.94];
        lfoRateMultiplier = 0.7;
        break;
      case 'victory':
        // Bright, fast-cycling triumphant swells
        chordFrequencies = [130.81, 164.81, 196.00, 261.63, 329.63];
        lfoRateMultiplier = 2.0;
        volumeMultiplier = 0.055;
        break;
      case 'game-over':
        // Descending quiet minor key drone
        chordFrequencies = [65.41, 77.78, 116.54, 130.81, 196.00];
        lfoRateMultiplier = 0.6;
        volumeMultiplier = 0.03;
        break;
    }

    chordFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      oscGain.gain.setValueAtTime(volumeMultiplier, now);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      lfo.type = 'sine';
      // Adjust LFO rate based on selected track profile
      lfo.frequency.setValueAtTime((0.05 + idx * 0.02) * lfoRateMultiplier, now);
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
   * Helper to instantly dispose oscillators for seamless crossfading.
   */
  private stopInstant(): void {
    this.isActive = false;
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Intentionally left empty: oscillator may already be stopped
      }
    });
    this.oscillators = [];
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
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
          } catch (e) {
            // Intentionally left empty
          }
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
