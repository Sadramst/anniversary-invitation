"use client";

import type { Greeting, Venue } from "@/lib/types";
import { Ornament } from "./Florals";
import { useLanguage } from "./LanguageProvider";

interface EventCardProps {
  venue: Venue;
  dateLabel: Greeting;
  timeLabel: Greeting;
  mapUrl: string;
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </svg>
  );
}

function VenueIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-1.6 1.6-2 3.4-2 5.5 0 1.4.7 2.5 2 2.5s2-1.1 2-2.5C19 6.4 18.6 4.6 17 3ZM17 11v10" />
    </svg>
  );
}

function DressIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 3h6l-1.2 3.2a3 3 0 0 0 .5 3L19 16a3 3 0 0 1-2.6 4.5H7.6A3 3 0 0 1 5 16l4.7-6.8a3 3 0 0 0 .5-3Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
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

  const rows = [
    { icon: <CalendarIcon />, value: fa ? dateLabel.fa : dateLabel.en, testId: "detail-body" },
    { icon: <ClockIcon />, value: fa ? timeLabel.fa : timeLabel.en },
    { icon: <VenueIcon />, value: venueName, sub: address },
    { icon: <DressIcon />, value: `${copy.dressLabel}: ${copy.dressValue}` },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Details, on the filled burgundy panel ------------------------- */}
      <section aria-labelledby="details-title" className="wine-card rounded-2xl p-7 sm:p-8">
        <h2 id="details-title" className="display text-center text-2xl text-paper sm:text-3xl">
          {copy.detailsTitle}
        </h2>
        <Ornament className="mx-auto mt-3 h-4 w-40 opacity-80" />

        <dl className="mt-7 space-y-5">
          {rows.map((row, i) => (
            <div key={i} className="flex items-start gap-3.5">
              <span className="mt-0.5 shrink-0 text-gold-soft" data-testid={i === 0 ? "detail-icon" : undefined}>
                {row.icon}
              </span>
              <div className="min-w-0 flex-1 text-start" data-testid={row.testId}>
                <dd className="text-sm text-paper sm:text-base">{row.value}</dd>
                {row.sub ? <dd className="mt-1 text-xs text-paper/70 sm:text-sm">{row.sub}</dd> : null}
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* Location ------------------------------------------------------ */}
      <section aria-labelledby="venue-title" className="paper-card rounded-2xl p-7 text-center sm:p-8">
        <h2 id="venue-title" className="display text-2xl text-wine sm:text-3xl">
          {copy.whereLabel}
        </h2>
        <Ornament className="mx-auto mt-3 h-4 w-40 opacity-90" />

        <p className="heading mt-6 text-lg text-wine sm:text-xl">{venueName}</p>
        <p className="mt-2 text-sm text-ink-soft">{address}</p>

        {/*
          Opens the native Maps app on mobile and Google Maps in the browser on
          desktop. The URL is built from the address fields at render time.
        */}
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="map-link"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-paper px-5 py-2.5 text-sm text-wine transition hover:border-gold hover:bg-paper-deep active:scale-[0.98]"
        >
          <PinIcon />
          <span>{copy.directionsHint}</span>
        </a>
      </section>
    </div>
  );
}
