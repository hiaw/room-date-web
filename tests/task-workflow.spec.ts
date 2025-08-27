import { test, expect } from "@playwright/test";
import { restoreSessionStorage } from "./helpers/auth-helper.js";

test.describe("Task Management Workflow", () => {
  test("complete user workflow: create task, mark as done", async ({
    page,
  }) => {
    // Navigate to the application (already authenticated via setup)
    await page.goto("/");

    // Restore sessionStorage since Playwright doesn't handle it automatically
    await restoreSessionStorage(page);

    // Reload to pick up the authentication state
    await page.reload();

    // Should already be on the tasks page
    await expect(
      page.getByRole("heading", { name: "Your Tasks" }),
    ).toBeVisible();

    // Step 1: Create a new task
    await test.step("Create a new task", async () => {
      const taskText = "Complete project documentation";

      await page
        .getByRole("textbox", { name: "Enter a new task..." })
        .fill(taskText);
      await page.getByRole("button", { name: "Add Task" }).click();

      // Verify task appears in the list
      await expect(page.getByText(taskText)).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Mark as complete" }),
      ).toBeVisible();
    });

    // Step 2: Mark the task as complete
    await test.step("Mark task as complete", async () => {
      await page.getByRole("button", { name: "Mark as complete" }).click();

      // Should see "Mark as incomplete" button instead
      await expect(
        page.getByRole("button", { name: "Mark as incomplete" }),
      ).toBeVisible();

      // Task text should still be visible
      await expect(
        page.getByText("Complete project documentation"),
      ).toBeVisible();
    });

    // Step 3: Mark the task as incomplete again
    await test.step("Mark task as incomplete", async () => {
      await page.getByRole("button", { name: "Mark as incomplete" }).click();

      // Should see "Mark as complete" button again
      await expect(
        page.getByRole("button", { name: "Mark as complete" }),
      ).toBeVisible();
    });
  });

  test("user can create and manage multiple tasks", async ({ page }) => {
    // Navigate to the application
    await page.goto("/");

    // Restore sessionStorage since Playwright doesn't handle it automatically
    await restoreSessionStorage(page);

    // Reload to pick up the authentication state
    await page.reload();

    // Should be on the tasks page
    await expect(
      page.getByRole("heading", { name: "Your Tasks" }),
    ).toBeVisible();

    // Create multiple tasks
    await test.step("Create multiple tasks", async () => {
      const tasks = [
        "Write unit tests",
        "Update documentation",
        "Code review PR #123",
      ];

      for (const taskText of tasks) {
        await page
          .getByRole("textbox", { name: "Enter a new task..." })
          .fill(taskText);
        await page.getByRole("button", { name: "Add Task" }).click();

        // Verify each task appears
        await expect(page.getByText(taskText)).toBeVisible();
      }

      // Should have multiple "Mark as complete" buttons (at least 3 from our new tasks)
      const completeButtons = page.getByRole("button", {
        name: "Mark as complete",
      });
      await expect(completeButtons.first()).toBeVisible();

      // Verify we have at least 3 buttons (could be more from previous tests)
      const count = await completeButtons.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    // Complete some tasks
    await test.step("Complete some tasks", async () => {
      // Mark the first task as complete
      const firstCompleteButton = page
        .getByRole("button", { name: "Mark as complete" })
        .first();
      await firstCompleteButton.click();

      // Should have at least one "Mark as incomplete" button
      const incompleteButtons = page.getByRole("button", {
        name: "Mark as incomplete",
      });
      await expect(incompleteButtons.first()).toBeVisible();
    });
  });
});
