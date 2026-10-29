// Every published blog post, the comparisons included, carries a BreadcrumbList
// that matches its address: Doughnut Forge, then Blog, then the post's own title.
import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";

const SITE = "https://doughnut-forge.app";
const blogDir = new URL("../../src/content/blog/en/", import.meta.url).pathname;
const published = readdirSync(blogDir)
  .filter((f) => /^[^_].*\.mdx?$/.test(f))
  .map((f) => ({ slug: f.replace(/\.mdx?$/, ""), text: readFileSync(blogDir + f, "utf8") }))
  .filter((p) => /^draft:\s*false\s*$/m.test(p.text))
  .map((p) => ({ slug: p.slug, title: /^title:\s*["']?(.+?)["']?\s*$/m.exec(p.text)![1]! }));

test("there are published posts to check", () => expect(published.length).toBeGreaterThan(0));

for (const post of published) {
  test(`breadcrumbs ${post.slug}`, async ({ page }) => {
    await page.goto(`/blog/${post.slug}/`);
    const data = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((s) => [JSON.parse(s)].flat());
    const crumbs = data.find((d) => d["@type"] === "BreadcrumbList");
    expect(crumbs, "BreadcrumbList").toBeTruthy();
    expect(crumbs.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Doughnut Forge", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog/` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE}/blog/${post.slug}/` },
    ]);
    // The Article stays beside it
    expect(data.some((d) => d["@type"] === "Article")).toBe(true);
  });
}
