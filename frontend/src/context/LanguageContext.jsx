import React, { createContext, useState, useContext, useEffect } from 'react';
import { languageService } from '../services/languageService';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    // Load saved language preference on mount
    const savedLanguage = languageService.getLanguage();
    setLanguageState(savedLanguage);
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    languageService.setLanguage(lang);
  };

  const t = (key) => {
    return languageService.t(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
