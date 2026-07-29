import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildInvites, inviteUrl, toCsv, validate } from "../../scripts/generate-invites.mjs";

const ROOT = join(process.cwd());
const guests = JSON.parse(readFileSync(join(ROOT, "data", "guests.data.json"), "utf8"));

describe("guests.data.json integrity", () => {
  it("passes validation", () => {
    expect(validate(guests)).toEqual([]);
  });

  it("contains the expected 22 parties and 54 people", () => {
    expect(guests.parties).toHaveLength(22);
    const people = guests.parties.reduce((sum, p) => sum + p.members.length, 0);
    expect(people).toBe(54);
  });

  it("gives every party a unique id", () => {
    const ids = guests.parties.map((p) => p.party_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every party exactly one head", () => {
    for (const party of guests.parties) {
      const heads = party.members.filter((m) => m.is_head === true);
      expect(heads, `party ${party.party_id}`).toHaveLength(1);
    }
  });

  it("has no leftover template placeholders in guest names", () => {
    for (const party of guests.parties) {
      for (const member of party.members) {
        expect(member.english_name ?? "").not.toMatch(/NAME MISSING|\[|\]/);
      }
    }
  });
});

describe("validate", () => {
  it("rejects a duplicate party_id", () => {
    const bad = { parties: [{ party_id: "a", members: [{ english_name: "A", is_head: true }] }, { party_id: "a", members: [{ english_name: "B", is_head: true }] }] };
    expect(validate(bad).join(" ")).toMatch(/Duplicate party_id/);
  });

  it("rejects a party with no head", () => {
    const bad = { parties: [{ party_id: "a", members: [{ english_name: "A" }] }] };
    expect(validate(bad).join(" ")).toMatch(/exactly one member/);
  });

  it("rejects a party with two heads", () => {
    const bad = { parties: [{ party_id: "a", members: [{ english_name: "A", is_head: true }, { english_name: "B", is_head: true }] }] };
    expect(validate(bad).join(" ")).toMatch(/exactly one member/);
  });

  it("rejects an empty party", () => {
    expect(validate({ parties: [{ party_id: "a", members: [] }] }).join(" ")).toMatch(/no members/);
  });
});

describe("buildInvites", () => {
  const invites = buildInvites(guests);

  it("creates one family link per party AND one link per person", () => {
    expect(invites.filter((i) => i.type === "party")).toHaveLength(22);
    expect(invites.filter((i) => i.type === "individual")).toHaveLength(54);
    expect(invites).toHaveLength(76);
  });

  it("produces globally unique slugs", () => {
    const slugs = invites.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("greets the whole family on a party link and one person on an individual link", () => {
    const party = invites.find((i) => i.type === "party" && i.partyId === "armita-party");
    expect(party.greeting.en).toBe("Armita, Hesam, Negar & Samyar");

    const person = invites.find((i) => i.type === "individual" && i.greeting.en === "Hesam");
    expect(person.greeting.fa).toBe("حسام");
    expect(person.memberCount).toBe(1);
  });

  it("flags the guests whose names are still unknown", () => {
    const flagged = invites.filter((i) => i.type === "individual" && i.needsName);
    expect(flagged.length).toBe(5);
  });

  it("is byte-for-byte reproducible across runs", () => {
    expect(buildInvites(guests)).toEqual(invites);
  });

  it("keeps every other link identical when a guest is removed", () => {
    const trimmed = structuredClone(guests);
    const target = trimmed.parties.find((p) => p.party_id === "armita-party");
    target.members = target.members.filter((m) => m.english_name !== "Negar");

    const after = buildInvites(trimmed);
    const survivors = new Set(after.map((i) => i.slug));

    for (const invite of invites) {
      const isRemovedPerson = invite.type === "individual" && invite.greeting.en === "Negar" && invite.partyId === "armita-party";
      if (isRemovedPerson) continue;
      // The family link's greeting text changes, but every URL stays valid.
      expect(survivors.has(invite.slug), `${invite.slug} disappeared`).toBe(true);
    }
  });

  it("keeps every existing link identical when a guest is added", () => {
    const grown = structuredClone(guests);
    grown.parties.push({
      party_id: "brand-new-party",
      members: [{ english_name: "Newcomer", farsi_name: null, is_head: true }],
    });

    const after = new Set(buildInvites(grown).map((i) => i.slug));
    for (const invite of invites) {
      expect(after.has(invite.slug), `${invite.slug} changed`).toBe(true);
    }
  });

  it("throws rather than silently shipping a colliding slug", () => {
    const collide = {
      parties: [
        { party_id: "dup", members: [{ english_name: "A", is_head: true }] },
        { party_id: "dup", members: [{ english_name: "A", is_head: true }] },
      ],
    };
    expect(() => buildInvites(collide)).toThrow(/collision/i);
  });
});

describe("inviteUrl", () => {
  it("builds the public URL under the configured base path", () => {
    expect(inviteUrl("armita-party-abc123", "https://www.appilico.com.au", "/inviteaniversery")).toBe(
      "https://www.appilico.com.au/inviteaniversery/armita-party-abc123",
    );
  });
});

describe("links-export.csv", () => {
  const csv = toCsv(buildInvites(guests), "https://www.appilico.com.au", "/inviteaniversery");

  it("starts with a BOM so Excel renders the Farsi column", () => {
    expect(csv.startsWith("\uFEFF")).toBe(true);
  });

  it("has a header plus one row per link", () => {
    const rows = csv.trim().split("\r\n");
    expect(rows).toHaveLength(77); // 1 header + 76 links
    expect(rows[0]).toContain("Link type");
    expect(rows[0]).toContain("URL");
  });

  it("labels both link types", () => {
    expect(csv).toContain("Family link");
    expect(csv).toContain("Individual link");
  });

  it("marks guests still missing a name", () => {
    expect(csv).toContain("NEEDS-NAME");
  });

  it("quotes cells that contain commas", () => {
    expect(csv).toContain('"Armita, Hesam, Negar & Samyar"');
  });

  it("emits absolute https URLs for every row", () => {
    const urls = csv.trim().split("\r\n").slice(1).map((r) => r.split(",").pop());
    expect(urls).toHaveLength(76);
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\/www\.appilico\.com\.au\/inviteaniversery\/[a-z0-9-]+$/);
    }
  });
});

describe("committed src/generated/invites.json", () => {
  const generated = JSON.parse(readFileSync(join(ROOT, "src", "generated", "invites.json"), "utf8"));

  it("is in sync with guests.data.json", () => {
    expect(generated.invites.map((i) => i.slug).sort()).toEqual(
      buildInvites(guests).map((i) => i.slug).sort(),
    );
  });
});
