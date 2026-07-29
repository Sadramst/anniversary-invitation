import { describe, expect, it } from "vitest";

import {
  DEFAULT_SALT,
  deriveSuffix,
  individualSlug,
  partySlug,
  slugifyBase,
} from "../../scripts/lib/slugs.mjs";

describe("slugifyBase", () => {
  it("lowercases and hyphenates", () => {
    expect(slugifyBase("Ali Reza")).toBe("ali-reza");
    expect(slugifyBase("armita-party")).toBe("armita-party");
  });

  it("strips accents and punctuation", () => {
    expect(slugifyBase("Zöhrè!")).toBe("zohre");
  });

  it("returns an empty string for unusable input", () => {
    expect(slugifyBase(null)).toBe("");
    expect(slugifyBase("آرمیتا")).toBe("");
  });
});

describe("deriveSuffix", () => {
  it("is deterministic", () => {
    expect(deriveSuffix("salt", "a", "b")).toBe(deriveSuffix("salt", "a", "b"));
  });

  it("changes when any input changes", () => {
    expect(deriveSuffix("salt", "a")).not.toBe(deriveSuffix("salt", "b"));
    expect(deriveSuffix("salt1", "a")).not.toBe(deriveSuffix("salt2", "a"));
  });

  it("uses a 6-character unambiguous alphabet (no 0/1/i/l/o)", () => {
    for (let i = 0; i < 400; i += 1) {
      expect(deriveSuffix(DEFAULT_SALT, `person-${i}`)).toMatch(/^[2-9a-hjkmnp-z]{6}$/);
    }
  });
});

describe("slug stability — the property that guest links depend on", () => {
  it("gives the same party its same link on every build", () => {
    expect(partySlug("armita-party")).toBe(partySlug("armita-party"));
  });

  it("gives the same person their same link on every build", () => {
    expect(individualSlug("armita-party", "Hesam", 1)).toBe(
      individualSlug("armita-party", "Hesam", 1),
    );
  });

  it("does NOT change a person's link when other members are added or removed", () => {
    // "Hesam" was at index 1; after a member above them is deleted they are at index 0.
    const before = individualSlug("armita-party", "Hesam", 1);
    const after = individualSlug("armita-party", "Hesam", 0);
    expect(after).toBe(before);
  });

  it("gives the same name in different families different links", () => {
    // "Vahid" appears in both vahid-party and malihe-party.
    expect(individualSlug("vahid-party", "Vahid", 0)).not.toBe(
      individualSlug("malihe-party", "Vahid", 1),
    );
  });

  it("separates two identical names inside one family via the occurrence counter", () => {
    expect(individualSlug("x-party", "Ali", 0, 0)).not.toBe(individualSlug("x-party", "Ali", 1, 1));
  });
});

describe("slug shape", () => {
  it("prefixes the party slug with the party id", () => {
    expect(partySlug("armita-party")).toMatch(/^armita-party-[2-9a-hjkmnp-z]{6}$/);
  });

  it("prefixes an individual slug with their name", () => {
    expect(individualSlug("armita-party", "Negar", 2)).toMatch(/^negar-[2-9a-hjkmnp-z]{6}$/);
  });

  it("is not guessable from the name alone", () => {
    expect(partySlug("armita-party")).not.toBe("armita-party");
    expect(individualSlug("armita-party", "Negar", 2)).not.toBe("negar");
  });

  it("still produces a usable slug for a guest whose name is unknown", () => {
    expect(individualSlug("amir-party", null, 1)).toMatch(/^guest-2-[2-9a-hjkmnp-z]{6}$/);
  });
});
