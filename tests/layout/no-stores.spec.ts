// The guard every browser test runs under (support/no-stores.ts): no test opens a
// real store or hands a store address to the Mac.
import { readFileSync } from "node:fs";
import { expect, test } from "../support/browser";
import { dist } from "../support/site";
import { standIn } from "../support/no-stores";

const STORE_LINKS = ["https://apps.apple.com/app/id6821344597", "https://apps.apple.com/app/id6812778888", "https://apps.microsoft.com/detail/"];

test("a click on a store badge stays on the page and opens nothing", async ({ context, page }) => {
  await page.goto("/download/");
  for (const href of STORE_LINKS) {
    await page.locator(`a[href^="${href}"]`).first().click();
    await page.waitForTimeout(300);
    expect(page.url(), href).toMatch(/\/download\/$/);
    expect(context.pages(), href).toHaveLength(1);
  }
});

test("a link with a store's own scheme is not followed", async ({ context, page }) => {
  await page.goto("/");
  for (const href of ["itms-apps://apps.apple.com/app/id6821344597", "macappstore://apps.apple.com/app/id6812778888", "ms-windows-store://pdp/?productid=9P25BS9L8LNB"]) {
    await page.evaluate((h) => {
      const a = Object.assign(document.createElement("a"), { href: h, textContent: "store" });
      document.body.append(a);
      a.click();
      a.remove();
    }, href);
    await page.waitForTimeout(300);
    expect(page.url(), href).toMatch(/\/$/);
    expect(context.pages(), href).toHaveLength(1);
  }
});

test("a /go/ page forwards to a stand-in that keeps the store's exact address", async ({ page }) => {
  const [go] = readFileSync(`${dist}/download/index.html`, "utf8").match(/\/go\/\w+\/en\//) ?? [];
  const html = readFileSync(`${dist}${go}index.html`, "utf8");
  const store = /http-equiv="refresh" content="0; url=([^"]+)"/.exec(html)![1]!.replaceAll("&amp;", "&");
  await page.goto(go!);
  await page.waitForURL(standIn(store));
  expect(page.url()).toBe(standIn(store));
});
