// The official Google Play badge files come from the owner (19 November 2026);
// until then src/assets/badges/google-play/ holds a placeholder, marked
// data-placeholder="true". It must never reach a page that can go live: Android
// may be switched on (src/data/release.json) only once every placeholder is gone,
// and the build refuses to show one (src/data/badges.ts).
import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";

const DIR = "src/assets/badges";
const MARK = 'data-placeholder="true"';
const placeholders = readdirSync(DIR, { recursive: true })
  .map(String)
  .filter((f) => f.endsWith(".svg") && readFileSync(`${DIR}/${f}`, "utf8").includes(MARK));

test("Android is not switched on while a Google Play badge is still a placeholder", () => {
  const { androidOnSale } = JSON.parse(readFileSync("src/data/release.json", "utf8")) as { androidOnSale: boolean };
  if (androidOnSale) expect(placeholders.filter((f) => f.startsWith("google-play/")), "official Google Play badge files needed").toEqual([]);
});

test("only the Google Play badge may be a placeholder", () => {
  expect(placeholders.filter((f) => !f.startsWith("google-play/"))).toEqual([]);
});
