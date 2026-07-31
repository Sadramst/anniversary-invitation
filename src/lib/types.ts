export type Lang = "fa" | "en";

export interface Greeting {
  en: string;
  fa: string;
}

export interface Invite {
  slug: string;
  type: "party" | "individual";
  partyId: string;
  greeting: Greeting;
  headEn: string | null;
  memberCount: number;
  needsName: boolean;
}

export interface Couple {
  english_names: string;
  farsi_names: string;
  initials: string;
  /** Persian initials, e.g. "ن ص". Falls back to `initials`. Currently unused by the UI. */
  initials_fa?: string;
  /**
   * The two names rendered separately either side of the ampersand in the hero.
   * Falls back to the joined `*_names` string when absent.
   */
  name_parts?: { en: string[]; fa: string[] };
  tagline: Greeting;
}

export interface Venue {
  name: { en: string; fa: string };
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
    full_address_en: string;
    full_address_fa: string;
  };
}

export interface EventInfo {
  date_iso: string;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface InvitesFile {
  generatedAt: string;
  siteUrl: string;
  basePath: string;
  couple: Couple;
  venue: Venue;
  event: EventInfo;
  invites: Invite[];
}

/** Everything a rendered invitation page needs, resolved at build time. */
export interface InvitePageData {
  invite: Invite;
  couple: Couple;
  venue: Venue;
  event: EventInfo;
  /** Pre-formatted on the server so the client never re-formats (no hydration drift). */
  dateLabel: Greeting;
  /** The same date split up, for the large day numeral in the hero. */
  dateParts: { weekday: Greeting; day: Greeting; monthYear: Greeting };
  timeLabel: Greeting;
  /** Event start/end as UTC ISO strings. */
  startUtcIso: string;
  endUtcIso: string;
  mapUrl: string;
  googleCalendarUrl: string;
  icsContent: string;
}
