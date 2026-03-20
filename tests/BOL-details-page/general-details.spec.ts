import { test, expect } from "../../fixtures/user.fixture";
import { ENV } from "../../config/env";

test.describe("General details of uploaded BOLs", () => {
  // Snapshots are based on BOL file from path BOLs/1page/ohio-00004.png
  // please make sure that the latest uploaded BOL is specifically that one
  // Note: different people use dev env so the state is not always the same
  test.use({ user: "testUser" });
  test.beforeEach(async ({ page, generalDetails, table }) => {
    await page.goto("");
    await generalDetails.selectSite(ENV.siteName);
    await table.pendingValidationBOL.click();
    await page.waitForTimeout(2000);
  });

  test("Empty fields state on a Pending validation BOL", async ({
    generalDetails,
  }) => {
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
    await expect(generalDetails.page).toHaveScreenshot(
      "critical-fields_BOL-details.png",
      {
        mask: [generalDetails.bolID, generalDetails.lastUpdatedDate],
        maskColor: "#e7c742",
      },
    );
  });

  test("Add new row to the table", async ({ generalDetails }) => {
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "table-initial.png",
    );
    await generalDetails.verticalDots.first().click();
    await expect(generalDetails.menuRowDropdown).toHaveScreenshot(
      "add-delete-row-dropdown.png",
    );
    await generalDetails.addRowAbove.click();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "new-row-above.png",
    );
    await generalDetails.verticalDots.nth(1).click();
    await generalDetails.addRowBelow.click();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "new-row-below.png",
    );
  });

  test("Delete row from the table", async ({ generalDetails }) => {
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "table-before-delete.png",
    );
    //delete first row from the table
    await generalDetails.verticalDots.first().click();
    await generalDetails.deleteRow.click();
    await expect(generalDetails.deleteRowDialog).toHaveScreenshot(
      "delete-row-dialog.png",
    );
    await generalDetails.deleteRowYesBtn.click();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "table-after-delete.png",
    );
    //cancel button - delete dialog
    await generalDetails.verticalDots.first().click();
    await generalDetails.deleteRow.click();
    await expect(generalDetails.deleteRowDialog).toHaveScreenshot(
      "delete-row-dialog.png",
    );
    await generalDetails.deleteRowCancelBtn.click();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "table-after-delete.png",
    );
    // X button - delete dialog
    await generalDetails.verticalDots.first().click();
    await generalDetails.deleteRow.click();
    await expect(generalDetails.deleteRowDialog).toHaveScreenshot(
      "delete-row-dialog.png",
    );
    await generalDetails.xBtn.click();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "table-after-delete.png",
    );
  });

  test("Ignore row feature", async ({ generalDetails, page }) => {
    // option under Kebab menu
    await expect(generalDetails.validBtn.nth(2)).toBeEnabled();
    await expect(generalDetails.illegibleBtn.nth(1)).toBeEnabled();
    await generalDetails.verticalDots.first().click();
    await expect(generalDetails.menuRowDropdown).toHaveScreenshot(
      "ignore-option-dropdown.png",
    );
    // ignored row design
    await generalDetails.ignoreRowBtn.click();
    await expect(generalDetails.toastMsg).toHaveScreenshot(
      "ignored-row-msg.png",
    );
    await expect(generalDetails.validBtn.nth(2)).toBeDisabled();
    await expect(generalDetails.illegibleBtn.nth(1)).toBeDisabled();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "ignored-row-in-table.png",
    );
    // unignore row
    await generalDetails.verticalDots.first().click();
    await generalDetails.ignoreRowBtn.click();
    await expect(generalDetails.validBtn.nth(2)).toBeEnabled();
    await expect(generalDetails.illegibleBtn.nth(1)).toBeEnabled();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "row-unignored-in-table.png",
    );
  });

  test("Valid/Illegible buttons for Fabricator and Load", async ({
    generalDetails,
    page,
  }) => {
    await page.goto(`/bol-validation?bolId=${ENV.pendingBolId}&siteId=${ENV.siteId}`);
    // user can toggle between Valid/Illegible when Fabricator and Load data is available
    await generalDetails.validBtn.nth(1).click();
    await expect(generalDetails.headerContainer).toHaveScreenshot(
      "valid-button1st.png",
    );
    await generalDetails.illegibleBtn.first().click();
    await expect(generalDetails.headerContainer).toHaveScreenshot(
      "illegible-button1st.png",
    );
    // empty critical data disables buttons
    await generalDetails.fabricatorInput.fill("");
    await expect(generalDetails.validBtn.nth(1)).toBeDisabled();
    await expect(generalDetails.illegibleBtn.first()).toBeEnabled();
    await expect(generalDetails.headerContainer).toHaveScreenshot(
      "fabricator-missing.png",
    );
    await generalDetails.fabricatorInput.fill("Ohio Structural Steel Inc.");
    await generalDetails.loadNumberInput.fill("");
    await expect(generalDetails.validBtn.nth(1)).toBeDisabled();
    await expect(generalDetails.illegibleBtn.first()).toBeEnabled();
    await expect(generalDetails.headerContainer).toHaveScreenshot(
      "load-missing.png",
    );
    // filling data back enables buttons
    await generalDetails.loadNumberInput.fill("00012");
    await expect(generalDetails.validBtn.nth(1)).toBeEnabled();
    await expect(generalDetails.illegibleBtn.first()).toBeEnabled();
    // empty non-critical data has buttons enabled
    await generalDetails.resetDateInput.click();
    await generalDetails.validBtn.nth(1).click();
    await expect(generalDetails.headerContainer).toHaveScreenshot(
      "date-empty.png",
    );
  });

  test("Valid/Illegible buttons functionality in the table", async ({
    generalDetails,
  }) => {
    // user can toggle between Valid/Illegible when critical data is available
    await generalDetails.validBtn.nth(2).click();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "valid-button2nd.png",
    );
    await generalDetails.illegibleBtn.nth(1).click();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "illegible-button2nd.png",
    );
    // empty critical data disables buttons
    await generalDetails.qty1Input.click();
    await generalDetails.input.fill("");
    await generalDetails.mark1Input.click();
    await expect(generalDetails.validBtn.nth(2)).toBeDisabled();
    await expect(generalDetails.illegibleBtn.nth(1)).toBeEnabled();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "qty-missing.png",
    );
    await generalDetails.qty1Input.click();
    await generalDetails.input.fill("1");
    await generalDetails.mark1Input.click();
    await generalDetails.input.fill("");
    await generalDetails.qty1Input.click();
    await expect(generalDetails.validBtn.nth(2)).toBeDisabled();
    await expect(generalDetails.illegibleBtn.nth(1)).toBeEnabled();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "mark-missing.png",
    );
    // filling data back enables buttons
    await generalDetails.mark1Input.click();
    await generalDetails.input.fill("34011");
    await generalDetails.qty1Input.click();
    await expect(generalDetails.validBtn.nth(2)).toBeEnabled();
    await expect(generalDetails.illegibleBtn.nth(1)).toBeEnabled();
    // empty non-critical data has buttons enabled
    await generalDetails.weight1Input.click();
    await generalDetails.input.fill("");
    await generalDetails.sequence1Input.click();
    await generalDetails.input.fill("");
    await generalDetails.validBtn.nth(2).click();
    await expect(generalDetails.tableContainer).toHaveScreenshot(
      "non-critical-empty.png",
    );
  });

  //add new no data BOL id here
  test("Validate No data scan", async ({ page }) => {
    await page.goto(`/bol-validation?bolId=${ENV.emptyBolId}&siteId=${ENV.siteId}`);
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("no-data-BOL.png");
    // no data BOLs have empty state in table, they can manually add data
  });

  test("Validate Note", async ({ generalDetails, page }) => {
    await page.goto(`/bol-validation?bolId=${ENV.pendingBolId}&siteId=${ENV.siteId}`);
    await expect(generalDetails.noteContainer).toHaveScreenshot(
      "note-container.png",
    );
    await generalDetails.noteContainer.click();
    await expect(generalDetails.noteDialog).toBeVisible();
    await expect(page).toHaveScreenshot("open-note-dialog.png", {
      mask: [generalDetails.bolID, generalDetails.lastUpdatedDate, generalDetails.lastUpdatedBy],
      maskColor: "#e7c742",
    });
  });

  test("Empty state - non existing BOL", async ({ page }) => {
    await page.goto(`/bol-validation?bolId=${ENV.nonexistingBolId}&siteId=${ENV.siteId}`);
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("empty-state_non-existing-BOL.png");
  });
});
