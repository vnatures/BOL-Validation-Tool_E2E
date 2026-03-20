import { test, expect } from "../../fixtures/user.fixture";
import { ENV } from "../../config/env";

test.describe("Pending Validation BOL details page", () => {
  test.use({ user: "testUser" });
  test.beforeEach(async ({ page }) => {
    await page.goto(`/bol-validation?bolId=${ENV.pendingBolId}&siteId=${ENV.siteId}`);
  });
  // Details of Pending Validation BOL are initialy presented in edit mode, with Save and Commit button in the top right corner
  //587 - DO NOT DELETE
  test("Verify UI of whole Pending Validation BOL details page", async ({
    page,
    pendingValidationBOL,
    generalDetails,
  }) => {
    //waiting for image to load to UI
    await page.waitForTimeout(2000);
    await expect(generalDetails.BOLHeader).toBeVisible();
    await expect(pendingValidationBOL.page).toHaveScreenshot(
      "pending-validation-BOL-details.png",
      {
        mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
        maskColor: "#e7c742",
      },
    );
  });
});
