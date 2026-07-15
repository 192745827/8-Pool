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
    spanish: "Español",
    french: "Français",
    german: "Deutsch",

    backToDashboard: "Retour au Tableau",
    resetDefaults: "Réinitialiser",
    settingsSaved: "Paramètres enregistrés avec succès!"
  },
  de: {
    settingsTitle: "SPIELEINSTELLUNGEN",
    settingsSubtitle: "Passen Sie Ihr Billarderlebnis, Audio-Parameter, Grafik und Designs an.",
    musicVolume: "Musiklautstärke",
    sfxVolume: "Effektlautstärke (SFX)",
    graphicsQuality: "Grafikqualität",
    shadowQuality: "Schattenqualität",
    fpsLimit: "FPS-Begrenzung",
    theme: "UI-Design",
    language: "Sprache",
    
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
    unlimited: "Unbegrenzt",
    dark: "Dunkle Leere",
    light: "Helles Feld",
    neon: "Neon Cyber",
    english: "English",
    spanish: "Español",
    french: "Français",
    german: "Deutsch",

    backToDashboard: "Zurück zum Dashboard",
    resetDefaults: "Standard wiederherstellen",
    settingsSaved: "Einstellungen erfolgreich gespeichert!"
  }
};

export const useTranslation = () => {
  const language = useSettingsStore((state) => state.settings.language);
  const t = (key: keyof typeof translations.en) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };
  return { t, language };
};

export default useTranslation;
