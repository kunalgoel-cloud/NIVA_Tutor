import { defineConfig } from "@playwright/test";
import fs from "node:fs";

// Use a pre-installed Chromium when the default Playwright browser is not downloaded (e.g. sandboxes).
const candidates = [process.env.PW_CHROMIUM_PATH, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].filter(Boolean) as string[];
const executablePath = candidates.find((p) => fs.existsSync(p));

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  workers: 2,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    viewport: { width: 1180, height: 820 }, // iPad landscape-ish
    launchOptions: { executablePath },
  },
  webServer: {
    command: "npm run build && npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
