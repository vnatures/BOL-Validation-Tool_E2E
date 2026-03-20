import { test as base } from "../fixtures/base.fixture";

export type User = "testUser";

export const test = base.extend<{ user: User | undefined }>({
  user: [undefined, { option: true }],
  // Overriding Playwright’s inbuilt storageState fixture
  storageState: async ({ user }, use) => {
    const file = user ? `.auth/auth_${user}.json` : undefined;
    await use(file);
  },
});
export { expect } from "@playwright/test";
