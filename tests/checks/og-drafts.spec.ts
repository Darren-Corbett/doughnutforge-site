// Social preview images are made only for published posts. public/ is deployed
// as it is, so an image made for a draft would put its title online before the
// owner's yes. A post is published once its front matter says `draft: false`
// (new posts are drafts by default), as in astro.config.mjs.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const blogDir = `${root}src/content/blog/en`;
const posts = readdirSync(blogDir).filter((f) => /^[^_].*\.mdx?$/.test(f));
const isPublished = (file: string) => /^draft:\s*false\s*$/m.test(readFileSync(join(blogDir, file), "utf8"));
const slug = (file: string) => file.replace(/\.mdx?$/, "");

test("make-og draws images for published posts and none for drafts", async () => {
  test.setTimeout(5 * 60_000);
  const out = mkdtempSync(join(tmpdir(), "og-drafts-"));
  await promisify(execFile)(process.execPath, [`${root}scripts/make-og.mjs`, "--langs", "en", "--out", out], { maxBuffer: 64 * 1024 * 1024 });
  const images = readdirSync(join(out, "blog")).map((f) => f.replace(/\.png$/, ""));
  const published = posts.filter(isPublished).map(slug);
  expect(published.length, "published posts").toBeGreaterThan(0);
  expect(images.sort()).toEqual(published.sort());
});
