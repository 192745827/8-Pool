import React from 'react';
import useSettingsStore from '../store/useSettingsStore';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n/translations';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const currentLang = useSettingsStore((state) => state.settings.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  if (compact) {
    return (
      <select
        value={currentLang}
        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
        className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl outline-none cursor-pointer hover:border-cyan-400 transition-all"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isSelected = currentLang === lang.code;

        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
              isSelected
                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <div className="text-left">
              <p className="text-xs font-extrabold text-white">{lang.nativeName}</p>
              <p className="text-[10px] font-bold text-slate-400">{lang.name}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSelector;
