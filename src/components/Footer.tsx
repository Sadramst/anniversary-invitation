"use client";

import type { Couple } from "@/lib/types";
import { Ornament } from "./Florals";
import { useLanguage } from "./LanguageProvider";

export function Footer({ couple }: { couple: Couple }) {
  const { lang, copy } = useLanguage();
  const fa = lang === "fa";
  const names = fa ? couple.farsi_names : couple.english_names;

  return (
    <footer className="mt-24 bg-wine px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-12 text-center text-paper">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        <p className="text-sm text-paper/90 sm:text-base">{copy.footerClosing}</p>
        <Ornament className="h-4 w-44 opacity-80 brightness-125" />
        <p className="display text-xl text-paper sm:text-2xl">{names}</p>
        <p className="text-[0.68rem] tracking-[0.24em] text-paper/55" dir="ltr">
          MMXVI — MMXXVI
        </p>
      </div>
    </footer>
  );
}
