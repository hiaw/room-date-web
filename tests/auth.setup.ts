import { test as setup, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Navigate to the application
  await page.goto("/");

  // Wait for the page to load
  await expect(
    page.getByRole("heading", { name: "Welcome to Task Manager" }),
  ).toBeVisible();

  // Wait for page to be fully loaded
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  // Click "Sign Up" button to switch to registration mode with retry logic
  let retries = 3;
  while (retries > 0) {
    await page.getByRole("button", { name: "Sign Up" }).click();

    // Wait a moment for the state change
    await page.waitForTimeout(1000);

    // Check if we successfully switched to sign up mode
    const signInButton = page.getByRole("button", { name: "Sign In" });
    try {
      await expect(signInButton).toBeVisible({ timeout: 2000 });
      break; // Success!
    } catch {
      retries--;
      if (retries === 0) {
        throw new Error(
          "Failed to switch to Sign Up mode after multiple attempts",
        );
      }
    }
  }

  // Now wait for the name field to appear
  // Name field is optional; appear only in Sign Up mode. Wait for it but tolerate absence.
  const nameField = page.locator("#name");
  try {
    await expect(nameField).toBeVisible({ timeout: 3000 });
  } catch {
    // If not visible, ensure we are still in sign up mode by checking the submit button text.
    // Fallback: ensure sign up submit button (text may vary)
    await expect(page.getByRole("button", { name: /Sign Up/ })).toBeVisible();
  }

  // Generate unique test credentials
  const testEmail = `test-user-${Date.now()}@playwright-test.com`;
  const testPassword = `TestPass123!${Date.now()}`;
  const testName = `Test User ${Date.now()}`;

  // Fill out the registration form
  await page.locator("#email").fill(testEmail);
  await page.locator("#password").fill(testPassword);
  if (await page.locator("#name").isVisible()) {
    await page.locator("#name").fill(testName);
  }

  // Submit the form
  await page.getByRole("button", { name: /Sign Up with Email/ }).click();

  // Wait for successful registration/login - should see the task management interface
  await expect(page.getByRole("heading", { name: "Your Tasks" })).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole("textbox", { name: "Enter a new task..." }),
  ).toBeVisible();

  // Capture sessionStorage manually and combine with regular storage state
  const sessionStorageData = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        data[key] = sessionStorage.getItem(key) || "";
      }
    }
    return data;
  });

  // Get the regular storage state
  const storageState = await page.context().storageState();

  // Add sessionStorage to the storage state
  if (storageState.origins.length === 0) {
    storageState.origins.push({
      origin: "http://localhost:5174",
      localStorage: [],
    });
  }

  // Add sessionStorage data as a custom property
  const origin = storageState.origins[0] as (typeof storageState.origins)[0] & {
    sessionStorage?: Array<{ name: string; value: string }>;
  };

  origin.sessionStorage = Object.entries(sessionStorageData).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  // Save the enhanced storage state
  fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));
});
