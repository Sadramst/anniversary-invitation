import { expect, test } from "@playwright/test";

import { PARTY_INVITE } from "./fixtures";

test.describe("photo gallery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PARTY_INVITE.slug);
    await page.getByRole("heading", { name: "لحظه‌های ما" }).scrollIntoViewIfNeeded();
  });

  test("shows all 10 couple photos", async ({ page }) => {
    await expect(page.getByTestId("gallery-thumb")).toHaveCount(10);
  });

  test("every photo has descriptive alt text", async ({ page }) => {
    const images = page.getByTestId("gallery-thumb").locator("img");
    await expect(images).toHaveCount(10);

    for (let i = 0; i < 10; i += 1) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt, `photo ${i + 1}`).toBeTruthy();
      expect(alt).toContain("عکس");
    }
  });

  test("images below the fold are lazy-loaded", async ({ page }) => {
    const images = page.getByTestId("gallery-thumb").locator("img");
    await expect(images.nth(9)).toHaveAttribute("loading", "lazy");
  });

  test("uses responsive srcset via next/image", async ({ page }) => {
    const first = page.getByTestId("gallery-thumb").locator("img").first();
    await expect(first).toHaveAttribute("srcset", /\/_next\/image\?url=/);
    await expect(first).toHaveAttribute("sizes", /vw/);
  });

  test("opens a photo in the lightbox", async ({ page }) => {
    await page.getByTestId("gallery-thumb").first().click();

    const lightbox = page.getByTestId("lightbox");
    await expect(lightbox).toBeVisible();
    await expect(lightbox).toHaveAttribute("aria-modal", "true");
    await expect(lightbox).toContainText("1 / 10");
  });

  test("steps forward and wraps around", async ({ page }) => {
    await page.getByTestId("gallery-thumb").first().click();
    const lightbox = page.getByTestId("lightbox");

    await page.getByTestId("lightbox-next").click();
    await expect(lightbox).toContainText("2 / 10");

    await page.getByTestId("lightbox-prev").click();
    await expect(lightbox).toContainText("1 / 10");

    // Wrap backwards from the first photo to the last.
    await page.getByTestId("lightbox-prev").click();
    await expect(lightbox).toContainText("10 / 10");
  });

  test("closes with the close button", async ({ page }) => {
    await page.getByTestId("gallery-thumb").first().click();
    await page.getByTestId("lightbox-close").click();
    await expect(page.getByTestId("lightbox")).toHaveCount(0);
  });

  test("closes with the Escape key", async ({ page }) => {
    await page.getByTestId("gallery-thumb").first().click();
    await expect(page.getByTestId("lightbox")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("lightbox")).toHaveCount(0);
  });

  test("arrow keys are mirrored for RTL", async ({ page }) => {
    await page.getByTestId("gallery-thumb").first().click();
    const lightbox = page.getByTestId("lightbox");

    // Page is RTL by default, so the LEFT arrow means "next".
    await page.keyboard.press("ArrowLeft");
    await expect(lightbox).toContainText("2 / 10");
    await page.keyboard.press("ArrowRight");
    await expect(lightbox).toContainText("1 / 10");
  });

  test("arrow keys follow LTR order in English", async ({ page }) => {
    await page.getByTestId("language-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    await page.getByRole("heading", { name: "Our Moments" }).scrollIntoViewIfNeeded();
    await page.getByTestId("gallery-thumb").first().click();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("lightbox")).toContainText("2 / 10");
  });

  test("locks background scrolling while open and restores it after", async ({ page }) => {
    await page.getByTestId("gallery-thumb").first().click();
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflow))
      .toBe("hidden");

    await page.keyboard.press("Escape");
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflow))
      .not.toBe("hidden");
  });

  test("is reachable and operable with the keyboard alone", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes("webview"), "no hardware keyboard in a webview");

    const firstThumb = page.getByTestId("gallery-thumb").first();
    await firstThumb.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("lightbox")).toBeVisible();
    // Focus moves into the dialog so keyboard users are not stranded behind it.
    await expect(page.getByTestId("lightbox-close")).toBeFocused();
  });
});
