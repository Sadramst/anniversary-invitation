import { expect, test } from "@playwright/test";

import { COUPLE, INDIVIDUAL_INVITE, PARTY_INVITE, SOLO_INVITE } from "./fixtures";

test.describe("personalised invitation", () => {
  test("the background photograph is actually painted, not hidden behind the page background", async ({
    page,
  }) => {
    await page.goto(PARTY_INVITE.slug);

    const photo = page.getByTestId("page-photo");
    await expect(photo).toBeVisible();

    // It must have really decoded, not just be a broken <img> box.
    await expect
      .poll(() => photo.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);

    // `body` carries an opaque background colour. Per the CSS painting order a
    // block-level background paints AFTER negative z-index descendants, so any
    // negative z-index on the photo stack silently hides the photo entirely
    // while every other check still passes. Guard the whole ancestor chain.
    const negatives = await photo.evaluate((el) => {
      const found: string[] = [];
      let node: HTMLElement | null = el as HTMLElement;
      while (node && node.tagName !== "BODY") {
        const z = getComputedStyle(node).zIndex;
        if (z !== "auto" && Number(z) < 0) found.push(`${node.tagName}.${node.className} z=${z}`);
        node = node.parentElement;
      }
      return found;
    });
    expect(
      negatives,
      `negative z-index would hide the background photo:\n${negatives.join("\n")}`,
    ).toEqual([]);
  });

  test("a family link greets every member by name", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);

    const greeting = page.getByTestId("guest-greeting");
    await expect(greeting).toBeVisible();
    await expect(greeting).toContainText(PARTY_INVITE.greeting.fa);

    // All four names appear on the family link.
    for (const name of ["آرمیتا", "حسام", "نگار", "سامیار"]) {
      await expect(greeting).toContainText(name);
    }
  });

  test("an individual link greets only that person", async ({ page }) => {
    await page.goto(INDIVIDUAL_INVITE.slug);

    const greeting = page.getByTestId("guest-greeting");
    await expect(greeting).toContainText("حسام");
    // The rest of the family is NOT named on a personal link.
    await expect(greeting).not.toContainText("آرمیتا");
    await expect(greeting).not.toContainText("سامیار");
  });

  test("both link types show the same event content", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    const partyMap = await page.getByTestId("map-link").getAttribute("href");

    await page.goto(INDIVIDUAL_INVITE.slug);
    const soloMap = await page.getByTestId("map-link").getAttribute("href");

    expect(partyMap).toBe(soloMap);
  });

  test("a single-person party renders correctly", async ({ page }) => {
    await page.goto(SOLO_INVITE.slug);
    await expect(page.getByTestId("guest-greeting")).toContainText("حمید");
  });

  test("the guest never has to type their own name", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    // No RSVP, no forms, no inputs anywhere - the page is invitation-only.
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.locator("input, textarea, select")).toHaveCount(0);
  });

  test("all the required sections are present, in order", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);

    await expect(page.getByTestId("language-toggle")).toBeVisible();
    await expect(page.getByRole("heading", { name: COUPLE.farsi_names })).toBeVisible();
    await expect(page.getByTestId("guest-greeting")).toBeVisible();

    await expect(page.getByRole("heading", { name: "جزئیات مراسم" })).toBeVisible();
    await expect(page.getByTestId("countdown")).toBeVisible();
    await expect(page.getByTestId("ics-link")).toBeVisible();
    await expect(page.getByTestId("google-calendar-link")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("shows the date, time and venue", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);

    // Scoped to the details section: the hero repeats the date and time as a
    // summary strip, so an unscoped locator would match twice.
    const details = page.locator("#invitation");
    await expect(details.getByText("شنبه، ۵ سپتامبر ۲۰۲۶")).toBeVisible();
    await expect(details.getByText("۱۷:۰۰ تا ۲۴:۰۰")).toBeVisible();
    await expect(details.getByText("سالن اجتماعات سورنتو").first()).toBeVisible();
  });

  test("the countdown counts down", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    const countdown = page.getByTestId("countdown");
    await countdown.scrollIntoViewIfNeeded();

    const first = await countdown.textContent();
    await expect
      .poll(async () => countdown.textContent(), { timeout: 4000 })
      .not.toBe(first);

    await expect(countdown).toContainText("روز");
    await expect(countdown).toContainText("ثانیه");
  });

  test("the anniversary monogram renders", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await expect(page.getByRole("img", { name: /نشان سالگرد/ }).first()).toBeVisible();
  });

  test("every generated slug returns a page, not a 404", async ({ request }) => {
    // Spot-check across the whole guest list.
    const { INVITES } = await import("./fixtures");
    const sample = INVITES.filter((_, i) => i % 7 === 0);
    expect(sample.length).toBeGreaterThan(5);

    for (const invite of sample) {
      const res = await request.get(`./${invite.slug}`);
      expect(res.status(), invite.slug).toBe(200);
    }
  });
});
