import { expect, Page } from "@playwright/test";
import { GeneralDetails } from "../pages/BOL-details-page/general-details.page";

export async function resetImageOrientation(
  page: Page,
  generalDetails: GeneralDetails,
) {
  for (let i = 0; i < 4; i++) {
    try {
      await page.waitForTimeout(2000);
      await expect(generalDetails.imageContainer).toHaveScreenshot(
        "non-rotated-image.png",
        {
          threshold: 0.3,
          timeout: 2000,
        },
      );
      return;
    } catch {
      await generalDetails.rotateBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  throw new Error("Could not reset image orientation");
}