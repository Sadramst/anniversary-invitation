import file from "../../src/generated/invites.json";

interface GeneratedInvite {
  slug: string;
  type: "party" | "individual";
  partyId: string;
  greeting: { en: string; fa: string };
  memberCount: number;
  needsName: boolean;
}

export const INVITES = file.invites as GeneratedInvite[];
export const COUPLE = file.couple;
export const VENUE = file.venue;

function must<T>(value: T | undefined, what: string): T {
  if (!value) throw new Error(`Fixture not found: ${what}`);
  return value;
}

/** A family link that greets four people. */
export const PARTY_INVITE = must(
  INVITES.find((i) => i.type === "party" && i.partyId === "armita-party"),
  "armita family link",
);

/** An individual link for one member of that same family. */
export const INDIVIDUAL_INVITE = must(
  INVITES.find((i) => i.type === "individual" && i.greeting.en === "Hesam"),
  "Hesam individual link",
);

/** A one-person party, to check singular phrasing. */
export const SOLO_INVITE = must(
  INVITES.find((i) => i.type === "individual" && i.greeting.en === "Hamid"),
  "Hamid individual link",
);

export const EXPECTED_ADDRESS = "22 Padbury Circle, Sorrento WA 6020, Australia";
export const EXPECTED_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  EXPECTED_ADDRESS,
)}`;
