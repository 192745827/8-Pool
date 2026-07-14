import AudioSettings from './AudioSettings';
import SoundEffects from './SoundEffects';
import MusicManager from './MusicManager';

export class AudioManager {
  private static instance: AudioManager | null = null;
  
  private settings: AudioSettings;
  private sfx: SoundEffects;
  private music: MusicManager;

  private constructor() {
    this.settings = new AudioSettings();
    this.sfx = new SoundEffects(this.settings);
    this.music = new MusicManager(this.settings);
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // ─── SOUND EFFECTS ACTIONS ───

  public playCollision(intensity: number = 1.0): void {
    this.sfx.playCollision(intensity);
  }

  public playCushion(intensity: number = 1.0): void {
    this.sfx.playCushion(intensity);
  }

  public playCue(power: number = 50): void {
    this.sfx.playCue(power);
  }

  public playPocket(): void {
    this.sfx.playPocket();
  }

  public playFoul(): void {
    this.sfx.playFoul();
  }

  public playWin(): void {
    this.sfx.playWin();
  }

  public playLoss(): void {
    this.sfx.playLoss();
  }

  // ─── MUSIC ACTIONS ───

  public startMusic(): void {
    this.music.start();
  }

  public stopMusic(): void {
    this.music.stop();
  }

  // ─── SETTINGS ACTIONS ───

  public getSettings() {
    return this.settings.getSettings();
  }

  public setMasterVolume(vol: number): void {
    this.settings.setMasterVolume(vol);
    this.music.updateVolume();
  }

  public setMusicVolume(vol: number): void {
    this.settings.setMusicVolume(vol);
    this.music.updateVolume();
  }

  public setSfxVolume(vol: number): void {
    this.settings.setSfxVolume(vol);
  }

  public setMuted(muted: boolean): void {
    this.settings.setMuted(muted);
    this.music.updateVolume();
  }
}

export const audioManager = AudioManager.getInstance();
export default audioManager;
