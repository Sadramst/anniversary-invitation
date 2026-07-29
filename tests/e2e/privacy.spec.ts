import { expect, test } from "@playwright/test";

import { INVITES, PARTY_INVITE } from "./fixtures";

test.describe("privacy", () => {
  test("the landing page lists no guest links", async ({ page }) => {
    await page.goto("./");

    await expect(page.getByRole("heading", { name: "دعوت‌نامه‌ی خصوصی" })).toBeVisible();

    const html = await page.content();
    for (const invite of INVITES) {
      expect(html, `leaked ${invite.slug}`).not.toContain(invite.slug);
    }
    // No navigation into invitations from anywhere public.
    await expect(page.locator("a[href*='-']")).toHaveCount(0);
  });

  test("an unknown slug 404s and reveals nothing", async ({ page }) => {
    const res = await page.goto("./armita-party");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "دعوت‌نامه‌ی خصوصی" })).toBeVisible();
  });

  test("guessing a name without the suffix does not work", async ({ request }) => {
    for (const guess of ["armita", "hesam", "armita-party", "negar", "hamid"]) {
      const res = await request.get(`./${guess}`);
      expect(res.status(), guess).toBe(404);
    }
  });

  test("slugs are long and random enough not to be enumerated", async () => {
    for (const invite of INVITES) {
      const suffix = invite.slug.split("-").pop()!;
      expect(suffix, invite.slug).toMatch(/^[2-9a-hjkmnp-z]{6}$/);
    }
    expect(new Set(INVITES.map((i) => i.slug)).size).toBe(INVITES.length);
  });

  test("pages are marked noindex for crawlers", async ({ request }) => {
    const res = await request.get(`./${PARTY_INVITE.slug}`);
    expect(res.headers()["x-robots-tag"]).toContain("noindex");

    const html = await res.text();
    expect(html).toMatch(/name="robots"[^>]*noindex/);
  });

  test("robots.txt disallows everything", async ({ request }) => {
    const res = await request.get("./robots.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Disallow: /");
  });

  test("there is no sitemap exposing the guest list", async ({ request }) => {
    const res = await request.get("./sitemap.xml");
    expect(res.status()).toBe(404);
  });

  test("security headers are set", async ({ request }) => {
    const headers = (await request.get(`./${PARTY_INVITE.slug}`)).headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  });
});

test.describe("share preview", () => {
  test("has an og:image so WhatsApp shows a thumbnail", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute("content", /^https:\/\/www\.appilico\.com\.au\//);
    await expect(ogImage).toHaveAttribute("content", /\/photos\/01\.jpg$/);
  });

  test("has a title and description for the share card", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);

    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /10th Anniversary/,
    );
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      "content",
      /Armita/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

  test("og:url points at the guest's own link", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `https://www.appilico.com.au/anniversary/${PARTY_INVITE.slug}`,
    );
  });

  test("the og:image file is actually served", async ({ request }) => {
    const res = await request.get("./photos/01.jpg");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image");
  });
});
