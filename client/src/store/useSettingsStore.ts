import { create } from 'zustand';
import { audioManager } from '../audio';

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  shadowQuality: 'low' | 'medium' | 'high';
  fpsLimit: '30' | '60' | 'unlimited';
  theme: 'dark' | 'light' | 'neon';
  language: 'en' | 'es' | 'fr' | 'de';
}

interface SettingsState {
  settings: GameSettings;
  setMusicVolume: (vol: number) => void;
  setSfxVolume: (vol: number) => void;
  setGraphicsQuality: (quality: 'low' | 'medium' | 'high') => void;
  setShadowQuality: (quality: 'low' | 'medium' | 'high') => void;
  setFpsLimit: (limit: '30' | '60' | 'unlimited') => void;
  setTheme: (theme: 'dark' | 'light' | 'neon') => void;
  setLanguage: (lang: 'en' | 'es' | 'fr' | 'de') => void;
}

const LOCAL_STORAGE_KEY = 'eight_pool_game_settings_config';

const getInitialSettings = (): GameSettings => {
  const defaults: GameSettings = {
    musicVolume: 50,
    sfxVolume: 70,
    graphicsQuality: 'high',
    shadowQuality: 'high',
    fpsLimit: 'unlimited',
    theme: 'dark',
    language: 'en',
  };

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const audioConfig = audioManager.getSettings();
      
      return {
        ...defaults,
        ...parsed,
        musicVolume: typeof audioConfig.musicVolume === 'number' ? audioConfig.musicVolume : defaults.musicVolume,
        sfxVolume: typeof audioConfig.sfxVolume === 'number' ? audioConfig.sfxVolume : defaults.sfxVolume,
      };
    }
  } catch (e) {
    console.warn('Failed to parse settings:', e);
  }
  return defaults;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: getInitialSettings(),
  setMusicVolume: (vol) => {
    audioManager.setMusicVolume(vol);
    const newSettings = { ...get().settings, musicVolume: vol };
    set({ settings: newSettings });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
  },
  setSfxVolume: (vol) => {
    audioManager.setSfxVolume(vol);
    const newSettings = { ...get().settings, sfxVolume: vol };
    set({ settings: newSettings });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
  },
  setGraphicsQuality: (quality) => {
    const newSettings = { ...get().settings, graphicsQuality: quality };
    set({ settings: newSettings });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
  },
  setShadowQuality: (quality) => {
    const newSettings = { ...get().settings, shadowQuality: quality };
    set({ settings: newSettings });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
  },
  setFpsLimit: (limit) => {
    const newSettings = { ...get().settings, fpsLimit: limit };
    set({ settings: newSettings });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
  },
  setTheme: (theme) => {
    const newSettings = { ...get().settings, theme };
    set({ settings: newSettings });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
    applyTheme(theme);
  },
  setLanguage: (lang) => {
    const newSettings = { ...get().settings, language: lang };
    set({ settings: newSettings });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
  },
}));

// Apply theme to document element
export const applyTheme = (theme: 'dark' | 'light' | 'neon') => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('theme-dark', 'theme-light', 'theme-neon');
  root.classList.add(`theme-${theme}`);
};

// Initialize theme on load
if (typeof window !== 'undefined') {
  const initialSettings = getInitialSettings();
  applyTheme(initialSettings.theme);
}
export default useSettingsStore;
