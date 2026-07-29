import { createHash } from "node:crypto";

/**
 * Slug alphabet: no 0/1/i/l/o so slugs are never misread when typed or read aloud.
 * 31 chars ^ 6 = ~887 million combinations -> links are not enumerable.
 */
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const SUFFIX_LENGTH = 6;

/**
 * Salt for slug derivation. Keep the repo private and this value secret:
 * anyone with the salt + guest list can recompute every link.
 * Override with the INVITE_SLUG_SALT env var (set it once in Vercel and never change it).
 */
export const DEFAULT_SALT = "appilico-anniversary-2026-v1";

/** URL-safe base for a slug: "Ali Reza" -> "ali-reza" */
export function slugifyBase(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

/**
 * Deterministic, non-guessable suffix.
 * Same inputs always produce the same suffix, so a link that has already been
 * sent on WhatsApp keeps working forever across rebuilds.
 */
export function deriveSuffix(salt, ...parts) {
  const digest = createHash("sha256").update([salt, ...parts].join("\u0000"), "utf8").digest();
  let out = "";
  for (let i = 0; i < SUFFIX_LENGTH; i += 1) {
    out += ALPHABET[digest[i] % ALPHABET.length];
  }
  return out;
}

/** Slug for a whole family/party link (greets everyone). */
export function partySlug(partyId, salt = DEFAULT_SALT) {
  const base = slugifyBase(partyId) || "party";
  return `${base}-${deriveSuffix(salt, "party", partyId)}`;
}

/**
 * Slug for one person's link (greets only them).
 *
 * The hash is keyed on the person's NAME, not their array position, so
 * adding or removing other members of the same party never changes this link.
 * People with no name yet fall back to their index - they have no link to break.
 */
export function individualSlug(partyId, englishName, index, occurrence = 0, salt = DEFAULT_SALT) {
  const identity = englishName ? `name:${englishName}` : `unnamed:${index}`;
  const key = occurrence > 0 ? `${identity}#${occurrence}` : identity;
  const base = slugifyBase(englishName) || `guest-${index + 1}`;
  return `${base}-${deriveSuffix(salt, "person", partyId, key)}`;
}
