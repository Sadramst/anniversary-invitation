import invitesFile from "@/generated/invites.json";
import {
  buildGoogleCalendarUrl,
  buildIcs,
  buildMapUrl,
  formatEventDate,
  formatEventDateJalali,
  formatEventDateParts,
  formatEventTime,
  resolveEventInstants,
} from "./event";
import type { Invite, InvitePageData, InvitesFile } from "./types";

const file = invitesFile as unknown as InvitesFile;

export const { couple, venue, event, siteUrl, basePath } = file;

const bySlug = new Map<string, Invite>(file.invites.map((i) => [i.slug, i]));

export function allSlugs(): string[] {
  return file.invites.map((i) => i.slug);
}

export function findInvite(slug: string): Invite | undefined {
  return bySlug.get(slug);
}

/** Absolute URL for a guest's invitation, used for og:url and links-export.csv. */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Resolves everything a page needs at build time: formatted dates, the map deep
 * link, the Google Calendar URL and the .ics document. Doing it here means the
 * client never recomputes anything and the pages stay fully static.
 */
export function getInvitePageData(slug: string): InvitePageData | null {
  const invite = findInvite(slug);
  if (!invite) return null;

  const { start, end } = resolveEventInstants(event);
  const mapUrl = buildMapUrl(venue);

  const title = `${couple.english_names} — 10th Anniversary Celebration`;
  const location = venue.address.full_address_en;
  const details = `${couple.tagline.en}\n${venue.name.en}\n${location}\n${mapUrl}`;

  return {
    invite,
    couple,
    venue,
    event,
    dateLabel: formatEventDate(event),
    dateParts: formatEventDateParts(event),
    jalali: formatEventDateJalali(event),
    timeLabel: formatEventTime(event),
    startUtcIso: start.toISOString(),
    endUtcIso: end.toISOString(),
    mapUrl,
    googleCalendarUrl: buildGoogleCalendarUrl({ title, details, location, start, end }),
    icsContent: buildIcs({
      uid: "anniversary-2026@appilico.com.au",
      title,
      description: details,
      location,
      start,
      end,
      stamp: start,
    }),
  };
}
