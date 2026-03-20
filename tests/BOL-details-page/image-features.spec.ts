import { test, expect } from "../../fixtures/user.fixture";
import { resetImageOrientation } from "../../util/ui-helper";
import { ENV } from "../../config/env";

test.describe("Details page - image features", () => {
  test.use({ user: "testUser" });
  test.beforeEach(async ({ page, generalDetails, table }) => {
    await page.goto("");
    await generalDetails.selectSite(ENV.siteName);
    await table.pendingValidationBOL.click();
    await page.waitForTimeout(2000);
  });

  test("Validate Guide feature", async ({ page, generalDetails }) => {
    // Reset image orientation to the default (upright) position
    await resetImageOrientation(page, generalDetails);
    // initial state - guide is on
    await expect(generalDetails.guideLine).toBeVisible();
    await expect(generalDetails.imageContainer).toHaveScreenshot(
      "guide-on.png",
      {
        threshold: 0.3,
      },
    );
    // user can toggle between guide on and off
    await generalDetails.guideToggle.click();
    await expect(generalDetails.guideLine).not.toBeVisible();
    await expect(generalDetails.imageContainer).toHaveScreenshot(
      "guide-off.png",
      {
        threshold: 0.3,
      },
    );
    // user can drag guide up and down
    await generalDetails.guideToggle.click();
    const box = await generalDetails.guideLine.boundingBox();
    if (!box) throw new Error("Guide not visible");
    // go to the center of the element
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // move from center down for 300px
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 300);
    await expect(generalDetails.imageContainer).toHaveScreenshot(
      "guideline-down.png",
      {
        threshold: 0.3,
      },
    );
    //move from center up for 300px
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 300);
    await expect(generalDetails.imageContainer).toHaveScreenshot(
      "guideline-up.png",
      {
        threshold: 0.3,
      },
    );
  });
  test("Validate Magnify feature", async ({ page, generalDetails }) => {
    // Reset image orientation to the default (upright) position 
    await resetImageOrientation(page, generalDetails);
    await generalDetails.magnifyBtn.click();
    // access coordinates of image container
    const box = await generalDetails.imageContainer.boundingBox();
    if (!box) throw new Error("No image container displayed");
    //position playwright cursor in the center
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(generalDetails.imageContainer).toHaveScreenshot(
      "magnify.png",
      {
        threshold: 0.3,
      },
    );
  });
  test("Validate Rotate feature", async ({ page, generalDetails }) => {
    // Reset image orientation to the default (upright) position 
    await resetImageOrientation(page, generalDetails);
    //initial state
    await expect(generalDetails.imageContainer).toHaveScreenshot(
      "non-rotated-image.png",
      {
        threshold: 0.3,
      },
    );
    await generalDetails.rotateBtn.click();
    await expect(generalDetails.toastMsg).toHaveScreenshot(
      "success-rotate.png",
    );
    //waiting for image to rotate
    await page.waitForTimeout(2000);
    await expect(generalDetails.imageContainer).toHaveScreenshot(
      "rotated-image.png",
      {
        threshold: 0.3,
      },
    );
    // BUG: rotate is saved even when user does not explicitly save it on 'Save' button
    // that's why we need to reset the orientation it to initial position
    await resetImageOrientation(page, generalDetails);
    await expect(generalDetails.imageContainer).toHaveScreenshot(
      "non-rotated-image.png",
      {
        threshold: 0.3,
      },
    );
  });
  test("Validate Zoom in/out feature", async ({ page, generalDetails }) => {
    // Reset image orientation to the default (upright) position 
    await resetImageOrientation(page, generalDetails);
    //initial state
    await generalDetails.zoomInBtn.dblclick();
    await expect(generalDetails.imageContainer).toHaveScreenshot(
      "zoomed-in-image.png",
      {
        threshold: 0.3,
      },
    );
    await generalDetails.zoomOutBtn.dblclick();
    await generalDetails.zoomOutBtn.dblclick();
    await expect(generalDetails.imageContainer).toHaveScreenshot(
      "zoomed-out-image.png",
      {
        threshold: 0.3,
      },
    );
  });
});
