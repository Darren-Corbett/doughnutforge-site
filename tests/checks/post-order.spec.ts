// The blog list is newest first. Posts with the same date keep the owner's order:
// the one with the higher `sameDayOrder` goes first (owner, 24 November 2026:
// the Oyster post above the ZIP post, both dated 23 November).
// Two posts link to the newer ones with full addresses, which survive Medium.
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { newestFirst } from "../../src/data/post-order";

const blogDir = new URL("../../src/content/blog/en/", import.meta.url).pathname;
const post = (slug: string) => readFileSync(`${blogDir}${slug}.mdx`, "utf8");
const frontMatter = (slug: string) => {
  const text = post(slug);
  const order = /^sameDayOrder:\s*(\d+)\s*$/m.exec(text)?.[1];
  return { date: new Date(/^date:\s*(\S+)/m.exec(text)![1]), sameDayOrder: order ? Number(order) : undefined };
};

test("a newer post goes first, whatever its same-day order", () => {
  const older = { date: new Date("2026-11-22"), sameDayOrder: 5 };
  const newer = { date: new Date("2026-11-23") };
  expect([older, newer].sort(newestFirst)).toEqual([newer, older]);
});

test("on the same date, the higher same-day order goes first, and none counts as 0", () => {
  const plain = { date: new Date("2026-11-23") };
  const first = { date: new Date("2026-11-23"), sameDayOrder: 1 };
  expect([plain, first].sort(newestFirst)).toEqual([first, plain]);
});

test("the Oyster post is listed above the ZIP post", () => {
  const oyster = frontMatter("oyster-photocard-data-breach");
  const zip = frontMatter("is-a-password-protected-zip-file-secure");
  expect(oyster.date).toEqual(zip.date);
  expect(newestFirst(oyster, zip)).toBeLessThan(0);
});

test("the breaches post links to the Oyster post, with its full address", () => {
  expect(post("protect-personal-files-from-data-breaches")).toContain("](https://doughnut-forge.app/blog/oyster-photocard-data-breach/)");
});

test("the sharing post links to the ZIP post, with its full address", () => {
  expect(post("share-encrypted-files")).toContain("](https://doughnut-forge.app/blog/is-a-password-protected-zip-file-secure/)");
});
