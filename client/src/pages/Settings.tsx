import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../store/useSettingsStore';
import useTranslation from '../hooks/useTranslation';
import LanguageSelector from '../components/LanguageSelector';

export const Settings: React.FC = () => {
  const { settings, setMusicVolume, setSfxVolume, setGraphicsQuality, setShadowQuality, setFpsLimit, setTheme, setLanguage } = useSettingsStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleReset = () => {
    setMusicVolume(50);
    setSfxVolume(70);
    setGraphicsQuality('high');
    setShadowQuality('high');
    setFpsLimit('unlimited');
    setTheme('dark');
    setLanguage('en');
    triggerToast();
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8 relative">
      {/* Toast Notification */}
      <div 
        className={`fixed bottom-8 right-8 z-50 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-display font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all duration-300 transform flex items-center gap-2 ${
          showToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
        }`}
      >
        <span>✓</span> {t('settingsSaved')}
      </div>

      <div className="p-8 bg-slate-900 border border-white/10 rounded-2xl shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-pool-cyan/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-pool-purple/5 blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="mb-8 text-left">
          <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-pool-cyan/15 text-pool-cyan border border-pool-cyan/35 rounded-full select-none">
            {t('language').toUpperCase()}: {settings.language.toUpperCase()}
          </span>
          <h2 className="text-3xl font-extrabold font-display text-white mt-4 tracking-wide">
            {t('settingsTitle')}
          </h2>
          <p className="text-xs text-slate-400 font-body mt-2 leading-relaxed">
            {t('settingsSubtitle')}
          </p>
        </div>

        {/* Form Controls */}
        <div className="space-y-6 text-left border-y border-white/5 py-6">
          
          {/* 1. Language selector */}
          <div>
            <label className="text-sm font-bold text-white font-display block mb-1">
              🌐 {t('language')} / Internationalization
            </label>
            <p className="text-[10px] text-slate-400 font-body mb-3">Select your preferred localization language (English, Hindi, Spanish, French).</p>
            <LanguageSelector />
          </div>

          {/* 2. Theme selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-sm font-bold text-white font-display block">
                🎨 {t('theme')}
              </label>
              <span className="text-[10px] text-slate-400 font-body">Change interface color palette and atmosphere.</span>
            </div>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
              {(['dark', 'light', 'neon'] as const).map((tVal) => (
                <button
                  key={tVal}
                  onClick={() => {
                    setTheme(tVal);
                    triggerToast();
                  }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-200 ${
                    settings.theme === tVal
                      ? 'bg-pool-cyan text-pool-dark font-extrabold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t(tVal)}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Music Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-white font-display flex items-center gap-2">
                🎵 {t('musicVolume')}
              </label>
              <span className="text-xs font-black text-pool-cyan font-display">{settings.musicVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.musicVolume}
              onChange={(e) => setMusicVolume(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-pool-cyan"
            />
          </div>

          {/* 4. SFX Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-white font-display flex items-center gap-2">
                🔊 {t('sfxVolume')}
              </label>
              <span className="text-xs font-black text-pool-cyan font-display">{settings.sfxVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.sfxVolume}
              onChange={(e) => setSfxVolume(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-pool-cyan"
            />
          </div>

          {/* 5. Graphics Quality */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-sm font-bold text-white font-display block">
                🎮 {t('graphicsQuality')}
              </label>
              <span className="text-[10px] text-slate-400 font-body">Controls model resolution and render quality.</span>
            </div>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
              {(['low', 'medium', 'high'] as const).map((qVal) => (
                <button
                  key={qVal}
                  onClick={() => {
                    setGraphicsQuality(qVal);
                    triggerToast();
                  }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-200 ${
                    settings.graphicsQuality === qVal
                      ? 'bg-pool-cyan text-pool-dark font-extrabold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t(qVal)}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Shadow Quality */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-sm font-bold text-white font-display block">
                👥 {t('shadowQuality')}
              </label>
              <span className="text-[10px] text-slate-400 font-body">Adjust shadow maps resolution for performance.</span>
            </div>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
              {(['low', 'medium', 'high'] as const).map((sVal) => (
                <button
                  key={sVal}
                  onClick={() => {
                    setShadowQuality(sVal);
                    triggerToast();
                  }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-200 ${
                    settings.shadowQuality === sVal
                      ? 'bg-pool-cyan text-pool-dark font-extrabold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t(sVal)}
                </button>
              ))}
            </div>
          </div>

          {/* 7. FPS Limit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-sm font-bold text-white font-display block">
                ⚡ {t('fpsLimit')}
              </label>
              <span className="text-[10px] text-slate-400 font-body">Cap frame rates to save energy/battery on laptops.</span>
            </div>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
              {(['30', '60', 'unlimited'] as const).map((fVal) => (
                <button
                  key={fVal}
                  onClick={() => {
                    setFpsLimit(fVal);
                    triggerToast();
                  }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition duration-200 ${
                    settings.fpsLimit === fVal
                      ? 'bg-pool-cyan text-pool-dark font-extrabold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fVal === 'unlimited' ? t('unlimited') : `${fVal} FPS`}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Buttons Area */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={handleReset}
            className="py-3 px-6 bg-slate-950 border border-white/5 hover:bg-slate-950/80 text-slate-400 hover:text-slate-200 font-display font-bold text-xs rounded-xl shadow transition duration-200 cursor-pointer"
          >
            ↩ {t('resetDefaults')}
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="py-3 px-8 bg-gradient-to-r from-pool-cyan to-pool-cyan/85 hover:brightness-110 active:scale-95 text-pool-dark font-display font-black text-xs uppercase tracking-widest rounded-xl shadow transition duration-200 cursor-pointer shadow-pool-cyan/15"
          >
            ← {t('backToDashboard')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
