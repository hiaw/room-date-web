import type { Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, "../../playwright/.auth/user.json");

/**
 * Restore sessionStorage from the auth file since Playwright doesn't handle it automatically
 */
export async function restoreSessionStorage(page: Page) {
  try {
    if (!fs.existsSync(authFile)) {
      return;
    }

    const authData = JSON.parse(fs.readFileSync(authFile, "utf8"));
    const origin = authData.origins?.[0];
    const sessionStorageItems = origin?.sessionStorage;

    if (sessionStorageItems && Array.isArray(sessionStorageItems)) {
      await page.evaluate((items) => {
        for (const item of items) {
          sessionStorage.setItem(item.name, item.value);
        }
      }, sessionStorageItems);
    }
  } catch (error) {
    console.warn("Failed to restore sessionStorage:", error);
  }
}
