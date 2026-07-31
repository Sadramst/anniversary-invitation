import { expect, test } from "@playwright/test";

import { EXPECTED_ADDRESS, EXPECTED_MAP_URL, PARTY_INVITE } from "./fixtures";

test.describe("map link", () => {
  test("uses the Google Maps universal URL so it opens the native app on mobile", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    const link = page.getByTestId("map-link");

    await expect(link).toHaveAttribute("href", EXPECTED_MAP_URL);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });

  test("shows the full address next to the directions button", async ({ page }) => {
    await page.goto(`${PARTY_INVITE.slug}?lang=en`);
    const link = page.getByTestId("map-link");
    await expect(link).toBeVisible();
    // The button itself is a short call to action; the address is printed above
    // it so a guest can read or copy it without opening Maps.
    await expect(page.getByText(EXPECTED_ADDRESS).first()).toBeVisible();
  });

  test("the map URL is identical in both languages", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    const fa = await page.getByTestId("map-link").getAttribute("href");
    await page.getByTestId("language-toggle").click();
    const en = await page.getByTestId("map-link").getAttribute("href");
    expect(fa).toBe(en);
    expect(fa).toBe(EXPECTED_MAP_URL);
  });
});

test.describe("add to calendar", () => {
  test("the Google Calendar link is pre-filled correctly", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    const href = (await page.getByTestId("google-calendar-link").getAttribute("href"))!;

    expect(href.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);

    const params = new URL(href).searchParams;
    expect(params.get("action")).toBe("TEMPLATE");
    expect(params.get("dates")).toBe("20260912T090000Z/20260912T160000Z");
    expect(params.get("text")).toContain("10th Anniversary");
    expect(params.get("location")).toBe(EXPECTED_ADDRESS);
    expect(params.get("details")).toContain("Sorrento Community Hall");
  });

  test("the .ics link carries a valid, correctly-timed calendar file", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    const href = (await page.getByTestId("ics-link").getAttribute("href"))!;

    expect(href.startsWith("data:text/calendar;charset=utf-8,")).toBe(true);

    const ics = decodeURIComponent(href.replace("data:text/calendar;charset=utf-8,", ""));
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:20260912T090000Z"); // 12 Sep 2026, 5:00pm Perth
    expect(ics).toContain("DTEND:20260912T160000Z"); // 13 Sep 2026, 12:00am Perth
    expect(ics).toContain("SUMMARY:");
    expect(ics).toContain("LOCATION:22 Padbury Circle\\, Sorrento WA 6020\\, Australia");
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });

  test("the .ics link downloads with a sensible filename", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await expect(page.getByTestId("ics-link")).toHaveAttribute(
      "download",
      "anniversary-invitation.ics",
    );
  });

  test("calendar links exist in the server HTML, so they work without JavaScript", async ({
    request,
  }) => {
    const html = await (await request.get(`./${PARTY_INVITE.slug}`)).text();
    expect(html).toContain("data:text/calendar;charset=utf-8,");
    expect(html).toContain("calendar.google.com/calendar/render");
    expect(html).toContain("www.google.com/maps/search/");
  });

  test("the calendar file actually triggers a download", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chrome",
      "download interception is only reliable on desktop",
    );

    await page.goto(PARTY_INVITE.slug);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("ics-link").click(),
    ]);
    expect(download.suggestedFilename()).toBe("anniversary-invitation.ics");
  });
});
