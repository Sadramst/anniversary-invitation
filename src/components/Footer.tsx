"use client";

import type { Couple } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { Monogram } from "./Monogram";

export function Footer({ couple }: { couple: Couple }) {
  const { lang, copy } = useLanguage();
  const names = lang === "fa" ? couple.farsi_names : couple.english_names;

  return (
    <footer className="mt-24 flex flex-col items-center gap-5 border-t border-gold/15 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-14 text-center">
      <Monogram initials={couple.initials} lang={lang} variant="compact" className="h-16 w-16 opacity-85" />
      <p className="heading gold-text text-xl sm:text-2xl">{names}</p>
      <p className="max-w-sm text-sm text-cream-dim">{copy.footerClosing}</p>
      <div className="gold-rule h-px w-16 opacity-50" aria-hidden="true" />
      <p className="text-[0.68rem] tracking-[0.24em] text-cream-dim/50" dir="ltr">
        MMXVI — MMXXVI
      </p>
    </footer>
  );
}
