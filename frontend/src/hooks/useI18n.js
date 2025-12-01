import { useState, useEffect, createContext, useContext } from 'react';
import enTranslations from '../i18n/en.json';
import ruTranslations from '../i18n/ru.json';

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first - ONLY manual choice
    const savedLanguage = localStorage.getItem('cargwin_language');
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // Always default to EN (ignore browser language)
    return 'en';
  });
  
  const [translations, setTranslations] = useState(enTranslations);

  useEffect(() => {
    // Update translations when language changes
    const newTranslations = language === 'ru' ? ruTranslations : enTranslations;
    setTranslations(newTranslations);
    
    // Save language preference
    localStorage.setItem('cargwin_language', language);
    
    // Update document language attribute
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (newLanguage) => {
    if (newLanguage === 'en' || newLanguage === 'ru') {
      setLanguage(newLanguage);
    }
  };

  const t = (key, params = {}) => {
    const keyPath = key.split('.');
    let value = translations;
    
    for (const path of keyPath) {
      value = value?.[path];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    // Simple interpolation for params like {{count}}
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  };

  const value = {
    language,
    changeLanguage,
    t,
    isRussian: language === 'ru',
    isEnglish: language === 'en'
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};