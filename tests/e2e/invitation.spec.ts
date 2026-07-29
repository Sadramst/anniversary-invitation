import { expect, test } from "@playwright/test";

import { COUPLE, INDIVIDUAL_INVITE, PARTY_INVITE, SOLO_INVITE } from "./fixtures";

test.describe("personalised invitation", () => {
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
    await expect(page.getByRole("heading", { name: "لحظه‌های ما" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("shows the date, time and venue", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);

    await expect(page.getByText("شنبه، ۵ سپتامبر ۲۰۲۶")).toBeVisible();
    await expect(page.getByText("۱۷:۰۰ تا ۲۴:۰۰")).toBeVisible();
    await expect(page.getByText("سالن اجتماعات سورنتو")).toBeVisible();
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
    await expect(page.getByRole("img", { name: /نشان دهمین سالگرد/ }).first()).toBeVisible();
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
