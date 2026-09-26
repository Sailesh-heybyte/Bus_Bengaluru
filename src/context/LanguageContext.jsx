import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import en from '../i18n/en.js';
import kn from '../i18n/kn.js';
import hi from '../i18n/hi.js';

const dictionaries = { en, kn, hi };
const STORAGE_KEY = 'kbus_demo_language';

const getInitialLanguage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && dictionaries[stored]) {
      return stored;
    }
  } catch (e) {
    console.error('Error reading language from localStorage:', e);
  }
  return 'en';
};

export const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((updaterOrLang) => {
    setLanguageState((prev) => {
      const next = typeof updaterOrLang === 'function' ? updaterOrLang(prev) : updaterOrLang;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        console.error('Error saving language to localStorage:', e);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key) => {
    const dict = dictionaries[language] || dictionaries.en;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    if (dictionaries.en && dictionaries.en[key] !== undefined) {
      return dictionaries.en[key];
    }
    return key;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;
