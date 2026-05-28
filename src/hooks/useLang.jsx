import { createContext, useContext, useState } from 'react';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');
  const toggle = () => setLang(l => l === 'en' ? 'zh' : 'en');
  const t = (en, zh) => lang === 'zh' ? zh : en;
  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
