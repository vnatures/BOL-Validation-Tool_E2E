import { test, expect } from "../../fixtures/user.fixture";
import { ENV } from "../../config/env";

test.describe("Valid BOL details page", () => {
  test.use({ user: "testUser" });
  test.beforeEach(async ({ page }) => {
    await page.goto(`/bol-validation?bolId=${ENV.validBolId}&siteId=${ENV.siteId}`);
  });
  // Details of Valid BOL are initialy presented in View mode, with Edit button in the top right corner
  test("Verify UI of whole Valid BOL details page", async ({
    page,
    generalDetails,
    validBOL,
  }) => {
    //waiting for image to load to UI
    await page.waitForTimeout(2000);
    await expect(generalDetails.BOLHeader).toBeVisible();
    await expect(validBOL.page).toHaveScreenshot("valid-BOL-details.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
  });
});
