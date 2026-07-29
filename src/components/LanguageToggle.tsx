"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { lang, copy, toggle } = useLanguage();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={toggle}
        aria-label={copy.switchLabel}
        data-testid="language-toggle"
        data-lang={lang}
        className="glass-card pointer-events-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-sm tracking-wide text-cream shadow-lg shadow-black/30 transition hover:border-gold/60 hover:text-gold-soft active:scale-95"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18" />
        </svg>
        <span className={lang === "fa" ? "font-serif" : "font-fa"}>{copy.switchTo}</span>
      </button>
    </div>
  );
}
