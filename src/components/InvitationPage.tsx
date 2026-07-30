"use client";

import Image from "next/image";

import { MAIN_PHOTO } from "@/lib/photos";
import type { InvitePageData } from "@/lib/types";
import { AddToCalendar } from "./AddToCalendar";
import { Countdown } from "./Countdown";
import { EventCard } from "./EventCard";
import { Ornament } from "./Florals";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { LanguageProvider, useLanguage } from "./LanguageProvider";
import { LanguageToggle } from "./LanguageToggle";
import { Reveal } from "./Reveal";

function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 20s-7.5-4.7-7.5-10A4.5 4.5 0 0 1 12 7.6 4.5 4.5 0 0 1 19.5 10c0 5.3-7.5 10-7.5 10Z" />
    </svg>
  );
}

function RingsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="9" cy="14" r="5.5" />
      <circle cx="16" cy="14" r="5.5" />
      <path d="m14 4 2-2 2 2-2 2z" />
    </svg>
  );
}

function GlassesIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 3h5l-1 6a2.5 2.5 0 0 1-5 0Zm3.5 8v9M5 21h5M20 3h-5l1 6a2.5 2.5 0 0 0 5 0Zm-3.5 8v9M14 21h5" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="9" width="18" height="12" rx="2" />
      <path d="M3 13h18M12 9v12M12 9S9.5 3.5 7 5.5 12 9 12 9Zm0 0s2.5-5.5 5-3.5S12 9 12 9Z" />
    </svg>
  );
}

const PILLAR_ICONS = [GiftIcon, GlassesIcon, RingsIcon, HeartIcon];

function InvitationBody(data: InvitePageData) {
  const { copy } = useLanguage();

  return (
    <>
      <a
        href="#invitation"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-paper-warm focus:px-5 focus:py-3 focus:text-wine"
      >
        {copy.skipToContent}
      </a>

      {/*
        The couple's portrait, washed almost all the way out so it reads as a
        paper texture rather than a photograph. `fixed` keeps it steady while the
        invitation scrolls over the top.
        Not negative z-index: `body` has an opaque background and block-level
        backgrounds paint AFTER negative-z descendants, which would hide it.
      */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <Image
          src={MAIN_PHOTO.src}
          alt=""
          data-testid="page-photo"
          fill
          priority
          quality={70}
          sizes="100vw"
          className="object-cover opacity-[0.05] blur-[2px]"
        />
        <div className="absolute inset-0 bg-paper/80" />
      </div>

      <div className="relative z-10">
        <LanguageToggle />

        <Hero
          invite={data.invite}
          couple={data.couple}
          dateParts={data.dateParts}
          timeLabel={data.timeLabel}
        />

        <main id="invitation" className="mx-auto w-full max-w-3xl px-5 sm:px-6">
          {/* Invitation copy --------------------------------------------- */}
          <Reveal>
            <section aria-label={copy.detailsTitle} className="space-y-4 py-16 text-center sm:py-20">
              {copy.invitation.map((paragraph, i) => (
                <p key={i} className="text-sm text-ink sm:text-base">
                  {paragraph}
                </p>
              ))}
            </section>
          </Reveal>

          {/* Four pillars ------------------------------------------------ */}
          <Reveal>
            <ul className="paper-card grid grid-cols-2 gap-y-8 rounded-2xl px-6 py-9 sm:grid-cols-4 sm:gap-x-2 sm:px-8">
              {copy.pillars.map((pillar, i) => {
                const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
                return (
                  <li
                    key={pillar.title}
                    className="flex flex-col items-center gap-2.5 px-3 text-center sm:border-e sm:border-gold/25 sm:last:border-e-0"
                  >
                    <span className="text-gold-deep">
                      <Icon />
                    </span>
                    <h3 className="heading text-sm text-wine sm:text-base">{pillar.title}</h3>
                    <p className="text-xs leading-relaxed text-ink-soft sm:text-sm">{pillar.body}</p>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/* Countdown --------------------------------------------------- */}
          <Reveal delay={80}>
            <div className="py-16 sm:py-20">
              <Countdown startUtcIso={data.startUtcIso} />
            </div>
          </Reveal>

          {/* Event details + venue --------------------------------------- */}
          <Reveal>
            <EventCard
              venue={data.venue}
              dateLabel={data.dateLabel}
              timeLabel={data.timeLabel}
              mapUrl={data.mapUrl}
            />
          </Reveal>

          {/* Add to calendar --------------------------------------------- */}
          <Reveal>
            <div className="py-16 sm:py-20">
              <AddToCalendar
                icsContent={data.icsContent}
                googleCalendarUrl={data.googleCalendarUrl}
              />
            </div>
          </Reveal>

          <Ornament className="mx-auto h-5 w-56 opacity-70" />
        </main>

        <Footer couple={data.couple} />
      </div>
    </>
  );
}

export function InvitationPage(data: InvitePageData) {
  return (
    <LanguageProvider>
      <InvitationBody {...data} />
    </LanguageProvider>
  );
}
