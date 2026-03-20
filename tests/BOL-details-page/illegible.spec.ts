import { test, expect } from "../../fixtures/user.fixture";
import { ENV } from "../../config/env";

test.describe("Illegible BOL details page", () => {
  test.use({ user: "testUser" });
  test.beforeEach(async ({ page }) => {
    await page.goto(`/bol-validation?bolId=${ENV.illegibleBolId}&siteId=${ENV.siteId}`);
  });
  // Details of Illegible BOL are initialy presented in View mode, with Edit button in the top right corner
  test("Verify UI of whole Illegible BOL details page", async ({
    page,
    illegibleBOL,
    generalDetails,
  }) => {
    //waiting for image to load to UI
    await page.waitForTimeout(2000);
    await expect(generalDetails.BOLHeader).toBeVisible();
    await expect(illegibleBOL.page).toHaveScreenshot(
      "illegible-BOL-details.png",
      {
        mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
        maskColor: "#e7c742",
      },
    );
  });
});
