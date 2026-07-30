import { describe, expect, it } from "vitest";

import { COPY, DEFAULT_LANG, isLang, type Copy } from "@/lib/i18n";

const LANGS = ["fa", "en"] as const;

describe("language defaults", () => {
  it("defaults to Farsi", () => {
    expect(DEFAULT_LANG).toBe("fa");
  });

  it("puts Farsi in RTL and English in LTR", () => {
    expect(COPY.fa.dir).toBe("rtl");
    expect(COPY.en.dir).toBe("ltr");
  });

  it("validates language codes", () => {
    expect(isLang("fa")).toBe(true);
    expect(isLang("en")).toBe(true);
    expect(isLang("de")).toBe(false);
    expect(isLang(null)).toBe(false);
  });
});

describe("translation completeness", () => {
  it("defines exactly the same keys in both languages", () => {
    expect(Object.keys(COPY.fa).sort()).toEqual(Object.keys(COPY.en).sort());
  });

  it("leaves no string empty in either language", () => {
    for (const lang of LANGS) {
      for (const [key, value] of Object.entries(COPY[lang])) {
        if (typeof value === "string") {
          expect(value.trim(), `${lang}.${key}`).not.toBe("");
        }
      }
    }
  });

  it("translates the countdown units in both languages", () => {
    for (const lang of LANGS) {
      const units = COPY[lang].countdownUnits;
      expect(Object.keys(units).sort()).toEqual(["days", "hours", "minutes", "seconds"]);
      for (const value of Object.values(units)) expect(value.trim()).not.toBe("");
    }
  });

  it("translates the full invitation body, not just UI labels", () => {
    for (const lang of LANGS) {
      expect(COPY[lang].invitation.length).toBeGreaterThanOrEqual(3);
      for (const paragraph of COPY[lang].invitation) {
        expect(paragraph.length).toBeGreaterThan(40);
      }
    }
  });

  it("produces the same number of pillars in both languages, none blank", () => {
    expect(COPY.fa.pillars.length).toBe(COPY.en.pillars.length);
    expect(COPY.fa.pillars.length).toBeGreaterThanOrEqual(3);

    for (const lang of LANGS) {
      for (const pillar of COPY[lang].pillars) {
        expect(pillar.title.trim(), `${lang} pillar title`).not.toBe("");
        expect(pillar.body.trim(), `${lang} pillar body`).not.toBe("");
      }
    }
  });
});

describe("script correctness", () => {
  const PERSIAN = /[\u0600-\u06FF]/;
  const LATIN = /[A-Za-z]/;

  /** Keys whose value is intentionally in the *other* script (the toggle's own label). */
  const CROSS_SCRIPT: (keyof Copy)[] = ["switchTo", "htmlLang", "dir"];

  it("writes Farsi copy in Persian script", () => {
    for (const [key, value] of Object.entries(COPY.fa)) {
      if (typeof value !== "string" || CROSS_SCRIPT.includes(key as keyof Copy)) continue;
      expect(PERSIAN.test(value), `fa.${key} = "${value}"`).toBe(true);
    }
    for (const pillar of COPY.fa.pillars) {
      expect(PERSIAN.test(pillar.title), `fa pillar "${pillar.title}"`).toBe(true);
      expect(PERSIAN.test(pillar.body), `fa pillar "${pillar.body}"`).toBe(true);
    }
  });

  it("writes English copy in Latin script", () => {
    for (const [key, value] of Object.entries(COPY.en)) {
      if (typeof value !== "string" || CROSS_SCRIPT.includes(key as keyof Copy)) continue;
      expect(LATIN.test(value), `en.${key} = "${value}"`).toBe(true);
    }
    for (const pillar of COPY.en.pillars) {
      expect(LATIN.test(pillar.title), `en pillar "${pillar.title}"`).toBe(true);
      expect(LATIN.test(pillar.body), `en pillar "${pillar.body}"`).toBe(true);
    }
  });

  it("offers the other language on the toggle", () => {
    expect(COPY.fa.switchTo).toBe("English");
    expect(COPY.en.switchTo).toBe("فارسی");
  });

  it("never leaves untranslated English inside Farsi body copy", () => {
    for (const paragraph of COPY.fa.invitation) {
      expect(LATIN.test(paragraph)).toBe(false);
    }
  });
});
