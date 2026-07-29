"use client";

import type { InvitePageData } from "@/lib/types";
import { AddToCalendar } from "./AddToCalendar";
import { Countdown } from "./Countdown";
import { EventCard } from "./EventCard";
import { Footer } from "./Footer";
import { Gallery } from "./Gallery";
import { Hero } from "./Hero";
import { LanguageProvider, useLanguage } from "./LanguageProvider";
import { LanguageToggle } from "./LanguageToggle";
import { Reveal } from "./Reveal";

function InvitationBody(data: InvitePageData) {
  const { copy } = useLanguage();

  return (
    <>
      <a
        href="#invitation"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink-soft focus:px-5 focus:py-3 focus:text-cream"
      >
        {copy.skipToContent}
      </a>

      <LanguageToggle />

      <Hero invite={data.invite} couple={data.couple} />

      <main id="invitation" className="mx-auto w-full max-w-2xl px-5 sm:px-6">
        {/* Invitation copy ------------------------------------------------ */}
        <Reveal>
          <section aria-label={copy.detailsTitle} className="space-y-5 py-16 text-center sm:py-20">
            {copy.invitation.map((paragraph, i) => (
              <p key={i} className="text-base text-cream/90 sm:text-lg">
                {paragraph}
              </p>
            ))}
          </section>
        </Reveal>

        {/* Event details -------------------------------------------------- */}
        <Reveal>
          <EventCard
            venue={data.venue}
            dateLabel={data.dateLabel}
            timeLabel={data.timeLabel}
            mapUrl={data.mapUrl}
          />
        </Reveal>

        {/* Countdown ------------------------------------------------------ */}
        <Reveal delay={80}>
          <div className="py-16 sm:py-20">
            <Countdown startUtcIso={data.startUtcIso} />
          </div>
        </Reveal>

        {/* Add to calendar ------------------------------------------------ */}
        <Reveal>
          <AddToCalendar icsContent={data.icsContent} googleCalendarUrl={data.googleCalendarUrl} />
        </Reveal>

        {/* Gallery -------------------------------------------------------- */}
        <Reveal>
          <div className="py-20 sm:py-24">
            <Gallery />
          </div>
        </Reveal>
      </main>

      <Footer couple={data.couple} />
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
