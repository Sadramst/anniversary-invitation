"use client";

import type { Couple, Greeting, Invite } from "@/lib/types";
import { FloralCorner, Ornament } from "./Florals";
import { useLanguage } from "./LanguageProvider";
import { Monogram } from "./Monogram";

interface HeroProps {
  invite: Invite;
  couple: Couple;
  /** Pre-split date parts, formatted on the server so there is no hydration drift. */
  dateParts: { weekday: Greeting; day: Greeting; monthYear: Greeting };
  timeLabel: Greeting;
}

/** Thin gold arch that frames the hero, exactly as in the reference. */
function ArchFrame() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-4 top-4 bottom-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]"
      viewBox="0 0 400 700"
      preserveAspectRatio="none"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M 8 692 L 8 210 A 192 192 0 0 1 392 210 L 392 692"
        stroke="#c2a05a"
        strokeWidth="1.4"
        opacity="0.55"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M 20 692 L 20 214 A 180 180 0 0 1 380 214 L 380 692"
        stroke="#c2a05a"
        strokeWidth="0.7"
        opacity="0.32"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function Hero({ invite, couple, dateParts, timeLabel }: HeroProps) {
  const { lang, copy } = useLanguage();
  const fa = lang === "fa";

  const greeting = fa ? invite.greeting.fa : invite.greeting.en;
  const tagline = fa ? couple.tagline.fa : couple.tagline.en;

  // Two names either side of a gold ampersand, as in the reference. Falls back
  // to the single joined string if `name_parts` is not filled in.
  const parts = fa ? couple.name_parts?.fa : couple.name_parts?.en;
  const joined = fa ? couple.farsi_names : couple.english_names;

  return (
    <header className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <ArchFrame />

      {/* Corner bouquets. Hidden from very small screens where they'd crowd the text. */}
      <FloralCorner className="pointer-events-none absolute -end-10 -top-10 h-56 w-56 opacity-95 sm:h-80 sm:w-80" />
      <FloralCorner
        flip
        className="pointer-events-none absolute -bottom-12 -start-12 h-52 w-52 opacity-90 sm:h-72 sm:w-72"
      />

      <div className="animate-fade-up relative z-10 flex w-full max-w-xl flex-col items-center gap-6">
        <Monogram
          initials={couple.initials}
          initialsFa={couple.initials_fa}
          lang={lang}
          className="h-24 w-24 sm:h-28 sm:w-28"
        />

        {/* Couple's names ------------------------------------------------ */}
        {/*
          The `&` is decorative typography; without an explicit label the
          accessible name would read "Niloofar & Sadra" instead of the proper
          joined form from the guest data.
        */}
        <h1 aria-label={joined} className="display text-5xl leading-tight text-wine sm:text-7xl">
          {parts && parts.length >= 2 ? (
            <>
              <span>{parts[0]}</span>
              <span
                aria-hidden="true"
                className="mx-3 align-middle font-serif text-3xl italic text-gold sm:mx-4 sm:text-5xl"
              >
                &amp;
              </span>
              <span>{parts[1]}</span>
            </>
          ) : (
            joined
          )}
        </h1>

        <Ornament className="h-5 w-56 opacity-90 sm:w-72" />

        <p className="display text-xl text-gold-deep sm:text-2xl">{copy.anniversaryLabel}</p>

        {/* The personalised greeting - resolved from the slug, never typed by the guest */}
        <p data-testid="guest-greeting" className="heading text-2xl text-wine-soft sm:text-3xl">
          <span className="text-ink-soft">{copy.greetingPrefix}</span>{" "}
          <span className="text-wine">{greeting}</span>
        </p>

        <p className="max-w-md text-sm text-ink-soft sm:text-base">{tagline}</p>

        {/* Date strip: weekday | day + month/year | time ------------------ */}
        <dl
          data-testid="hero-date"
          className="mt-2 flex items-center justify-center divide-x divide-gold/40 rtl:divide-x-reverse"
        >
          <div className="px-5 sm:px-7">
            <dd className="text-sm text-ink sm:text-base">{fa ? dateParts.weekday.fa : dateParts.weekday.en}</dd>
          </div>

          <div className="px-5 sm:px-7">
            <dd className="display text-4xl leading-none text-wine sm:text-5xl">
              {fa ? dateParts.day.fa : dateParts.day.en}
            </dd>
            <dd className="mt-1.5 text-sm text-ink sm:text-base">
              {fa ? dateParts.monthYear.fa : dateParts.monthYear.en}
            </dd>
          </div>

          <div className="px-5 sm:px-7">
            <dd className="text-sm text-ink sm:text-base" dir={fa ? "rtl" : "ltr"}>
              {fa ? timeLabel.fa : timeLabel.en}
            </dd>
          </div>
        </dl>
      </div>

      {/* Scroll cue */}
      <a
        href="#invitation"
        aria-label={copy.scrollCue}
        className="animate-shimmer absolute bottom-10 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-gold/45 bg-paper-warm/70 text-gold-deep transition hover:border-gold hover:text-wine"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
    </header>
  );
}
