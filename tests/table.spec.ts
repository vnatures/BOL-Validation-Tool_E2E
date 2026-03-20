import { test, expect } from "../fixtures/user.fixture";
// TBD - create a test plan with test cases that will be automated
test.describe("BOL Table", () => {
  test.use({ user: "testUser" });
  test.beforeEach(async ({ page }) => {
    await page.goto("");
  });
  //BOLs in status pending validation are prefiltered in ascending order
  test("Verify initial state of the table", async ({ page, table }) => {});
});
