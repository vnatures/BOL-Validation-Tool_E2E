import { test, expect } from "../../fixtures/user.fixture";
import { uploadDocumentImages, deleteBolDocument } from "../../util/helper";
import { ENV } from "../../config/env";
/**
 * This file:
 * - Uploads a fresh BOL via API before each test (to guarantee a known starting state).
 * - Executes various UI workflows on the latest “Pending Validation” BOL (save, mark valid/illegible, commit, edit).
 * - (Soft) Deletes the created BOL via API after each test (cleanup to keep the UI tidy).
 *
 * Notes:
 * - The entire suite is intentionally skipped via `test.describe.skip(...)` so it only runs on demand
 *   (e.g., debugging, targeted regression), not on every test run.
 *
 * Test data used (note that this may vary based on .env):
 * - Site data (SITE_ID and SITE_NAME in .env file) must be cirrectly configured.
 * - The uploader user `uploadedBy - always use one user to avoid failing screenshots because of different username captured.
 * - The test images exist at BOLs folder in the root of the project.
 *
 * Visual regression:
 * - Multiple steps capture screenshots.
 * - Dynamic fields (BOL ID and Last Updated date) are masked to stabilize snapshots.
 * - Tests tend to be flaky because of snapshots - optimize the usage.
 */
test.describe.skip("Actions on BOLs", () => {
  test.use({ user: "testUser" });
  test.beforeEach(
    "Upload new BOL, navigate to it and make actions",
    async ({ request }) => {
      const result = await uploadDocumentImages({
        request,
        siteId: ENV.siteId,
        uploadedBy: ENV.uploadedBy,
        filePaths: ["BOLs/1page/ohio-00004.png"],
        note: "Automated upload of 1 BOL",
      });
      expect(result.registerStatus).toBe(201);
    },
  );
  test.afterEach(
    "Delete BOL after test finishes",
    async ({ page, request, generalDetails }) => {
      await page.goto("");
      await generalDetails.selectSite(ENV.siteName);
      await page.waitForTimeout(1000);
      await generalDetails.removeStatusFilter.click();
      await page.waitForTimeout(1000);
      await generalDetails.sortBolId.click();
      await page.waitForTimeout(500);
      await generalDetails.sortBolId.click();
      const bolId = await page
        .locator("td.mantine-Table-td")
        .first()
        .innerText();
      const result = await deleteBolDocument(
        request,
        ENV.siteId,
        bolId.trim(),
        ENV.uploadedBy,
      );
      expect(result.status).toBe(201);
      expect(result.body).toBe("");
    },
  );
  // Upload 1 BOL, find it in UI, open it, work on it - delete it (mask ID from screenshot)
  test("Saving of BOL", async ({
    page,
    generalDetails,
    pendingValidationBOL,
  }) => {
    // Navigate to newest BOL
    await page.goto("");
    await generalDetails.selectSite(ENV.siteName);
    await generalDetails.removeStatusFilter.click();
    await page.waitForTimeout(1000);
    await generalDetails.sortBolId.click();
    await page.waitForTimeout(500);
    await generalDetails.sortBolId.click();
    await pendingValidationBOL.tableRow.click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("before-save.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
    // Clear fields
    await generalDetails.fabricatorInput.fill("");
    await generalDetails.loadNumberInput.fill("");
    await generalDetails.deleteDateBtn.click();
    await generalDetails.qty1Input.click();
    await generalDetails.input.fill("");
    await generalDetails.mark1Input.click();
    await generalDetails.input.fill("");
    await generalDetails.weight1Input.click();
    await generalDetails.input.fill("");
    await generalDetails.sequence1Input.click();
    await generalDetails.input.fill("");
    await expect(page).toHaveScreenshot("empty-fields-before-save.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
    // wait for PUT request triggered by Save btn
    const responsePromise = page.waitForResponse((response) => {
      return (
        response.request().method() === "PUT" &&
        response.url().includes(`api/v1/sites/${ENV.siteId}/documents`)
      );
    });
    // trigger the PUT request
    await generalDetails.saveBtn.click();
    await expect(generalDetails.toastMsg).toHaveScreenshot("save-success.png");
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // refresh page and make sure data is saved
    await page.goto("");
    await generalDetails.selectSite(ENV.siteName);
    await generalDetails.removeStatusFilter.click();
    await page.waitForTimeout(1000);
    await generalDetails.sortBolId.click();
    await page.waitForTimeout(500);
    await generalDetails.sortBolId.click();
    await pendingValidationBOL.tableRow.click();
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot("empty-fields-after-save.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
  });

  test("Mark BOL Illegible - Fabricator and Load Number Illegible", async ({
    page,
    generalDetails,
    pendingValidationBOL,
  }) => {
    await page.goto("");
    await generalDetails.selectSite(ENV.siteName);
    await generalDetails.removeStatusFilter.click();
    await generalDetails.sortBolId.click();
    await page.waitForTimeout(500);
    await generalDetails.sortBolId.click();
    await page.waitForTimeout(1000);
    await pendingValidationBOL.tableRow.click();
    await page.waitForTimeout(2000);
    // Mark first field illegible, mark others valid
    await generalDetails.illegibleBtn.nth(0).click();
    for (let i = 2; i <= 12; i++) {
      await generalDetails.validBtn.nth(i).click();
    }
    await generalDetails.commitBtn.click();
    await expect(generalDetails.commitDialog).toHaveScreenshot(
      "illegible-commit-dialog.png",
    );
    await generalDetails.yesCommitBtn.click();
    await expect(generalDetails.toastMsg).toHaveScreenshot(
      "illegible-bol-msg.png",
    );
    await expect(page).toHaveScreenshot("illegible-BOL-status.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
  });

  test("Mark BOL Illegible - row in table marked as Illegible", async ({
    page,
    generalDetails,
    pendingValidationBOL,
  }) => {
    await page.goto("");
    await generalDetails.selectSite(ENV.siteName);
    await generalDetails.removeStatusFilter.click();
    await page.waitForTimeout(1000);
    await generalDetails.sortBolId.click();
    await page.waitForTimeout(500);
    await generalDetails.sortBolId.click();
    await pendingValidationBOL.tableRow.click();
    await page.waitForTimeout(2000);
    await generalDetails.illegibleBtn.nth(0).click();

    for (let i = 1; i <= 11; i++) {
      await generalDetails.validBtn.nth(i).click();
    }
    await generalDetails.illegibleBtn.nth(11).click();
    await generalDetails.commitBtn.click();
    await expect(generalDetails.commitDialog).toHaveScreenshot(
      "illegible-commit-dialog.png",
    );
    await generalDetails.yesCommitBtn.click();
    await expect(generalDetails.toastMsg).toHaveScreenshot(
      "illegible-bol-msg.png",
    );
    await expect(page).toHaveScreenshot("illegible-BOL-status2.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
  });

  test("Mark BOL Valid", async ({
    page,
    generalDetails,
    pendingValidationBOL,
  }) => {
    await page.goto("");
    await generalDetails.selectSite(ENV.siteName);
    await generalDetails.removeStatusFilter.click();
    await page.waitForTimeout(1000);
    await generalDetails.sortBolId.click();
    await page.waitForTimeout(500);
    await generalDetails.sortBolId.click();
    await pendingValidationBOL.tableRow.click();
    await page.waitForTimeout(2000);

    for (let i = 1; i <= 12; i++) {
      await generalDetails.validBtn.nth(i).click();
    }
    await generalDetails.commitBtn.click();
    await expect(generalDetails.commitDialog).toHaveScreenshot(
      "valid-commit-dialog.png",
    );
    await generalDetails.yesCommitBtn.click();
    await expect(generalDetails.toastMsg).toHaveScreenshot(
      "validated-bol-msg.png",
    );
    await expect(page).toHaveScreenshot("validated-BOL-status.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
  });

  test("Commit BOL without all rows being marked Valid/Illegible", async ({
    page,
    generalDetails,
    pendingValidationBOL,
  }) => {
    await page.goto("");
    await generalDetails.selectSite(ENV.siteName);
    await generalDetails.removeStatusFilter.click();
    await page.waitForTimeout(1000);
    await generalDetails.sortBolId.click();
    await page.waitForTimeout(500);
    await generalDetails.sortBolId.click();
    await pendingValidationBOL.tableRow.click();
    await page.waitForTimeout(2000);
    await generalDetails.commitBtn.click();
    await expect(generalDetails.commitDialog).toHaveScreenshot(
      "validation-incomplete-dialog.png",
    );
    await generalDetails.closeBtn.click();
    await expect(page).toHaveScreenshot("status-remains-pending.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
  });

  test("Edit Illegible BOL to Validated status", async ({
    page,
    generalDetails,
    pendingValidationBOL,
  }) => {
    await page.goto("");
    await generalDetails.selectSite(ENV.siteName);
    await generalDetails.removeStatusFilter.click();
    await page.waitForTimeout(1000);
    await generalDetails.sortBolId.click();
    await page.waitForTimeout(500);
    await generalDetails.sortBolId.click();
    await pendingValidationBOL.tableRow.click();
    await page.waitForTimeout(2000);
    await generalDetails.illegibleBtn.nth(0).click();
    for (let i = 1; i <= 11; i++) {
      await generalDetails.validBtn.nth(i).click();
    }
    await generalDetails.illegibleBtn.nth(11).click();
    await generalDetails.commitBtn.click();
    await generalDetails.yesCommitBtn.click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("illegible-BOL3.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
    await generalDetails.editBtn.click();
    await generalDetails.validBtn.nth(12).click();
    await generalDetails.commitBtn.click();
    await generalDetails.yesCommitBtn.click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("validated-BOL3.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
  });

  test("Edit Validated BOL to Illegible status", async ({
    page,
    generalDetails,
    pendingValidationBOL,
  }) => {
    await page.goto("");
    await generalDetails.selectSite(ENV.siteName);
    await generalDetails.removeStatusFilter.click();
    await page.waitForTimeout(1000);
    await generalDetails.sortBolId.click();
    await page.waitForTimeout(500);
    await generalDetails.sortBolId.click();
    await pendingValidationBOL.tableRow.click();
    await page.waitForTimeout(2000);

    for (let i = 1; i <= 12; i++) {
      await generalDetails.validBtn.nth(i).click();
    }
    await generalDetails.commitBtn.click();
    await generalDetails.yesCommitBtn.click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("validated-BOL4.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
    await generalDetails.editBtn.click();
    await generalDetails.illegibleBtn.nth(1).click();
    await generalDetails.commitBtn.click();
    await generalDetails.yesCommitBtn.click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("illegible-BOL4.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
  });
});
