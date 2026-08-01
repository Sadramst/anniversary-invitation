import { describe, expect, it } from "vitest";

import {
  buildGoogleCalendarUrl,
  buildIcs,
  buildMapUrl,
  formatEventDate,
  formatEventDateJalali,
  formatEventTime,
  resolveEventInstants,
  toCalendarStamp,
  toFaDigits,
  zonedToUtc,
} from "@/lib/event";
import type { EventInfo, Venue } from "@/lib/types";

const EVENT: EventInfo = {
  date_iso: "2026-09-12",
  start_time: "17:00",
  end_time: "00:00",
  timezone: "Australia/Perth",
};

const VENUE: Venue = {
  name: { en: "Sorrento Community Hall", fa: "سالن اجتماعات سورنتو" },
  address: {
    street: "22 Padbury Circle",
    suburb: "Sorrento",
    state: "WA",
    postcode: "6020",
    country: "Australia",
    full_address_en: "22 Padbury Circle, Sorrento WA 6020, Australia",
    full_address_fa: "استرالیا، استرالیای غربی، سورنتو، خیابان پدبری ۲۲، کد پستی ۶۰۲۰",
  },
};

describe("timezone handling", () => {
  it("converts Perth wall-clock time to the correct UTC instant (UTC+8)", () => {
    expect(zonedToUtc(2026, 9, 12, 17, 0, "Australia/Perth").toISOString()).toBe(
      "2026-09-12T09:00:00.000Z",
    );
  });

  it("resolves the event start correctly", () => {
    const { start } = resolveEventInstants(EVENT);
    expect(start.toISOString()).toBe("2026-09-12T09:00:00.000Z");
  });

  it("rolls a midnight end time over to the next day instead of going backwards", () => {
    const { start, end } = resolveEventInstants(EVENT);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
    expect(end.toISOString()).toBe("2026-09-12T16:00:00.000Z"); // 13 Sep 00:00 Perth
  });

  it("makes the party exactly 7 hours long", () => {
    const { start, end } = resolveEventInstants(EVENT);
    expect((end.getTime() - start.getTime()) / 3_600_000).toBe(7);
  });
});

describe("date and time formatting", () => {
  it("renders the English date exactly as specified in the brief", () => {
    expect(formatEventDate(EVENT).en).toBe("Saturday, 12 September 2026");
  });

  it("renders the Farsi date with Persian digits and weekday", () => {
    expect(formatEventDate(EVENT).fa).toBe("شنبه، ۱۲ سپتامبر ۲۰۲۶");
  });

  it("renders the English time range as 5:00pm – 12:00am", () => {
    expect(formatEventTime(EVENT).en).toBe("5:00pm – 12:00am");
  });

  it("renders the Farsi time range with Persian digits", () => {
    expect(formatEventTime(EVENT).fa).toBe("۱۷:۰۰ تا ۲۴:۰۰");
  });

  it("converts digits to Persian", () => {
    expect(toFaDigits("2026")).toBe("۲۰۲۶");
    expect(toFaDigits(5)).toBe("۵");
  });

  it("is deterministic, so server and client HTML always match", () => {
    expect(formatEventDate(EVENT)).toEqual(formatEventDate(EVENT));
    expect(formatEventTime(EVENT)).toEqual(formatEventTime(EVENT));
  });
});

describe("Jalali (Shamsi) calendar", () => {
  it("converts the real event date, 12 September 2026, to 21 Shahrivar 1405", () => {
    expect(formatEventDateJalali(EVENT).numeric).toEqual({ jy: 1405, jm: 6, jd: 21 });
  });

  it("renders the Jalali date in Persian digits with the Persian month name", () => {
    const jalali = formatEventDateJalali(EVENT);
    expect(jalali.day).toBe("۲۱");
    expect(jalali.month).toBe("شهریور");
    expect(jalali.year).toBe("۱۴۰۵");
    expect(jalali.monthYear).toBe("شهریور ۱۴۰۵");
  });

  it("names the same weekday as the Gregorian formatter", () => {
    // 12 Sep 2026 is a Saturday in both calendars - they only differ in the date.
    expect(formatEventDateJalali(EVENT).full).toBe("شنبه، ۲۱ شهریور ۱۴۰۵");
    expect(formatEventDate(EVENT).fa).toContain("شنبه");
  });

  it("handles a leap-year boundary, where naive arithmetic drifts", () => {
    // 1403 is a Jalali leap year, so it has a 30th of Esfand.
    const leap = { ...EVENT, date_iso: "2025-03-20" };
    expect(formatEventDateJalali(leap).numeric).toEqual({ jy: 1403, jm: 12, jd: 30 });
  });

  it("rolls over to Farvardin on Nowruz", () => {
    const nowruz = { ...EVENT, date_iso: "2026-03-21" };
    const jalali = formatEventDateJalali(nowruz);
    expect(jalali.numeric).toEqual({ jy: 1405, jm: 1, jd: 1 });
    expect(jalali.month).toBe("فروردین");
  });

  it("is deterministic, so server and client HTML always match", () => {
    expect(formatEventDateJalali(EVENT)).toEqual(formatEventDateJalali(EVENT));
  });
});

describe("map deep link", () => {
  const url = buildMapUrl(VENUE);

  it("uses the official Google Maps universal URL scheme", () => {
    expect(url.startsWith("https://www.google.com/maps/search/?api=1&query=")).toBe(true);
  });

  it("url-encodes the full address", () => {
    expect(url).toContain(encodeURIComponent("22 Padbury Circle, Sorrento WA 6020, Australia"));
    expect(url).not.toContain(" ");
  });

  it("is derived from the address fields, not hardcoded", () => {
    const moved = structuredClone(VENUE);
    moved.address.full_address_en = "1 Test Street, Perth WA 6000, Australia";
    expect(buildMapUrl(moved)).toContain(encodeURIComponent("1 Test Street"));
  });
});

describe("Google Calendar link", () => {
  const { start, end } = resolveEventInstants(EVENT);
  const url = buildGoogleCalendarUrl({
    title: "A & B — 10th Anniversary Celebration",
    details: "Celebrating 10 years",
    location: VENUE.address.full_address_en,
    start,
    end,
  });

  it("targets the Google Calendar template endpoint", () => {
    expect(url.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);
  });

  it("carries the correct UTC date range", () => {
    expect(decodeURIComponent(new URL(url).searchParams.get("dates")!)).toBe(
      "20260912T090000Z/20260912T160000Z",
    );
  });

  it("pre-fills title and address", () => {
    const params = new URL(url).searchParams;
    expect(params.get("action")).toBe("TEMPLATE");
    expect(params.get("text")).toContain("10th Anniversary");
    expect(params.get("location")).toBe(VENUE.address.full_address_en);
  });
});

describe("calendar stamps", () => {
  it("formats as a compact UTC stamp", () => {
    expect(toCalendarStamp(new Date("2026-09-12T09:00:00.000Z"))).toBe("20260912T090000Z");
  });
});

describe(".ics file", () => {
  const { start, end } = resolveEventInstants(EVENT);
  const ics = buildIcs({
    uid: "anniversary-2026@appilico.com.au",
    title: "A & B — 10th Anniversary Celebration",
    description: "Celebrating 10 years, together",
    location: VENUE.address.full_address_en,
    start,
    end,
    stamp: start,
  });

  it("is a well-formed VCALENDAR", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
  });

  it("uses CRLF line endings as RFC 5545 requires", () => {
    expect(ics.split("\r\n").length).toBeGreaterThan(10);
    expect(/[^\r]\n/.test(ics)).toBe(false);
  });

  it("carries the correct start and end instants", () => {
    expect(ics).toContain("DTSTART:20260912T090000Z");
    expect(ics).toContain("DTEND:20260912T160000Z");
  });

  it("escapes commas in the location, per spec", () => {
    expect(ics).toContain("LOCATION:22 Padbury Circle\\, Sorrento WA 6020\\, Australia");
  });

  it("includes a reminder the day before", () => {
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-P1D");
  });

  it("keeps every line within the 75-octet limit", () => {
    for (const line of ics.trimEnd().split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(76);
    }
  });

  it("is byte-identical across builds so caches stay valid", () => {
    const again = buildIcs({
      uid: "anniversary-2026@appilico.com.au",
      title: "A & B — 10th Anniversary Celebration",
      description: "Celebrating 10 years, together",
      location: VENUE.address.full_address_en,
      start,
      end,
      stamp: start,
    });
    expect(again).toBe(ics);
  });

  it("survives being embedded in a data: URI", () => {
    const href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
    expect(decodeURIComponent(href.split(",").slice(1).join(","))).toBe(ics);
  });
});
