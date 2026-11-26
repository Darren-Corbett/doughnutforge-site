// The owner's picks of 24 November 2026 (REVIEW.md item 28), in every language:
// each download card holds one requirement line (the WebView advice moves to its
// own Support answer); Home gets the approved free sentence, cut after "and use";
// and the older-versions answer no longer ties the .vlt2 name to earlier versions,
// since 3.0 files end in .vlt2 too.
import { expect, test } from "@playwright/test";
import languageData from "../../src/i18n/languages.json" with { type: "json" };
import { gated } from "../../src/i18n/gated";

const codes = languageData.languages.map((l) => l.code);
const strings = async (code: string): Promise<Record<string, string>> => (await import(`../../src/i18n/ui/${code}.ts`)).default;

test("the English lines are the approved words", async () => {
  const en = await strings("en");
  expect(en["download.requires.ios"]).toBe("Needs iOS or iPadOS 17 or later.");
  expect(en["roadmap.then"]).toBe("Then");
  // The audit line once the roadmap lists the review as 3.2: "planned", no longer "planned next" (owner, 25 November 2026)
  expect(en["security.audit.text"]).toBe("Doughnut Forge has not had an independent security audit. A full security review is planned.");
  expect(en["download.requires.android"]).toBe("Needs Android 10 or later.");
  expect(en["home.freeLine"]).toBe("On {free}, Doughnut Forge is free to download and use.");
  expect(en["faq.webview.q"]).toBe("The app asks me to update Android System WebView");
  expect(en["faq.webview.a"]).toBe(
    "Doughnut Forge uses Android System WebView, a free part of Android, to show its screens, and needs version 111 or later. If the phone's WebView is older, the app shows only a screen asking you to update it. Update Android System WebView from Google Play, then open Doughnut Forge again.",
  );
  expect(en["roadmap.format.text"]).toBe(
    "Every new file is signed by the person who made it, in a way designed to resist future quantum computers. The app names a contact as the sender only when the file is signed with the keys on that contact's new card. Every file made with an earlier version still opens.",
  );
  expect(en["faq.older.a"]).toBe(
    "Files and contact cards made with the latest version of Doughnut Forge do not open in older versions. Ask them to update the app once the update reaches their store. Every file made with an earlier version still opens in the latest one.",
  );
});

for (const code of codes) {
  test(`${code}: the new lines are there, and the old ties are gone`, async () => {
    const s = await strings(code);
    for (const key of ["download.requires.ios", "download.requires.android", "home.freeLine", "faq.webview.q", "faq.webview.a"]) {
      expect(s[key]?.trim(), key).toBeTruthy();
    }
    expect(s["home.freeLine"], "home.freeLine keeps its slot").toContain("{free}");
    expect(s["download.requires.android"], "the card has no WebView advice").not.toContain("WebView");
    expect(s["faq.webview.a"], "the answer names the update").toContain("Android System WebView");
    expect(s["faq.older.a"], "no .vlt2 in the older-versions answer").not.toContain(".vlt2");
    expect(s["roadmap.format.text"], "no .vlt2 in the roadmap's format entry").not.toContain(".vlt2");
    // The roadmap's "Then" heading (owner, 25 November 2026): its own word, not "Next" or "Later"
    expect(s["roadmap.then"]?.trim(), "roadmap.then").toBeTruthy();
    expect(s["roadmap.then"]).not.toBe(s["roadmap.next"]);
    expect(s["roadmap.then"]).not.toBe(s["roadmap.later"]);
    expect(s["roadmap.v32.title"], "roadmap.v32.title").toBe("Doughnut Forge 3.2");
  });
}

test("the free line waits for a phone store with 3.0, and the WebView answer for Android", () => {
  const stage: Record<string, string | undefined> = gated;
  expect(stage["home.freeLine"]).toBe("mobileFree");
  expect(stage["faq.webview.q"]).toBe("android");
  expect(stage["faq.webview.a"]).toBe("android");
});

// The roadmap headings read as a clear order Next, Then, Later (owner, 25 November 2026)
test("the four reworded roadmap headings", async () => {
  const fr = await strings("fr"), nl = await strings("nl"), ja = await strings("ja"), ms = await strings("ms");
  expect([fr["roadmap.next"], fr["roadmap.then"]]).toEqual(["À venir", "Ensuite"]);
  expect(nl["roadmap.next"]).toBe("Volgende");
  expect(ja["roadmap.later"]).toBe("さらに先");
  // "Akan datang" can read as "coming soon"; the heading promises no timing (owner, 25 November 2026)
  expect(ms["roadmap.later"]).toBe("Pada masa hadapan");
});

// The roadmap of 25 November 2026: summary lines and the new points, in every language
const ROADMAP_NEW = ["roadmap.v31.text", "roadmap.v31.unlocked", "roadmap.v32.text", "roadmap.v32.fixes", "roadmap.v32.paper", "roadmap.v33.text", "roadmap.v33.make", "roadmap.v33.encrypt", "roadmap.v33.only", "roadmap.v4.text", "roadmap.v4.identity", "roadmap.v4.both", "roadmap.v4.free"];
for (const code of codes) {
  test(`${code}: the roadmap's new lines are there`, async () => {
    const s = await strings(code);
    for (const key of ROADMAP_NEW) expect(s[key]?.trim(), key).toBeTruthy();
    expect(s["roadmap.v33.title"]).toBe("Doughnut Forge 3.3");
  });
}

// The roadmap of 26 November 2026: 3.4 in every language, and "Doughnut CLI" is a name, never translated
const ROADMAP_34 = ["roadmap.v34.text", "roadmap.v34.split", "roadmap.v34.threshold", "roadmap.v34.setup"];
for (const code of codes) {
  test(`${code}: the roadmap has 3.4, and Doughnut CLI by name`, async () => {
    const s = await strings(code);
    for (const key of ROADMAP_34) expect(s[key]?.trim(), key).toBeTruthy();
    expect(s["roadmap.v34.title"]).toBe("Doughnut Forge 3.4");
    expect(s["roadmap.v4.cli"]).toContain("Doughnut CLI");
  });
}

// The network paragraph and tile go live with the mobile pricing stage as they are:
// the final white paper says the same (principle 1: the store's own app and the
// operating system talk to the store), so nothing holds them any more (owner, 26 November 2026)
for (const code of codes) {
  test(`${code}: the network lines carry no white paper marker`, async () => {
    const s = await strings(code);
    for (const key of ["technical.network.none", "technical.glance.network"]) expect(s[key], key).not.toContain("PENDING-WHITEPAPER-PDF");
  });
}

// The white paper is a translated page: every language has its own, with hreflang (owner, 26 November 2026)
test("the white paper is one of the translated pages", async () => {
  const { translatedPages } = await import("../../src/i18n/alternates");
  expect(translatedPages).toContain("security/white-paper/");
});

// The claims review of 26 November 2026: the folders line, the pre-3.0 quantum limit and
// the press screenshots named as Doughnut Forge 2, in every language
for (const code of codes) {
  test(`${code}: the claims review lines are there`, async () => {
    const s = await strings(code);
    for (const key of ["features.folders", "technical.limits.quantum.label", "technical.limits.quantum.text"]) expect(s[key]?.trim(), key).toBeTruthy();
    expect(s["press.shots.text"]).toContain("Doughnut Forge 2");
  });
}
