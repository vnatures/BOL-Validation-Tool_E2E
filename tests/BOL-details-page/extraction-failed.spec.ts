import { test, expect } from "../../fixtures/user.fixture";
import { ENV } from "../../config/env";

test.describe("Extraction Failed BOL", () => {
  test.use({ user: "testUser" });
  test.beforeEach(async ({ page }) => {
    await page.goto(`/bol-validation?bolId=${ENV.extractionFailedBolId}&siteId=${ENV.siteId}`);
  });

  // Details of Extraction Failed BOL are presented in Read Only mode
  test("Verify UI of whole Extraction Failed BOL details page", async ({
    page,
    extractionFailedBOL,
    generalDetails,
  }) => {
    //waiting for image to load to UI
    await page.waitForTimeout(2000);
    await expect(generalDetails.BOLHeader).toBeVisible();
    await expect(extractionFailedBOL.page).toHaveScreenshot(
      "extraction-failed-BOL-details.png",
      {
        mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
        maskColor: "#e7c742",
      },
    );
  });

  test("User can copy link to Archive page", async ({
    extractionFailedBOL,
    generalDetails,
    page,
  }) => {
    await page.waitForTimeout(3000);
    await generalDetails.generateLinkBtn.click();
    await expect(generalDetails.toastMsg).toHaveScreenshot(
      "generated-link-msg.png",
    );
    await generalDetails.linkForApp.click();
    await expect(generalDetails.linkForAppContainer).toHaveScreenshot(
      "link-container.png",
    );
    await generalDetails.closeBtn.click();
    await expect(extractionFailedBOL.page).toHaveScreenshot(
      "extraction-failed-BOL-details.png",
      {
        mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
        maskColor: "#e7c742",
      },
    );
  });

  //   test("User cannot edit any data", async ({
  //     page,
  //     extractionFailedBOL,
  //     generalDetails,
  //   }) => {
  //     //waiting for image to load to UI
  //     await page.waitForTimeout(3000);
  //   });
});
