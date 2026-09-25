import { createContext, useContext, useState, useEffect } from 'react';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');
  const toggle = () => setLang(l => l === 'en' ? 'zh' : 'en');
  const t = (en, zh) => lang === 'zh' ? zh : en;

  // <html lang> was hardcoded "en" in index.html and never followed the
  // toggle. In 中文 mode that has screen readers voicing Chinese with an
  // English voice, and lets the browser pick Han glyph variants by its
  // own guess instead of Traditional forms. zh-Hant: the site's Chinese
  // is Traditional throughout.
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
