import { test, expect } from "../fixtures/user.fixture";
import { uploadDocumentImages, deleteBolDocument } from "../util/helper";
import { ENV } from "../config/env";
/**
 * These tests are intentionally skipped to avoid triggering API calls on every test run.
 *
 * Run only when you want to test upload/delete process, or in need of new BOLs uploaded - specific ones deleted.
 *
 * To execute these tests:
 * Remove the `.skip` annotation,
 * Add `.only` annotation to specific test you want to run,
 * If you want to run only this describe block, add `.only` to the describe itself.
 *
 * Note: Ensure appropriate environment variables and API credentials are set in .env file before enabling these tests.
 *
 * For Upload you will need:
 * - your user ID,
 * - siteID to which you want to upload BOL,
 * - correct filePath containing one or multiple files.
 *
 * For Delete you will need:
 * - siteID and userID
 * (last test in this file deletes all 4 prevously added BOLs - adjust if needed)
 * There is also swagger that can execute exact BOL deletion/upload
 */
test.describe.skip("Upload and delete BOLs", () => {
  test.use({ user: "testUser" });
  test.beforeEach(async ({ page }) => {
    await page.goto("");
  });

  test("Upload one BOL image", async ({ request }) => {
    const result = await uploadDocumentImages({
      request,
      siteId: ENV.siteId,
      uploadedBy: ENV.uploadedBy,
      filePaths: ["BOLs/1page/ohio-00004.png"],
      note: "Automated upload of 1 BOL",
    });
    expect(result.registerStatus).toBe(201);
  });

  test("Upload 3 BOL images", async ({ request }) => {
    const result = await uploadDocumentImages({
      request,
      siteId: ENV.siteId,
      uploadedBy: ENV.uploadedBy,
      filePaths: [
        "BOLs/3pages/ohio-00003-1.png",
        "BOLs/3pages/ohio-00003-2.png",
        "BOLs/3pages/ohio-00003-3.png",
      ],
      note: "Automated upload of 3 BOLs",
    });
    expect(result.registerStatus).toBe(201);
  });

  test("Upload 10 BOL images", async ({ request }) => {
    const result = await uploadDocumentImages({
      request,
      siteId: ENV.siteId,
      uploadedBy: ENV.uploadedBy,
      filePaths: [
        "BOLs/3pages/ohio-00003-1.png",
        "BOLs/3pages/ohio-00003-2.png",
        "BOLs/3pages/ohio-00003-2.png",
        "BOLs/3pages/ohio-00003-2.png",
        "BOLs/3pages/ohio-00003-2.png",
        "BOLs/3pages/ohio-00003-2.png",
        "BOLs/3pages/ohio-00003-2.png",
        "BOLs/3pages/ohio-00003-2.png",
        "BOLs/3pages/ohio-00003-2.png",
        "BOLs/3pages/ohio-00003-3.png",
      ],
      note: "Automated upload of 10 BOLs",
    });
    expect(result.registerStatus).toBe(201);
  });

  test("Upload no data BOL image", async ({ request }) => {
    const result = await uploadDocumentImages({
      request,
      siteId: ENV.siteId,
      uploadedBy: ENV.uploadedBy,
      filePaths: ["BOLs/noData/no-data-image.png"],
      note: "Automated upload of no data BOL",
    });
    expect(result.registerStatus).toBe(201);
  });

  test("Delete all recently uploaded BOLs", async ({
    request,
    page,
    generalDetails,
  }) => {
    let i = 1;
    for (i; i <= 4; i++) {
      await page.goto("");
      await generalDetails.selectSite(ENV.siteName);
      await generalDetails.removeStatusFilter.click();
      await generalDetails.sortBolId.dblclick();
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
    }
  });
});
