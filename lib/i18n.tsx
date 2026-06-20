'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'de' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  de: {
    'nav.home': 'Home',
    'nav.watchlist': 'Watchlist',
    'nav.search': 'Suche',
    'nav.login': 'Login',
  },
  en: {
    'nav.home': 'Home',
    'nav.watchlist': 'Watchlist',
    'nav.search': 'Search',
    'nav.login': 'Login',
  }
};

const I18nContext = createContext<I18nContextType>({
  language: 'de',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('de');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'de' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
