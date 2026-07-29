"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { COPY, DEFAULT_LANG, isLang, type Copy } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

interface LanguageValue {
  lang: Lang;
  copy: Copy;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageValue | null>(null);

function applyToDocument(lang: Lang) {
  const el = document.documentElement;
  el.lang = lang;
  el.dir = lang === "fa" ? "rtl" : "ltr";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Server always renders the default (Farsi); the URL param is applied on mount.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (isLang(fromUrl) && fromUrl !== DEFAULT_LANG) {
      setLangState(fromUrl);
      applyToDocument(fromUrl);
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    applyToDocument(next);

    /*
     * Language lives in the URL, never in localStorage/sessionStorage - those are
     * unreliable (and sometimes throw) inside the WhatsApp and Instagram in-app
     * browsers this invitation will mostly be opened in.
     */
    try {
      const url = new URL(window.location.href);
      if (next === DEFAULT_LANG) url.searchParams.delete("lang");
      else url.searchParams.set("lang", next);
      window.history.replaceState(null, "", url.toString());
    } catch {
      /* history API unavailable in some embedded webviews - language still works */
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "fa" ? "en" : "fa");
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={{ lang, copy: COPY[lang], setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
