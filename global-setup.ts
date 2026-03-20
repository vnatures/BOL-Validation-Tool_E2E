import { chromium, FullConfig, expect } from "@playwright/test";
import fs from "fs/promises";
import { ENV } from "./config/env";

const users = [
  {
    name: "testUser",
    username: ENV.username!,
    pass: ENV.password!,
  },
];

async function globalSetup(_config: FullConfig) {
  await fs.mkdir(".auth", { recursive: true });
  const browser = await chromium.launch();

  for (const u of users) {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(ENV.baseUrl!);
    await page.getByRole("textbox", { name: "Username" }).fill(u.username);
    await page.getByRole("textbox", { name: "Password" }).fill(u.pass);
    await page.getByRole("button", { name: "Sign in" }).click();
    console.log(`Clicked login in for user: ${u.name}`);
    // Debug helper for troubleshooting login issues
    //await page.screenshot({ path: "debug-global-setup-login.png", fullPage: true });

    await expect(
      page.getByRole("heading", { name: "BOL Documents" })
    ).toBeVisible({
      timeout: 10000,
    });
    await page.waitForLoadState("domcontentloaded");
    const tokenCookie = (await context.cookies()).find(
      (c) => c.name === "csrftoken"
    );
    if (!tokenCookie)
      throw new Error(`Login failed for ${u.name}: no "token" cookie found`);

    await context.storageState({ path: `.auth/auth_${u.name}.json` });
    await context.close();
  }
  await browser.close();
}
export default globalSetup;
