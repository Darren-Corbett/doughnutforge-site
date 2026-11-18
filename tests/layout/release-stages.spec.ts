// The built site shows each launch stage only once its data says so
// (src/data/release.json, tests/checks/release-stages.spec.ts): before a stage,
// nothing of it is on any page, and after it, all of it is.
import { expect, test } from "../support/browser";
import { reached, uiNow } from "../support/release";

const PLAY = 'a[href^="https://play.google.com/store/apps/details?id=com.darrencorbett.doughnutforge.mobile&hl="]';

test("Android stage: the Play badge and Android in the platform lists", async ({ page }) => {
  const on = reached("android");
  await page.goto("/download/");
  await expect(page.locator(`.card[data-platform="android"] ${PLAY}`)).toHaveCount(on ? 1 : 0);
  await page.goto("/");
  await expect(page.locator("main")).toContainText(await uiNow("en", "home.summary"));
  expect((await uiNow("en", "home.summary")).includes("Android")).toBe(on);
  await page.goto("/security/technical-details/");
  expect((await page.locator("main").innerText()).includes("fingerprint or face unlock"), "Android unlock row").toBe(on);
  await page.goto("/roadmap/");
  await expect(page.locator(`[data-roadmap="${on ? "shipped" : "next"}"] h3`, { hasText: "Doughnut Forge for Android" })).toHaveCount(1);
});

test("first 3.0 store: the FAQs on new contact codes and older apps", async ({ page }) => {
  const on = reached("first3");
  await page.goto("/support/");
  for (const question of ["Why did my contact code change?", "Why can someone not open a file I sent?"]) {
    await expect(page.locator("main summary", { hasText: question }), question).toHaveCount(on ? 1 : 0);
  }
  const data = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(data.includes("Why did my contact code change?"), "FAQPage data").toBe(on);
});

test("every store has 3.0: the new format's copy and the white paper", async ({ page }) => {
  const on = reached("all3");
  await page.goto("/security/technical-details/");
  const technical = await page.locator("main").innerText();
  expect(technical.includes("ML-DSA-87"), "ML-DSA-87").toBe(on);
  expect(technical.includes("256 MiB"), "Argon2id 256 MiB").toBe(on);
  await page.goto("/security/");
  await expect(page.locator("main")).toContainText(await uiNow("en", "security.quantum.title"));
  expect((await uiNow("en", "security.quantum.title")).includes("signatures")).toBe(on);
  // The white paper: its page, its PDF and every link to it
  await expect(page.locator('a[href="/security/white-paper/"]')).toHaveCount(on ? 2 : 0);
  for (const path of ["/security/white-paper/", "/security/white-paper/doughnut-forge-white-paper-en.pdf"]) {
    expect((await page.request.get(path)).status(), path).toBe(on ? 200 : 404);
  }
  await page.goto("/roadmap/");
  await expect(page.locator('[data-roadmap="shipped"] h3', { hasText: "A new file format" })).toHaveCount(on ? 1 : 0);
});

// Other languages keep their own earlier text, not the English
test("a gated string keeps its earlier text in German", async ({ page }) => {
  await page.goto("/de/security/");
  await expect(page.locator("main")).toContainText(await uiNow("de", "security.quantum.title"));
  await page.goto("/de/security/technical-details/");
  await expect(page.locator("main")).toContainText(await uiNow("de", "technical.stored.memory.text"));
});

// Posts follow the stages too (src/components/blog/Stage.astro)
test("posts: Android, the old-card line and post-quantum signatures follow their stages", async ({ page }) => {
  const text = async (path: string) => {
    await page.goto(path);
    return page.locator("main").innerText();
  };
  expect((await text("/blog/harvest-now-decrypt-later/")).includes("iPhone and iPad, Android, Mac and Windows"), "Android").toBe(reached("android"));
  const share = await text("/blog/share-encrypted-files/");
  expect(share.includes("Old card: ask for a new one"), "old card").toBe(reached("first3"));
  // The unknown-sender warning as each version shows it: 3.0's two lines once every store sells it
  expect(share.includes("The sender is not in your Contacts, or their contact card is out of date."), "3.0 warning").toBe(reached("all3"));
  expect(share.includes("Sender not shown"), "older files").toBe(reached("all3"));
  expect(share.includes("Encrypted by someone not in your Contacts"), "2.0 warning").toBe(!reached("all3"));
  expect((await text("/blog/doughnut-forge-vs-cryptomator/")).includes("post-quantum encryption and signatures"), "signatures").toBe(reached("all3"));
});
