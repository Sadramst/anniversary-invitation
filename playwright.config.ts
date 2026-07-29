import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_PATH = "/anniversary";

/** Real WhatsApp Android in-app browser UA string. */
const WHATSAPP_UA =
  "Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 [FB_IAB/Orca-Android;FBAV/449.0.0.0;]WhatsApp/2.24.1";

/** Real Instagram iOS in-app browser UA string. */
const INSTAGRAM_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21C62 Instagram 310.0.0.0.0";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    // Trailing slash matters: paths in tests are relative so the basePath is preserved.
    baseURL: `http://127.0.0.1:${PORT}${BASE_PATH}/`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
    { name: "desktop-chrome", use: { ...devices["Desktop Chrome"] } },
    {
      // Guests will mostly open this from a WhatsApp message.
      name: "whatsapp-webview",
      use: { ...devices["Pixel 5"], userAgent: WHATSAPP_UA },
    },
    {
      name: "instagram-webview",
      use: { ...devices["iPhone 13"], userAgent: INSTAGRAM_UA, browserName: "chromium" },
    },
  ],

  webServer: {
    command: `npx next start --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}${BASE_PATH}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
