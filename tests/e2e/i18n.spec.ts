import { expect, test } from "@playwright/test";

import { PARTY_INVITE } from "./fixtures";

test.describe("language and direction", () => {
  test("Farsi is the default and the page renders RTL", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);

    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "fa");

    await expect(page.getByTestId("guest-greeting")).toContainText("آرمیتا");
    await expect(page.getByText("جشن ۱۰ سالگی همراهی و عشق")).toBeVisible();
  });

  test("the toggle switches to English and flips direction to LTR", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await page.getByTestId("language-toggle").click();

    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "ltr");
    await expect(html).toHaveAttribute("lang", "en");

    await expect(page.getByTestId("guest-greeting")).toContainText("Armita, Hesam, Negar & Samyar");
    await expect(page.getByTestId("guest-greeting")).toContainText("Dear");
  });

  test("switching language re-renders the invitation body, not just the labels", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await expect(page.getByText(/ده سال پیش، دو قلب پیمان بستند/)).toBeVisible();

    await page.getByTestId("language-toggle").click();

    await expect(page.getByText(/Ten years ago, two hearts promised/)).toBeVisible();
    await expect(page.getByText(/ده سال پیش، دو قلب پیمان بستند/)).toHaveCount(0);
  });

  test("all event details are translated too", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await page.getByTestId("language-toggle").click();

    await expect(page.getByRole("heading", { name: "Event Details" })).toBeVisible();
    await expect(page.getByText("Saturday, 5 September 2026")).toBeVisible();
    await expect(page.getByText("5:00pm – 12:00am")).toBeVisible();
    await expect(page.getByText("Sorrento Community Hall")).toBeVisible();
    await expect(page.getByText("22 Padbury Circle, Sorrento WA 6020, Australia")).toBeVisible();
    await expect(page.getByTestId("ics-link")).toContainText("Apple / Outlook");
    await expect(page.getByTestId("google-calendar-link")).toContainText("Google Calendar");
    await expect(page.getByRole("heading", { name: "Our Moments" })).toBeVisible();
  });

  test("language persists in the URL, not in storage", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await page.getByTestId("language-toggle").click();

    await expect(page).toHaveURL(/[?&]lang=en/);

    // Nothing is written to web storage - it is unreliable in in-app browsers.
    const stored = await page.evaluate(() => ({
      local: Object.keys(window.localStorage),
      session: Object.keys(window.sessionStorage),
    }));
    expect(stored.local).toHaveLength(0);
    expect(stored.session).toHaveLength(0);
  });

  test("opening ?lang=en directly renders English in LTR", async ({ page }) => {
    await page.goto(`${PARTY_INVITE.slug}?lang=en`);

    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByTestId("guest-greeting")).toContainText("Armita");
  });

  test("toggling back returns to Farsi and clears the URL param", async ({ page }) => {
    await page.goto(`${PARTY_INVITE.slug}?lang=en`);
    await page.getByTestId("language-toggle").click();

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page).not.toHaveURL(/lang=en/);
  });

  test("layout mirrors, not just the text", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);

    const positions = async () => {
      const icon = (await page.getByTestId("detail-icon").boundingBox())!;
      const body = (await page.getByTestId("detail-body").boundingBox())!;
      return { icon: icon.x, body: body.x };
    };

    // In RTL the icon sits to the RIGHT of the text it labels...
    const rtl = await positions();
    expect(rtl.icon).toBeGreaterThan(rtl.body);

    await page.getByTestId("language-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    // ...and swaps to the LEFT in LTR. The whole row mirrors, not only the glyphs.
    const ltr = await positions();
    expect(ltr.icon).toBeLessThan(ltr.body);
  });

  test("text direction is inherited by the content, not just the html tag", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);

    const direction = () =>
      page.getByTestId("detail-body").evaluate((el) => getComputedStyle(el).direction);

    expect(await direction()).toBe("rtl");

    await page.getByTestId("language-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    expect(await direction()).toBe("ltr");
  });

  test("fonts differ per language", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    const fontFa = await page
      .getByTestId("guest-greeting")
      .evaluate((el) => getComputedStyle(el).fontFamily);

    await page.getByTestId("language-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    const fontEn = await page
      .getByTestId("guest-greeting")
      .evaluate((el) => getComputedStyle(el).fontFamily);

    expect(fontFa).not.toBe(fontEn);
    expect(fontFa).toMatch(/Vazirmatn/i);
    expect(fontEn).toMatch(/DM Serif/i);
  });
});
