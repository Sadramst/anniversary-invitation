"use client";

import type { Venue } from "@/lib/types";
import type { Greeting } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";

interface EventCardProps {
  venue: Venue;
  dateLabel: Greeting;
  timeLabel: Greeting;
  mapUrl: string;
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function EventCard({ venue, dateLabel, timeLabel, mapUrl }: EventCardProps) {
  const { lang, copy } = useLanguage();
  const fa = lang === "fa";

  const venueName = fa ? venue.name.fa : venue.name.en;
  const address = fa ? venue.address.full_address_fa : venue.address.full_address_en;

  return (
    <section aria-labelledby="details-title" className="glass-card rounded-3xl p-6 sm:p-9">
      <h2 id="details-title" className="heading gold-text text-center text-2xl sm:text-3xl">
        {copy.detailsTitle}
      </h2>
      <div className="gold-rule mx-auto mt-4 h-px w-24 opacity-70" aria-hidden="true" />

      <dl className="mt-8 space-y-7">
        {/* When ------------------------------------------------------- */}
        <div className="flex items-start gap-4">
          <span className="mt-0.5 shrink-0" data-testid="detail-icon">
            <CalendarIcon />
          </span>
          <div className="min-w-0 flex-1 text-start" data-testid="detail-body">
            <dt className="text-[0.68rem] uppercase tracking-[0.24em] text-gold-soft/80">{copy.whenLabel}</dt>
            <dd className="mt-1.5">
              <p className="heading text-lg text-cream sm:text-xl">{fa ? dateLabel.fa : dateLabel.en}</p>
              <p className="mt-1 text-sm text-cream-dim sm:text-base" dir={fa ? "rtl" : "ltr"}>
                {fa ? timeLabel.fa : timeLabel.en}
              </p>
            </dd>
          </div>
        </div>

        {/* Where ------------------------------------------------------ */}
        <div className="flex items-start gap-4">
          <span className="mt-0.5 shrink-0">
            <PinIcon />
          </span>
          <div className="min-w-0 flex-1 text-start">
            <dt className="text-[0.68rem] uppercase tracking-[0.24em] text-gold-soft/80">{copy.whereLabel}</dt>
            <dd className="mt-1.5">
              <p className="heading text-lg text-cream sm:text-xl">{venueName}</p>
              {/*
                Opens the native Maps app on mobile and Google Maps in the browser
                on desktop. The URL is built from the address fields at render time.
              */}
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="map-link"
                className="group mt-1.5 inline-flex items-start gap-1.5 text-sm text-rose-soft underline decoration-rose/50 underline-offset-4 transition hover:text-gold-soft hover:decoration-gold sm:text-base"
              >
                <span>{address}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="mirror-icon mt-1 h-3.5 w-3.5 shrink-0 transition group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
              <p className="mt-1.5 text-xs text-cream-dim/70">{copy.directionsHint}</p>
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}
