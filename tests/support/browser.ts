// The test every browser test uses: Playwright's own, with every browser context
// kept away from the real stores (no-stores.ts).
import { test as base } from "@playwright/test";
import { keepStoresClosed } from "./no-stores";

export { expect } from "@playwright/test";

export const test = base.extend({
  context: async ({ context }, use) => {
    await keepStoresClosed(context);
    await use(context);
  },
});
