/**
 * Reads data/guests.data.json and produces:
 *   1. src/generated/invites.json  -> consumed by generateStaticParams (one page per slug)
 *   2. links-export.csv            -> the file the couple copies links out of
 *
 * Runs automatically on `npm run build` (via prebuild) and `npm run dev`.
 * Run manually with: npm run generate-invites
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_SALT, individualSlug, partySlug } from "./lib/slugs.mjs";
import { individualGreeting, partyGreeting, faName } from "./lib/greetings.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SALT = process.env.INVITE_SLUG_SALT || DEFAULT_SALT;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.appilico.com.au").replace(/\/+$/, "");
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/inviteaniversery";

/* ------------------------------------------------------------------ validate */

export function validate(data) {
  const errors = [];
  if (!Array.isArray(data.parties) || data.parties.length === 0) {
    errors.push("`parties` must be a non-empty array.");
    return errors;
  }

  const seenPartyIds = new Set();
  for (const party of data.parties) {
    const id = party.party_id;
    if (!id) {
      errors.push("A party is missing `party_id`.");
      continue;
    }
    if (seenPartyIds.has(id)) errors.push(`Duplicate party_id: "${id}".`);
    seenPartyIds.add(id);

    if (!Array.isArray(party.members) || party.members.length === 0) {
      errors.push(`Party "${id}" has no members.`);
      continue;
    }
    const heads = party.members.filter((m) => m.is_head === true);
    if (heads.length !== 1) {
      errors.push(`Party "${id}" must have exactly one member with "is_head": true (found ${heads.length}).`);
    }
  }
  return errors;
}

/* ------------------------------------------------------------------- build */

export function buildInvites(data, salt = SALT) {
  const invites = [];
  const seenSlugs = new Map();

  const claim = (slug, label) => {
    if (seenSlugs.has(slug)) {
      throw new Error(`Slug collision "${slug}" between ${seenSlugs.get(slug)} and ${label}.`);
    }
    seenSlugs.set(slug, label);
  };

  for (const party of data.parties) {
    const { party_id: partyId, members } = party;
    const head = members.find((m) => m.is_head) ?? members[0];

    /* ---- one link for the whole family ---- */
    const pSlug = partySlug(partyId, salt);
    claim(pSlug, `party ${partyId}`);
    const pGreet = partyGreeting(members);

    invites.push({
      slug: pSlug,
      type: "party",
      partyId,
      greeting: pGreet,
      headEn: head.english_name ?? null,
      memberCount: members.length,
      needsName: members.some((m) => !m.english_name),
    });

    /* ---- one link per person ---- */
    const nameCounts = new Map();
    members.forEach((member, index) => {
      const key = member.english_name ?? `__unnamed_${index}`;
      const occurrence = nameCounts.get(key) ?? 0;
      nameCounts.set(key, occurrence + 1);

      const iSlug = individualSlug(partyId, member.english_name, index, occurrence, salt);
      claim(iSlug, `person ${member.english_name ?? `#${index + 1}`} in ${partyId}`);

      invites.push({
        slug: iSlug,
        type: "individual",
        partyId,
        greeting: individualGreeting(member),
        headEn: head.english_name ?? null,
        memberCount: 1,
        needsName: !member.english_name,
      });
    });
  }

  return invites;
}

export function inviteUrl(slug, siteUrl = SITE_URL, basePath = BASE_PATH) {
  return `${siteUrl}${basePath}/${slug}`;
}

/* --------------------------------------------------------------------- csv */

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(invites, siteUrl = SITE_URL, basePath = BASE_PATH) {
  const header = ["Name (EN)", "Name (FA)", "Party", "Link type", "People", "Status", "URL"];
  const rows = invites.map((i) => [
    i.greeting.en,
    i.greeting.fa,
    i.partyId,
    i.type === "party" ? "Family link" : "Individual link",
    i.memberCount,
    i.needsName ? "NEEDS-NAME" : "ready",
    inviteUrl(i.slug, siteUrl, basePath),
  ]);
  // BOM so Excel opens the Farsi column correctly.
  return "\uFEFF" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

/* --------------------------------------------------------------------- run */

function main() {
  const raw = readFileSync(join(ROOT, "data", "guests.data.json"), "utf8");
  const data = JSON.parse(raw);

  const errors = validate(data);
  if (errors.length) {
    console.error("\n  guests.data.json is invalid:\n");
    errors.forEach((e) => console.error(`   - ${e}`));
    console.error("");
    process.exit(1);
  }

  const invites = buildInvites(data, SALT);

  const payload = {
    generatedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    basePath: BASE_PATH,
    couple: data.couple,
    venue: data.venue,
    event: data.event,
    invites,
  };

  mkdirSync(join(ROOT, "src", "generated"), { recursive: true });
  writeFileSync(join(ROOT, "src", "generated", "invites.json"), JSON.stringify(payload, null, 2) + "\n", "utf8");
  writeFileSync(join(ROOT, "links-export.csv"), toCsv(invites, SITE_URL, BASE_PATH), "utf8");

  const parties = invites.filter((i) => i.type === "party").length;
  const people = invites.filter((i) => i.type === "individual").length;
  const missing = invites.filter((i) => i.type === "individual" && i.needsName).length;

  console.log(`\n  Invitations generated`);
  console.log(`   ${parties} family links + ${people} individual links = ${invites.length} pages`);
  if (missing) console.log(`   ${missing} individual link(s) flagged NEEDS-NAME in links-export.csv`);
  console.log(`   -> src/generated/invites.json`);
  console.log(`   -> links-export.csv`);
  console.log(`   base URL: ${inviteUrl("<slug>")}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
