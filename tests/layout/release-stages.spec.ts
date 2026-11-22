// The built site shows each launch stage only once its data says so
// (src/data/release.json, tests/checks/release-stages.spec.ts): before a stage,
// nothing of it is on any page, and after it, all of it is.
import { expect, test } from "../support/browser";
import release from "../../src/data/release.json" with { type: "json" };
import { pricingSplit } from "../../src/data/pricing";
import { platforms } from "../../src/data/stores";
import { gated } from "../../src/i18n/gated";
import { reached, uiNow } from "../support/release";

// 3.0 is live: every store on sale sells it, and Android is on sale
const v3 = () => reached("all3") && reached("android");

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
  // The owner's Android restore line (mailbox Q5): a new Android phone starts empty
  await page.goto("/support/");
  expect((await page.locator("main").textContent())!.includes("On Android, a new phone starts empty"), "Android restore line").toBe(on);
  await page.goto("/roadmap/");
  // From 3.0, Android is a line in the Doughnut Forge 3.0 entry instead (roadmap.md)
  await expect(page.locator(`[data-roadmap="${on ? "shipped" : "next"}"] h3`, { hasText: "Doughnut Forge for Android" })).toHaveCount(v3() ? 0 : 1);
});

// Encrypting text and sharing it through the share sheet shipped on Android in
// 3.0.0 (owner, 19 November 2026), so the lines that say files and text can be
// shared name Android only once it is on sale
test("Android stage: the lines about sharing files and text name Android", async ({ page }) => {
  const on = reached("android");
  const description = page.locator('meta[name="description"]');
  for (const [path, keys] of [
    ["/", ["meta.home.description", "home.lead", "home.what.text"]],
    ["/features/", ["meta.features.description", "features.lead"]],
  ] as const) {
    await page.goto(path);
    const main = (await page.locator("main").textContent())!.replace(/\s+/g, " ");
    const meta = (await description.getAttribute("content"))!;
    for (const key of keys) {
      const text = await uiNow("en", key);
      expect(text.includes("Android"), key).toBe(on);
      expect(key.startsWith("meta.") ? meta : main, key).toContain(text);
    }
  }
  await page.goto("/blog/share-encrypted-files/");
  const cta = await uiNow("en", "blog.cta.text");
  expect(cta.includes("Android"), "blog.cta.text").toBe(on);
  await expect(page.locator("main")).toContainText(cta);
});

test("first 3.0 store: the FAQs on new contact codes and older apps", async ({ page }) => {
  const on = reached("first3");
  await page.goto("/support/");
  for (const question of ["Why did my contact code change?", "Why can someone not open a file I sent?"]) {
    await expect(page.locator("main summary", { hasText: question }), question).toHaveCount(on ? 1 : 0);
  }
  const data = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(data.includes("Why did my contact code change?"), "FAQPage data").toBe(on);
  // Older files: every .vlt2 file still opens in 3.0 (it no longer reads .vlt1, which the site never names)
  await page.goto("/security/technical-details/");
  const technical = await page.locator("main").innerText();
  expect(technical.includes("Every .vlt2 file made by an earlier version still opens"), "older files line").toBe(on);
  expect(technical).not.toContain(".vlt1");
});

test("every store has 3.0: the new format's copy and the white paper", async ({ page }) => {
  const on = reached("all3");
  await page.goto("/security/technical-details/");
  const technical = await page.locator("main").innerText();
  expect(technical.includes("ML-DSA-87"), "ML-DSA-87").toBe(on);
  expect(technical.includes("256 MiB"), "Argon2id 256 MiB").toBe(on);
  // The exact count of old-card recipients, and no forward secrecy (white paper 4.3, 8.2)
  expect(technical.includes("known only by an old contact card shows exactly"), "old-card count").toBe(on);
  expect(technical.includes("Anyone who later gets your recovery words."), "forward secrecy limit").toBe(on);
  await page.goto("/security/");
  await expect(page.locator("main")).toContainText(await uiNow("en", "security.quantum.title"));
  // The owner's stage-3 headline (20 November 2026), never "Post-quantum encryption and signatures"
  expect((await uiNow("en", "security.quantum.title")).includes("protection designed for the quantum age")).toBe(on);
  expect(await uiNow("en", "security.quantum.title")).not.toMatch(/encryption and signatures/i);
  // The white paper: its page, its PDF and every link to it
  await expect(page.locator('a[href="/security/white-paper/"]')).toHaveCount(on ? 2 : 0);
  for (const path of ["/security/white-paper/", "/security/white-paper/doughnut-forge-white-paper-en.pdf"]) {
    expect((await page.request.get(path)).status(), path).toBe(on ? 200 : 404);
  }
  await page.goto("/roadmap/");
  await expect(page.locator('[data-roadmap="shipped"] h3', { hasText: "A new file format" })).toHaveCount(on && !v3() ? 1 : 0);
});

// The roadmap from roadmap.md (v2, approved by Darren 21 November 2026), once 3.0
// is live: every store sells 3.0 and Android is on sale. Its lines word for word,
// the next items in their order, no "Smaller improvements"; the security audit
// stays under Later (parked for Darren, 22 November 2026).
test("3.0 live: the roadmap from roadmap.md", async ({ page }) => {
  const on = v3();
  await page.goto("/roadmap/");
  const shipped = page.locator('[data-roadmap="shipped"] > .items > li', { has: page.locator("h3", { hasText: /^Doughnut Forge 3\.0$/ }) });
  await expect(shipped).toHaveCount(on ? 1 : 0);
  await expect(page.locator('[data-roadmap="next"] h2')).toHaveText(on ? "Next, in this order" : "Next");
  const next = await page.locator('[data-roadmap="next"] h3').allInnerTexts();
  await expect(page.locator('[data-roadmap="later"] h3', { hasText: "Independent security audit" })).toHaveCount(1);
  if (!on) {
    expect(next).toContain("Smaller improvements");
    return;
  }
  await expect(shipped.locator(".points li")).toHaveText([
    "Doughnut Forge is now on Android, as well as iPhone, iPad, Mac and Windows.",
    "On iPhone, iPad and Android, Doughnut Forge is free to download and use, including text encryption and opening anything sent to you. Encrypting files, photos and videos is a one-time purchase.",
    "Files made with this version use post-quantum encryption and signatures.",
    "When a contact sends you a file made with this version, and their contact card is up to date, you see their name when you open it.",
    "Who sent a file is sealed inside it: only the people who can open the file can see it.",
    "Contact cards have a new version. Ask your contacts to share their card with you again, and share your new card with them.",
    "Everyone you share files with needs Doughnut Forge 3.0 or later to open them. Older files still open as before.",
  ]);
  expect(next).toEqual(["A terminal tool for Linux and Mac", "Right-to-left languages: Arabic and Hebrew first, then Urdu and Persian"]);
  // Shown in order, as a numbered list
  await expect(page.locator('[data-roadmap="next"] ol.items')).toHaveCount(1);
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
  const cryptomator = await text("/blog/doughnut-forge-vs-cryptomator/");
  expect(cryptomator.includes("Each new file is also signed by the person who made it"), "signatures").toBe(reached("all3"));
  // Never the withdrawn opening "post-quantum encryption and signatures" (owner, 20 November 2026)
  expect(cryptomator, "withdrawn wording").not.toContain("post-quantum encryption and signatures");
  // Copy sweep A1-4: from Android, Cryptomator is no longer the choice for Android users
  expect(cryptomator.includes("You use Linux or Android."), "Linux or Android").toBe(!reached("android"));
  // Copy sweep A1-3 and A1-8: Android named only from its stage; the forged-card line follows 3.0
  expect((await text("/blog/protect-personal-files-from-data-breaches/")).includes("Android phone"), "breaches post Android").toBe(reached("android"));
  expect((await text("/blog/share-encrypted-files/")).includes("the app refuses it"), "refuses").toBe(!reached("first3"));
});

// From 3.0.0 the phone and tablet apps are free to download and use, and
// encrypting files, photos and videos is a one-time purchase; Mac and Windows are
// paid apps, bought once in their stores (pricing-and-unlock.md v2, Darren
// 21 November 2026). Each card follows its own store; the site-wide lines switch
// at the mobile pricing stage.
test("mobile pricing stage: each card says how that platform is bought", async ({ page }) => {
  const { free, paid } = pricingSplit(platforms, release.storesWith3);
  await page.goto("/pricing/");
  for (const id of free) {
    await expect(page.locator(`.card[data-platform="${id}"] .status`), id).toHaveText(
      `Free to download and use from ${id === "android" ? "Google Play" : "the App Store"}, with a one-time purchase to encrypt files, photos and videos`,
    );
  }
  for (const id of paid) await expect(page.locator(`.card[data-platform="${id}"] .status`), id).toHaveText(/^One-time purchase from /);
});

test("mobile pricing stage: the site-wide price lines, the buying FAQ and the privacy line", async ({ page }) => {
  const on = reached("mobileFree");
  await page.goto("/pricing/");
  await expect(page.locator("h1")).toHaveText(on ? "No subscription." : "One-time purchase, never a subscription.");
  await page.goto("/support/");
  const questions = await page.locator("#faq summary, #faq h3").allInnerTexts();
  const asked = (q: string) => questions.some((text) => text.includes(q));
  expect(asked("What is the in-app purchase for?"), "purchase FAQ").toBe(on);
  expect(asked("What happens if my purchase is refunded?"), "refund FAQ").toBe(on);
  expect(asked("How do I encrypt files on my other devices?"), "restore FAQ").toBe(on);
  expect(asked("Does buying change on Mac or Windows?"), "desktop FAQ").toBe(on);
  // No iOS sales before 3.0, so no answer for earlier buyers, at any stage (owner, 22 November 2026)
  expect(asked("I bought Doughnut Forge for iPhone or iPad before"), "earlier buyers FAQ").toBe(false);
  const support = (await page.locator("main").textContent()) ?? "";
  expect(support, "earlier buyers answer").not.toMatch(/you keep everything|nothing to buy or restore/i);
  await page.goto("/privacy/");
  expect((await page.locator("main").innerText()).includes("Apple or Google keeps a record of the purchase"), "privacy purchase line").toBe(on);
});

// The copy style guide (copy-style.md v2): the free phrase word for word, after
// the free platforms, and Mac and Windows as paid apps, bought once in their stores.
// Never "unlock" for the purchase, and never "paid once" beside "one-time".
test("mobile pricing stage: the free phrase and the paid apps, in the guide's words", async ({ page }) => {
  test.skip(!reached("mobileFree"), "phones are not free yet");
  const { free } = pricingSplit(platforms, release.storesWith3);
  const devices = free.flatMap((id) => (id === "ios" ? ["iPhone", "iPad"] : ["Android"]));
  const on = `On ${devices.length > 2 ? `${devices.slice(0, -1).join(", ")} and ${devices.at(-1)}` : devices.join(" and ")}, Doughnut Forge is free to download and use, including text encryption and opening anything sent to you. Encrypting files, photos and videos is a one-time purchase.`;
  for (const path of ["/pricing/", "/support/", "/press/"]) {
    await page.goto(path);
    // textContent: the FAQ answers sit in closed <details>
    const main = ((await page.locator("main").textContent()) ?? "").replace(/\s+/g, " ");
    expect(main, path).toContain(on);
    expect(main, path).toContain("Mac and Windows are paid apps, bought once in");
    expect(main, path).not.toMatch(/\bunlock\w*[^.]*\b(?:purchase|buy)|\b(?:purchase|buy)\w*[^.]*\bunlock/i);
    expect(main, path).not.toContain("paid once");
  }
});

// The price lines carry {free}, {paid}, {stores} and {store} slots; every page that
// shows one fills them (the features FAQ showed "On {free}," at the mobile pricing stage)
test("no page shows an unfilled pricing slot", async ({ page }) => {
  for (const path of ["/", "/features/", "/pricing/", "/download/", "/support/", "/press/", "/de/features/", "/ja/features/"]) {
    await page.goto(path);
    const text = `${await page.title()}\n${(await page.locator("body").textContent()) ?? ""}`;
    expect(text, path).not.toMatch(/\{(?:free|paid|stores|store)\}/);
  }
});

// A store is named only once it sells the app: with only the App Store selling
// 3.0, the buying answers name no Google Play account (copy sweep A2-7)
test("mobile pricing stage: Google Play is named only once Android is on sale", async ({ page }) => {
  for (const path of ["/pricing/", "/support/"]) {
    await page.goto(path);
    if (!reached("android")) expect(await page.locator("main").innerText(), path).not.toContain("Google Play");
  }
});

// Buying goes through Apple and Google, so the at-a-glance network tile waits with
// the network paragraph for the final white paper (copy sweep A2-11)
test("mobile pricing stage: the network tile is held with the network paragraph", async ({ page }) => {
  const stages = gated as Record<string, string>;
  expect(stages["technical.glance.network"]).toBe(stages["technical.network.none"]);
  await page.goto("/security/technical-details/");
  expect((await page.locator("main").innerText()).includes("No network connections of its own")).toBe(true);
});

test("no English page says pay once, or that every platform is a one-time purchase, once phones are free", async ({ page }) => {
  const posts = ["can-whatsapp-read-my-messages", "doughnut-forge-vs-cryptomator", "doughnut-forge-vs-veracrypt", "encrypt-files-on-mac-without-cloud", "harvest-now-decrypt-later", "protect-personal-files-from-data-breaches"];
  for (const path of ["/", "/pricing/", "/download/", "/features/", "/support/", "/press/", ...posts.map((p) => `/blog/${p}/`)]) {
    await page.goto(path);
    const text = `${await page.title()}\n${await page.locator("body").innerText()}`;
    expect(text, path).not.toMatch(/\bpay once\b|the app is yours/i);
    if (reached("mobileFree")) expect(text, path).not.toMatch(/one-time purchase on each platform|for each platform you use|separate purchase from its own store\. Buying on iPhone/i);
  }
});

// From the first store with 3.0, the home page's v2 section and the features
// page's closing line no longer say "New in Doughnut Forge 2" or list only
// the v2 platforms (copy sweep A2-18; owner, 21 November 2026)
test("first 3.0 store: no \"New in Doughnut Forge 2\", and the features closing line follows", async ({ page }) => {
  const on = reached("first3");
  await page.goto("/");
  expect((await page.locator("#home-phones").innerText()).includes("New in Doughnut Forge 2"), "home v2 title").toBe(!on);
  await page.goto("/features/");
  const cta = await page.locator("section.cta .section-text").innerText();
  expect(cta.includes(await uiNow("en", on ? "features.cta.text" : "home.phones.text")), "features closing line").toBe(true);
  expect(cta.includes("A new look, an easier start"), "v2 line in the closing line").toBe(!on);
});
