import { describe, expect, it } from "vitest";

import {
  faName,
  individualGreeting,
  joinEn,
  joinFa,
  partyGreeting,
} from "../../scripts/lib/greetings.mjs";

describe("joinEn", () => {
  it("handles every list length naturally", () => {
    expect(joinEn([])).toBe("");
    expect(joinEn(["Armita"])).toBe("Armita");
    expect(joinEn(["Armita", "Hesam"])).toBe("Armita & Hesam");
    expect(joinEn(["Armita", "Hesam", "Negar", "Samyar"])).toBe("Armita, Hesam, Negar & Samyar");
  });
});

describe("joinFa", () => {
  it("uses Persian separators", () => {
    expect(joinFa(["آرمیتا"])).toBe("آرمیتا");
    expect(joinFa(["آرمیتا", "حسام"])).toBe("آرمیتا و حسام");
    expect(joinFa(["آرمیتا", "حسام", "نگار"])).toBe("آرمیتا، حسام و نگار");
  });
});

describe("faName fallback", () => {
  it("prefers the Farsi spelling", () => {
    expect(faName({ english_name: "Armita", farsi_name: "آرمیتا" })).toBe("آرمیتا");
  });

  it("falls back to English rather than blocking the build", () => {
    expect(faName({ english_name: "Meysam", farsi_name: null })).toBe("Meysam");
  });

  it("returns null when nothing is known", () => {
    expect(faName({ english_name: null, farsi_name: null })).toBeNull();
  });
});

describe("partyGreeting", () => {
  const armita = [
    { english_name: "Armita", farsi_name: "آرمیتا", is_head: true },
    { english_name: "Hesam", farsi_name: "حسام" },
    { english_name: "Negar", farsi_name: "نگار" },
    { english_name: "Samyar", farsi_name: "سامیار" },
  ];

  it("greets the whole family in both languages", () => {
    const g = partyGreeting(armita);
    expect(g.en).toBe("Armita, Hesam, Negar & Samyar");
    expect(g.fa).toBe("آرمیتا، حسام، نگار و سامیار");
  });

  it("acknowledges unknown members without inventing names", () => {
    const g = partyGreeting([
      { english_name: "Khosravi", farsi_name: "خسروی", is_head: true },
      { english_name: null, farsi_name: null },
      { english_name: null, farsi_name: null },
    ]);
    expect(g.en).toBe("Khosravi & family");
    expect(g.fa).toBe("خسروی و خانواده");
    expect(g.en).not.toMatch(/NAME MISSING|null|undefined/);
  });

  it("never leaks placeholder text", () => {
    const g = partyGreeting([{ english_name: null, farsi_name: null, is_head: true }]);
    expect(g.en).toBe("Friends");
    expect(g.fa).toBe("دوستان عزیز");
  });
});

describe("individualGreeting", () => {
  it("greets one person only", () => {
    const g = individualGreeting({ english_name: "Hesam", farsi_name: "حسام" });
    expect(g.en).toBe("Hesam");
    expect(g.fa).toBe("حسام");
  });

  it("degrades politely when the name is unknown", () => {
    const g = individualGreeting({ english_name: null, farsi_name: null });
    expect(g.en).toBe("Friend");
    expect(g.fa).toBe("مهمان عزیز");
  });
});
