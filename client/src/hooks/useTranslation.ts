import useSettingsStore from '../store/useSettingsStore';

export const translations = {
  en: {
    settingsTitle: "GAME SETTINGS",
    settingsSubtitle: "Customize your pool experience, audio parameters, graphics, and theme options.",
    musicVolume: "Music Volume",
    sfxVolume: "Sound Effects (SFX) Volume",
    graphicsQuality: "Graphics Quality",
    shadowQuality: "Shadow Quality",
    fpsLimit: "FPS Limit",
    theme: "UI Theme",
    language: "Language",
    
    low: "Low",
    medium: "Medium",
    high: "High",
    unlimited: "Unlimited",
    dark: "Dark Void",
    light: "Bright Field",
    neon: "Neon Cyber",
    english: "English",
    spanish: "Español",
    french: "Français",
    german: "Deutsch",

    backToDashboard: "Back to Dashboard",
    resetDefaults: "Reset to Defaults",
    settingsSaved: "Settings saved successfully!"
  },
  es: {
    settingsTitle: "AJUSTES DEL JUEGO",
    settingsSubtitle: "Personaliza tu experiencia de billar, parámetros de audio, gráficos y opciones de tema.",
    musicVolume: "Volumen de Música",
    sfxVolume: "Volumen de Efectos (SFX)",
    graphicsQuality: "Calidad de Gráficos",
    shadowQuality: "Calidad de Sombras",
    fpsLimit: "Límite de FPS",
    theme: "Tema de Interfaz",
    language: "Idioma",
    
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
    unlimited: "Ilimitado",
    dark: "Vacío Oscuro",
    light: "Campo Brillante",
    neon: "Cíber Neón",
    english: "English",
    spanish: "Español",
    french: "Français",
    german: "Deutsch",

    backToDashboard: "Volver al Tablero",
    resetDefaults: "Restablecer Valores",
    settingsSaved: "¡Ajustes guardados con éxito!"
  },
  fr: {
    settingsTitle: "PARAMÈTRES DU JEU",
    settingsSubtitle: "Personnalisez votre expérience de billard, l'audio, les graphismes et les thèmes.",
    musicVolume: "Volume de la Musique",
    sfxVolume: "Volume des Effets (SFX)",
    graphicsQuality: "Qualité Graphique",
    shadowQuality: "Qualité des Ombres",
    fpsLimit: "Limite de FPS",
    theme: "Thème de l'interface",
    language: "Langue",
    
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
    unlimited: "Illimité",
    dark: "Vide Sombre",
    light: "Champ Lumineux",
    neon: "Néon Cyber",
    english: "English",
    hindi: "हिंदी",
    spanish: "Español",
    french: "Français",

    backToDashboard: "Retour au Tableau",
    resetDefaults: "Réinitialiser",
    settingsSaved: "Paramètres enregistrés avec succès!"
  },
  hi: {
    settingsTitle: "गेम सेटिंग्स",
    settingsSubtitle: "अपने पूल अनुभव, ऑडियो पैरामीटर, ग्राफिक्स और थीम विकल्पों को अनुकूलित करें।",
    musicVolume: "संगीत वॉल्यूम",
    sfxVolume: "ध्वनि प्रभाव (SFX) वॉल्यूम",
    graphicsQuality: "ग्राफिक्स गुणवत्ता",
    shadowQuality: "शैडो गुणवत्ता",
    fpsLimit: "FPS सीमा",
    theme: "UI थीम",
    language: "भाषा",
    
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    unlimited: "असीमित",
    dark: "डार्क वॉइड",
    light: "ब्राइट फील्ड",
    neon: "नियोन साइबर",
    english: "English",
    hindi: "हिंदी",
    spanish: "Español",
    french: "Français",

    backToDashboard: "डैशबोर्ड पर वापस जाएं",
    resetDefaults: "रीसेट करें",
    settingsSaved: "सेटिंग्स सफलतापूर्वक सहेजी गईं!"
  }
};

export const useTranslation = () => {
  const language = useSettingsStore((state) => state.settings.language);
  const t = (key: keyof typeof translations.en) => {
    const langDict = (translations as Record<string, any>)[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };
  return { t, language };
};

export default useTranslation;
