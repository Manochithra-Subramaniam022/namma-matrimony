'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'TA' | 'EN';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'TA',
  toggleLanguage: () => {},
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('TA');

  useEffect(() => {
    const saved = localStorage.getItem('namma_matrimony_language') as Language;
    if (saved && (saved === 'TA' || saved === 'EN')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('namma_matrimony_language', lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => {
      const next = prev === 'TA' ? 'EN' : 'TA';
      localStorage.setItem('namma_matrimony_language', next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
