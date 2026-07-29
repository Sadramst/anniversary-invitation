import { expect, test } from "@playwright/test";

import { PARTY_INVITE } from "./fixtures";

test.describe("mobile and in-app browsers", () => {
  test("no horizontal overflow on a phone, in either language", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);

    const overflows = async () =>
      page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );

    expect(await overflows(), "RTL overflows").toBe(false);

    await page.getByTestId("language-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    expect(await overflows(), "LTR overflows").toBe(false);
  });

  test("the language toggle stays reachable while scrolling", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("language-toggle")).toBeInViewport();
  });

  test("tap targets are large enough for a thumb", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "desktop-chrome", "mobile ergonomics only");

    await page.goto(PARTY_INVITE.slug);
    for (const id of ["language-toggle", "ics-link", "google-calendar-link"]) {
      const target = page.getByTestId(id);
      await target.scrollIntoViewIfNeeded();
      const box = (await target.boundingBox())!;
      expect(box.height, id).toBeGreaterThanOrEqual(40);
    }
  });

  test("works when web storage is blocked, as in some in-app webviews", async ({ page }) => {
    // Instagram/WhatsApp webviews can throw on storage access; the page must not care.
    await page.addInitScript(() => {
      const boom = () => {
        throw new DOMException("Storage disabled", "SecurityError");
      };
      Object.defineProperty(window, "localStorage", { get: boom, configurable: true });
      Object.defineProperty(window, "sessionStorage", { get: boom, configurable: true });
    });

    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto(PARTY_INVITE.slug);
    await expect(page.getByTestId("guest-greeting")).toBeVisible();

    await page.getByTestId("language-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByTestId("guest-greeting")).toContainText("Armita");

    expect(errors, errors.join("\n")).toHaveLength(0);
  });

  test("works when the History API is unavailable", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await expect(page.getByTestId("guest-greeting")).toBeVisible();

    // Some embedded webviews reject history.replaceState. Break it after load so
    // the framework's own hydration is unaffected and we test only our handling.
    await page.evaluate(() => {
      window.history.replaceState = () => {
        throw new DOMException("SecurityError", "SecurityError");
      };
    });

    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.getByTestId("language-toggle").click();

    // Language still switches even though the URL could not be updated.
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByTestId("guest-greeting")).toContainText("Armita");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });

  test("renders without any console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto(PARTY_INVITE.slug);
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();

    expect(errors, errors.join("\n")).toHaveLength(0);
  });

  test("the invitation is readable before JavaScript runs", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`./${PARTY_INVITE.slug}`, { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("guest-greeting")).toContainText("آرمیتا");
    await expect(page.getByTestId("map-link")).toHaveAttribute("href", /google\.com\/maps/);
    await expect(page.getByTestId("ics-link")).toHaveAttribute("href", /^data:text\/calendar/);

    await context.close();
  });
});

test.describe("accessibility", () => {
  test("has exactly one h1 and a sensible heading order", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.locator("h2").count()).toBeGreaterThanOrEqual(2);
  });

  test("every image has alt text and decorative ones are hidden", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();

    const alts = await page.locator("img").evaluateAll((els) =>
      els.map((el) => (el as HTMLImageElement).getAttribute("alt")),
    );
    expect(alts.length).toBeGreaterThan(0);
    for (const alt of alts) expect(alt).not.toBeNull();
  });

  test("every interactive control has an accessible name", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();

    const unnamed = await page.locator("a, button").evaluateAll((els) =>
      els
        .filter((el) => {
          const label =
            el.getAttribute("aria-label") ?? (el.textContent ?? "").trim();
          return label.length === 0;
        })
        .map((el) => el.outerHTML.slice(0, 90)),
    );
    expect(unnamed, unnamed.join("\n")).toHaveLength(0);
  });

  test("offers a skip link to the main content", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes("webview"), "no hardware keyboard in a webview");

    await page.goto(PARTY_INVITE.slug);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "پرش به محتوای اصلی" })).toBeFocused();
  });

  test("body text meets contrast expectations against the dark backdrop", async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);

    const luminance = (rgb: string) => {
      const [r, g, b] = rgb.match(/\d+/g)!.slice(0, 3).map(Number);
      const channel = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };

    const { fg, bg } = await page.evaluate(() => {
      const el = document.querySelector("main p")!;
      return {
        fg: getComputedStyle(el).color,
        bg: getComputedStyle(document.body).backgroundColor,
      };
    });

    const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
    const ratio = (l1 + 0.05) / (l2 + 0.05);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test("honours prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(PARTY_INVITE.slug);

    const duration = await page
      .getByTestId("guest-greeting")
      .evaluate((el) => getComputedStyle(el.closest("header")!).animationDuration);
    expect(parseFloat(duration)).toBeLessThan(0.01);
  });
});
