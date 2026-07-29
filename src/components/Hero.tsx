"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { HERO_PHOTOS } from "@/lib/photos";
import type { Couple, Invite } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { Monogram } from "./Monogram";

interface HeroProps {
  invite: Invite;
  couple: Couple;
}

export function Hero({ invite, couple }: HeroProps) {
  const { lang, copy } = useLanguage();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % HERO_PHOTOS.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, []);

  const greeting = lang === "fa" ? invite.greeting.fa : invite.greeting.en;
  const names = lang === "fa" ? couple.farsi_names : couple.english_names;
  const tagline = lang === "fa" ? couple.tagline.fa : couple.tagline.en;

  return (
    <header className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/*
       * Layering note: these must NOT use a negative z-index. `body` carries an
       * opaque background, and per the CSS painting order a block-level
       * background paints after negative-z descendants - which silently hid the
       * photos completely. Everything here stays on a non-negative stack.
       */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {HERO_PHOTOS.map((photo, i) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt=""
            fill
            priority={i === 0}
            quality={85}
            sizes="100vw"
            // Biased slightly above centre so the couple stays in frame when a
            // wide desktop viewport crops the top and bottom off a tall photo.
            className={`animate-slow-zoom object-cover object-[50%_42%] transition-opacity duration-[2000ms] ease-in-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Scrim: dark enough for accessible text, light enough to let the photo through */}
      <div
        className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(16,12,12,0.46)_0%,rgba(16,12,12,0.7)_55%,rgba(16,12,12,0.92)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 z-[1] h-32 bg-gradient-to-b from-ink/80 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 z-[1] h-56 bg-gradient-to-b from-transparent to-ink"
        aria-hidden="true"
      />

      <div className="animate-fade-up relative z-10 flex w-full max-w-2xl flex-col items-center gap-7">
        <Monogram initials={couple.initials} lang={lang} className="h-40 w-40 sm:h-48 sm:w-48" />

        <p className="text-xs uppercase tracking-[0.32em] text-gold-soft/90 sm:text-sm">
          {copy.anniversaryLabel}
        </p>

        <h1 className="heading gold-text text-4xl leading-tight sm:text-6xl">{names}</h1>

        <div className="gold-rule h-px w-40 opacity-80" aria-hidden="true" />

        {/* The personalised greeting - resolved from the slug, never typed by the guest */}
        <p
          data-testid="guest-greeting"
          className="heading text-2xl text-cream sm:text-4xl"
        >
          <span className="text-rose-soft">{copy.greetingPrefix}</span>{" "}
          <span className="gold-text">{greeting}</span>
        </p>

        <p className="max-w-md text-base text-cream-dim sm:text-lg">{tagline}</p>
      </div>

      {/* Scroll cue */}
      <div className="animate-shimmer absolute bottom-8 z-10 flex flex-col items-center gap-2" aria-hidden="true">
        <span className="h-10 w-px bg-gradient-to-b from-transparent to-gold" />
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </header>
  );
}
