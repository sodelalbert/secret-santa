import { test, expect, Page } from "@playwright/test";

/**
 * Navigate to the application and wait for it to load
 */
async function navigateToApp(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

/**
 * Add a participant to the Secret Santa list
 */
async function addParticipant(page: Page, name: string) {
  await page.fill("#nameInput", name);
  await page.click(".btn-add");
  await page.waitForTimeout(100);
}

/**
 * Add multiple participants to the Secret Santa list
 */
async function addMultipleParticipants(page: Page, names: string[]) {
  for (const name of names) {
    await addParticipant(page, name);
  }
}

test.describe("Secret Santa Application", () => {
  test("should load the application and display title", async ({ page }) => {
    await navigateToApp(page);

    // Check if main heading is visible
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Secret Santa");

    // Check if subtitle is visible
    const subtitle = page.locator(".subtitle");
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText("Who will buy presents for whom");

    // Check initial state
    const count = page.locator("#count");
    await expect(count).toContainText("No participants yet");
  });

  test("should add participants and enable generate button", async ({
    page,
  }) => {
    await navigateToApp(page);

    // Initially, the generate button should be disabled
    const generateBtn = page.locator("#generateBtn");
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toBeDisabled();

    // Add first participant
    await addParticipant(page, "Alice");

    // Check if participant was added
    const firstParticipant = page.locator(".participant-name").first();
    await expect(firstParticipant).toBeVisible();
    await expect(firstParticipant).toContainText("Alice");

    // Generate button should still be disabled (need at least 2)
    await expect(generateBtn).toBeDisabled();

    // Add second participant
    await addParticipant(page, "Bob");

    // Check if second participant was added
    const participants = page.locator(".participant-name");
    await expect(participants).toHaveCount(2);

    // Generate button should now be enabled
    await expect(generateBtn).toBeEnabled();

    // Check participant count
    const count = page.locator("#count");
    await expect(count).toContainText("2 participants");
  });

  test("should generate Secret Santa assignments", async ({ page }) => {
    await navigateToApp(page);

    // Add participants
    const participantNames = ["Alice", "Bob", "Charlie"];
    await addMultipleParticipants(page, participantNames);

    // Verify all participants are added
    const participants = page.locator(".participant-name");
    await expect(participants).toHaveCount(3);

    // Generate button should be enabled
    const generateBtn = page.locator("#generateBtn");
    await expect(generateBtn).toBeEnabled();

    // Click generate button
    await generateBtn.click();

    // Wait for results to appear
    const results = page.locator("#results");
    await expect(results).toBeVisible({ timeout: 10000 });

    // Check if results heading is displayed
    const resultsHeading = results.locator("h2");
    await expect(resultsHeading).toBeVisible();
    await expect(resultsHeading).toContainText("Results");

    // Check if assignments are displayed (should have 3 assignments)
    const assignments = page.locator(".result-item");
    await expect(assignments).toHaveCount(3);

    // Check if each assignment contains "will buy a present for"
    const assignmentTexts = await assignments.allTextContents();
    for (const text of assignmentTexts) {
      expect(text).toContain("will buy a present for");
    }

    // Check if generate button is now disabled
    await expect(generateBtn).toBeDisabled();

    // Check if reset button is visible
    const resetBtn = page.locator("#resetBtn");
    await expect(resetBtn).toBeVisible();

    // Check if edit/remove buttons are hidden after generation
    const editButtons = page.locator(".btn-edit");
    await expect(editButtons).toHaveCount(0);

    const removeButtons = page.locator(".btn-remove");
    await expect(removeButtons).toHaveCount(0);
  });
});
