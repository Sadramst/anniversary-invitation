"use client";

import { useLanguage } from "./LanguageProvider";

interface AddToCalendarProps {
  /** Full .ics document, generated at build time. */
  icsContent: string;
  googleCalendarUrl: string;
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5 12 13l2.5 2.5" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M12 13.5v4M10 15.5h4" />
    </svg>
  );
}

export function AddToCalendar({ icsContent, googleCalendarUrl }: AddToCalendarProps) {
  const { copy } = useLanguage();

  /*
   * A data: URI rather than a Blob URL on purpose - Blob URLs are unreliable
   * inside the WhatsApp / Instagram in-app browsers, and this href works even
   * with JavaScript disabled because it is present in the server-rendered HTML.
   */
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  const buttonClass =
    "glass-card flex flex-1 items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-sm text-cream transition hover:border-gold/60 hover:text-gold-soft active:scale-[0.98] sm:text-base";

  return (
    <section aria-labelledby="calendar-title" className="text-center">
      <h3 id="calendar-title" className="text-xs uppercase tracking-[0.28em] text-gold-soft/85">
        {copy.calendarTitle}
      </h3>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href={icsHref}
          download="anniversary-invitation.ics"
          data-testid="ics-link"
          className={buttonClass}
        >
          <AppleIcon />
          <span>{copy.calendarApple}</span>
        </a>

        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="google-calendar-link"
          className={buttonClass}
        >
          <GoogleIcon />
          <span>{copy.calendarGoogle}</span>
        </a>
      </div>
    </section>
  );
}
