// The buying FAQ quotes the app's purchase screen word for word, in every
// language (purchase-screen-words.md, the answer to mailbox Q6, 23 November 2026):
// the Encrypt file card, the store's product name, the whole Buy button with "…"
// where the app shows the price, and Restore purchase. Never a price, never
// square brackets, never the [PENDING-BUTTON] marker (Darren, 23 November 2026).
import { expect, test } from "@playwright/test";
import data from "../fixtures/purchase-words.json" with { type: "json" };
import { ui } from "../support/ui";

const words = data.words as Record<string, { encryptFile: string; buy: string; restore: string; product: string }>;

for (const [code, w] of Object.entries(words))
  test(`the buying FAQ quotes the app's purchase screen in ${code}`, async () => {
    const unlock = await ui(code, "faq.unlock.a");
    const restore = await ui(code, "faq.restorePurchase.a");
    for (const text of [unlock, restore]) {
      expect(text).not.toContain("PENDING");
      expect(text).not.toMatch(/[[\]]/);
      expect(text).not.toMatch(/[$€£¥₹]|\d[.,]\d\d/);
    }
    expect(unlock).toContain(w.encryptFile);
    expect(unlock).toContain(w.product);
    expect(unlock).toContain(w.buy);
    expect(restore).toContain(w.restore);
  });
