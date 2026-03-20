import { Page, Locator, expect } from "@playwright/test";
import { ENV } from "../../config/env";

export class GeneralDetails {
  readonly page: Page;
  readonly siteName: Locator;
  readonly BOLHeader: Locator;
  readonly image: Locator;
  readonly removeStatusFilter: Locator;
  readonly sortBolId: Locator;
  readonly sortScanningTimeBtn: Locator;
  // BOL details input fields
  readonly fabricatorInput: Locator;
  readonly loadNumberInput: Locator;
  readonly deleteDateBtn: Locator;
  readonly qty1Input: Locator;
  readonly mark1Input: Locator;
  readonly weight1Input: Locator;
  readonly sequence1Input: Locator;
  readonly input: Locator;
  // load and fabricator header
  readonly headerContainer: Locator;
  readonly resetDateInput: Locator;
  //table items
  readonly tableContainer: Locator;
  readonly verticalDots: Locator;
  readonly menuRowDropdown: Locator;
  readonly addRowAbove: Locator;
  readonly addRowBelow: Locator;
  readonly deleteRow: Locator;
  readonly deleteRowDialog: Locator;
  readonly deleteRowCancelBtn: Locator;
  readonly deleteRowYesBtn: Locator;
  readonly xBtn: Locator;
  readonly ignoreRowBtn: Locator;
  // generate link
  readonly generateLinkBtn: Locator;
  readonly viewLink: Locator;
  readonly linkForAppContainer: Locator;
  readonly linkForApp: Locator;
  readonly closeBtn: Locator;
  readonly toastMsg: Locator;
  //toggle valid/invalid
  readonly validBtn: Locator;
  readonly illegibleBtn: Locator;
  //image features
  readonly guideToggle: Locator;
  readonly guideLine: Locator;
  readonly magnifyBtn: Locator;
  readonly rotateBtn: Locator;
  readonly zoomInBtn: Locator;
  readonly zoomOutBtn: Locator;
  readonly imageContainer: Locator;
  //note
  readonly noteContainer: Locator;
  readonly noteDialog: Locator;
  // elements for masking
  readonly bolID: Locator;
  readonly lastUpdatedDate: Locator;
  readonly lastUpdatedBy: Locator;
  //action buttons
  readonly saveBtn: Locator;
  readonly commitBtn: Locator;
  readonly commitDialog: Locator;
  readonly cancelBtn: Locator;
  readonly yesCommitBtn: Locator;
  readonly editBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.siteName = page.getByRole("textbox", { name: "Site name" });
    this.BOLHeader = page.getByRole("heading", { name: "BOL #" });
    this.image = page.locator("img").nth(1);
    this.removeStatusFilter = page.locator("button").nth(2);
    this.sortBolId = page
      .locator("div.mantine-datatable-header-cell-sortable-group")
      .first();
    this.sortScanningTimeBtn = page
      .locator(".mantine-datatable-header-cell-sortable")
      .nth(3);
    // BOL details input fields
    this.fabricatorInput = page
      .locator("input.mantine-TextInput-input")
      .first();
    this.loadNumberInput = page.locator("input.mantine-TextInput-input").nth(1);
    this.deleteDateBtn = page
      .locator("button.mantine-UnstyledButton-root")
      .nth(3);
    this.qty1Input = page.locator("td.mantine-Table-td > div").nth(0);
    this.mark1Input = page.locator("td.mantine-Table-td > div").nth(1);
    this.weight1Input = page.locator("td.mantine-Table-td > div").nth(2);
    this.sequence1Input = page.locator("td.mantine-Table-td > div").nth(3);
    this.input = page.locator("input.mantine-Input-input").nth(2);
    // fabricator and load container
    this.headerContainer = page.locator("div.mantine-Group-root").nth(6);
    this.resetDateInput = page
      .locator("form")
      .getByRole("button")
      .filter({ hasText: /^$/ });
    //table items
    this.verticalDots = page.locator(
      "span.mantine-ActionIcon-icon > svg.tabler-icon-dots-vertical",
    );
    this.menuRowDropdown = page.locator("div.mantine-Menu-dropdown");
    this.addRowAbove = page.getByRole("menuitem", { name: "Add row above" });
    this.addRowBelow = page.getByRole("menuitem", { name: "Add row below" });
    this.deleteRow = page.getByRole("menuitem", { name: "Delete row" });
    this.tableContainer = page.locator("div.mantine-datatable-scroll-area");
    this.deleteRowDialog = page.getByRole("dialog", {
      name: "Delete this row?",
    });
    this.deleteRowCancelBtn = page.getByRole("button", {
      name: "No, cancel",
    });
    this.deleteRowYesBtn = page.getByRole("button", { name: "Yes, delete" });
    this.xBtn = page
      .locator('button.mantine-focus-auto > svg[viewBox="0 0 15 15"]')
      .nth(1);
    this.ignoreRowBtn = page.locator("button.mantine-Menu-item").nth(2);
    //generate link
    this.generateLinkBtn = page.getByRole("button", { name: "Generate Link" });
    this.viewLink = page.getByText("View link").nth(1);
    this.linkForAppContainer = page.getByRole("dialog", {
      name: "Link for Versatile app",
    });
    this.linkForApp = page
      .locator("a.mantine-Text-root.mantine-Anchor-root")
      .nth(1);
    this.closeBtn = page.getByRole("button", { name: "Close" });
    this.toastMsg = page
      .locator("div.mantine-Notifications-notification")
      .first();
    this.validBtn = page.locator("label").filter({ hasText: "Valid" });
    this.illegibleBtn = page.locator("label").filter({ hasText: "Illegible" });
    //Image features
    this.guideToggle = page.locator("span.mantine-Switch-track");
    this.guideLine = page.getByRole("slider");
    this.magnifyBtn = page.getByRole("button").filter({ hasText: /^$/ }).nth(4);
    this.rotateBtn = page.getByRole("button").filter({ hasText: /^$/ }).nth(5);
    this.zoomInBtn = page.locator("div:nth-child(4) > button").first();
    this.zoomOutBtn = page.locator("div:nth-child(4) > button:nth-child(3)");
    this.imageContainer = page.locator("div.mantine-ScrollArea-root").first();
    //note
    this.noteContainer = page.locator(
      'div.mantine-Stack-root[aria-haspopup="dialog"]',
    );
    this.noteDialog = page.locator('div[role="dialog"]');
    // elements for masking
    this.bolID = page.locator("h3.mantine-Title-root");
    this.lastUpdatedDate = page.locator('p:has-text("Last updated at:") + p');
    this.lastUpdatedBy = page.locator('p:has-text("by:") + p');
    // action buttons
    this.saveBtn = page.getByRole("button", { name: "Save" });
    this.commitBtn = page.getByRole("button", { name: "Commit" });
    this.commitDialog = page.getByRole("dialog");
    this.cancelBtn = page.getByRole("button", { name: "No, go back" });
    this.yesCommitBtn = page.getByRole("button", { name: "Yes, commit" });
    this.editBtn = page.getByRole("button", { name: "Edit" });
  }
  // make sure to provide exact string to this method
  async selectSite(siteName: any) {
    (await this.siteName.fill(siteName),
      await this.page.getByRole("option", { name: `${siteName}`, exact: true }).click());
    await expect(
      this.page.locator(`input[value='${siteName}']`).first()
    ).toBeVisible();
  }
}
