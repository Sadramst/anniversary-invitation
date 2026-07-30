import type { EventInfo, Greeting, Venue } from "./types";

/* ------------------------------------------------------------- time zones */

function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(instant).map((p) => [p.type, p.value]),
  ) as Record<string, string>;

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (asUtc - instant.getTime()) / 60000;
}

/** Convert a wall-clock time in `timeZone` into the correct UTC instant. */
export function zonedToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  let ts = naive;
  // Two passes settle any DST boundary. Perth has no DST, but this stays correct if the venue moves.
  for (let i = 0; i < 2; i += 1) {
    ts = naive - zoneOffsetMinutes(new Date(ts), timeZone) * 60000;
  }
  return new Date(ts);
}

/** Resolve the event's start/end as absolute UTC instants. Wraps past midnight automatically. */
export function resolveEventInstants(event: EventInfo): { start: Date; end: Date } {
  const [y, m, d] = event.date_iso.split("-").map(Number);
  const [sh, sm] = event.start_time.split(":").map(Number);
  const [eh, em] = event.end_time.split(":").map(Number);

  const start = zonedToUtc(y, m, d, sh, sm, event.timezone);
  let end = zonedToUtc(y, m, d, eh, em, event.timezone);
  if (end.getTime() <= start.getTime()) {
    // End time is on the following day (e.g. 17:00 -> 00:00).
    end = zonedToUtc(y, m, d + 1, eh, em, event.timezone);
  }
  return { start, end };
}

/* ------------------------------------------------------------- formatting */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** 2026 -> ۲۰۲۶ */
export function toFaDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

const FA_WEEKDAYS: Record<number, string> = {
  0: "یکشنبه",
  1: "دوشنبه",
  2: "سه‌شنبه",
  3: "چهارشنبه",
  4: "پنجشنبه",
  5: "جمعه",
  6: "شنبه",
};

const FA_MONTHS = [
  "ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن",
  "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر",
];

const EN_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Format the event date in both languages.
 * Hand-rolled rather than Intl so server and client always agree byte-for-byte
 * (Intl locale data differs between Node and browsers, which breaks hydration).
 */
export function formatEventDate(event: EventInfo): Greeting {
  const [y, m, d] = event.date_iso.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  return {
    en: `${EN_WEEKDAYS[weekday]}, ${d} ${EN_MONTHS[m - 1]} ${y}`,
    fa: `${FA_WEEKDAYS[weekday]}، ${toFaDigits(d)} ${FA_MONTHS[m - 1]} ${toFaDigits(y)}`,
  };
}

/**
 * The same Gregorian date, split so the hero can set the day numeral much
 * larger than the rest - the three-column date strip in the design.
 * Farsi keeps Gregorian ("miladi") months, only the digits are Persian.
 */
export function formatEventDateParts(event: EventInfo): {
  weekday: Greeting;
  day: Greeting;
  monthYear: Greeting;
} {
  const [y, m, d] = event.date_iso.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  return {
    weekday: { en: EN_WEEKDAYS[weekday], fa: FA_WEEKDAYS[weekday] },
    day: { en: String(d), fa: toFaDigits(d) },
    monthYear: {
      en: `${EN_MONTHS[m - 1]} ${y}`,
      fa: `${FA_MONTHS[m - 1]} ${toFaDigits(y)}`,
    },
  };
}

function to12Hour(time: string): { hour: number; minute: number; meridiem: "am" | "pm" } {
  const [h, m] = time.split(":").map(Number);
  const meridiem = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return { hour, minute: m, meridiem };
}

/** "5:00pm – 12:00am" / "۱۷:۰۰ تا ۲۴:۰۰" */
export function formatEventTime(event: EventInfo): Greeting {
  const s = to12Hour(event.start_time);
  const e = to12Hour(event.end_time);
  const pad = (n: number) => String(n).padStart(2, "0");

  const en = `${s.hour}:${pad(s.minute)}${s.meridiem} – ${e.hour}:${pad(e.minute)}${e.meridiem}`;

  const [sh, sm] = event.start_time.split(":").map(Number);
  const [eh, em] = event.end_time.split(":").map(Number);
  const faEnd = eh === 0 ? 24 : eh;
  const fa = `${toFaDigits(pad(sh))}:${toFaDigits(pad(sm))} تا ${toFaDigits(pad(faEnd))}:${toFaDigits(pad(em))}`;

  return { en, fa };
}

/* ------------------------------------------------------------------- links */

/**
 * Built from the address fields at render time, never stored - so it stays
 * correct automatically if the venue address is edited.
 */
export function buildMapUrl(venue: Venue): string {
  const query = encodeURIComponent(venue.address.full_address_en);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** Compact UTC stamp used by both .ics and Google Calendar: 20260905T090000Z */
export function toCalendarStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildGoogleCalendarUrl(opts: {
  title: string;
  details: string;
  location: string;
  start: Date;
  end: Date;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${toCalendarStamp(opts.start)}/${toCalendarStamp(opts.end)}`,
    details: opts.details,
    location: opts.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* --------------------------------------------------------------------- ics */

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** RFC 5545 requires lines <= 75 octets, continued with a leading space. */
function foldIcsLine(line: string): string {
  const bytes = Array.from(new TextEncoder().encode(line));
  if (bytes.length <= 75) return line;

  const chunks: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Never split a multi-byte UTF-8 character.
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end -= 1;
    chunks.push(new TextDecoder().decode(new Uint8Array(bytes.slice(start, end))));
    start = end;
    limit = 74;
  }
  return chunks.join("\r\n ");
}

export function buildIcs(opts: {
  uid: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  /** Fixed stamp keeps the generated file byte-identical across builds. */
  stamp?: Date;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Appilico//Anniversary Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${toCalendarStamp(opts.stamp ?? opts.start)}`,
    `DTSTART:${toCalendarStamp(opts.start)}`,
    `DTEND:${toCalendarStamp(opts.end)}`,
    `SUMMARY:${escapeIcsText(opts.title)}`,
    `DESCRIPTION:${escapeIcsText(opts.description)}`,
    `LOCATION:${escapeIcsText(opts.location)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}
