import { test, expect } from "@playwright/test";

test("basic app accessibility", async ({ page }) => {
  await page.goto("/");

  // Verify the app loads
  await expect(
    page.locator('h1:has-text("Welcome to Task Manager")'),
  ).toBeVisible();

  // Verify the sign in form is present
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();

  console.log("✅ Basic app accessibility test passed");
});
