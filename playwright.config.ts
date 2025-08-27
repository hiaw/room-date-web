import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // Disable parallel execution for authentication tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run tests sequentially
  reporter: "html",
  globalSetup: join(__dirname, "./tests/global-setup.ts"),
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },

  projects: [
    // Setup project
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use prepared auth state
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5174",
    reuseExistingServer: !process.env.CI,
  },
});
