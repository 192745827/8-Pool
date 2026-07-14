export interface AudioConfig {
  masterVolume: number; // 0 to 100
  musicVolume: number;  // 0 to 100
  sfxVolume: number;    // 0 to 100
  isMuted: boolean;
}

const LOCAL_STORAGE_KEY = 'eight_pool_audio_settings';

export class AudioSettings {
  private config: AudioConfig;

  constructor() {
    this.config = this.loadSettings();
  }

  private loadSettings(): AudioConfig {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          masterVolume: typeof parsed.masterVolume === 'number' ? parsed.masterVolume : 80,
          musicVolume: typeof parsed.musicVolume === 'number' ? parsed.musicVolume : 50,
          sfxVolume: typeof parsed.sfxVolume === 'number' ? parsed.sfxVolume : 70,
          isMuted: !!parsed.isMuted,
        };
      }
    } catch (e) {
      console.warn('Failed to load audio settings:', e);
    }
    return {
      masterVolume: 80,
      musicVolume: 50,
      sfxVolume: 70,
      isMuted: false,
    };
  }

  public saveSettings(): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save audio settings:', e);
    }
  }

  public getSettings(): AudioConfig {
    return this.config;
  }

  public setMasterVolume(vol: number): void {
    this.config.masterVolume = Math.min(Math.max(vol, 0), 100);
    this.saveSettings();
  }

  public setMusicVolume(vol: number): void {
    this.config.musicVolume = Math.min(Math.max(vol, 0), 100);
    this.saveSettings();
  }

  public setSfxVolume(vol: number): void {
    this.config.sfxVolume = Math.min(Math.max(vol, 0), 100);
    this.saveSettings();
  }

  public setMuted(muted: boolean): void {
    this.config.isMuted = muted;
    this.saveSettings();
  }

  /**
   * Returns gain node float factor (0.0 to 1.0) for sound effects.
   */
  public getSfxGain(): number {
    if (this.config.isMuted) return 0;
    return (this.config.masterVolume / 100) * (this.config.sfxVolume / 100);
  }

  /**
   * Returns gain node float factor (0.0 to 1.0) for ambient music.
   */
  public getMusicGain(): number {
    if (this.config.isMuted) return 0;
    return (this.config.masterVolume / 100) * (this.config.musicVolume / 100);
  }
}

export default AudioSettings;
