// WCAG 2.2 AA with axe-core on every page, in both themes, on a phone and a
// desktop width. Colour contrast is checked in each theme because the dark
// theme has its own colours.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { record } from "../support/findings";
import { langOf, pages, templateOf, THEMES } from "../support/site";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const path of pages) {
  test(`axe ${path}`, async ({ page }, info) => {
    await page.goto(path);
    let failures = 0;
    for (const theme of THEMES) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        for (const v of violations)
          for (const node of v.nodes) {
            failures++;
            const target = node.target.join(" ");
            info.annotations.push({ type: v.id, description: `${width}px ${theme}: ${target}` });
            await record(
              page,
              info,
              {
                check: `axe:${v.id}`,
                page: path,
                lang: langOf(path),
                width,
                theme,
                detail: { impact: v.impact, help: v.help, target, summary: node.failureSummary?.slice(0, 300), html: node.html.slice(0, 200) },
                key: `axe:${v.id}|${templateOf(path)}|${target}`,
              },
              target,
            );
          }
      }
    }
    expect(failures, `${failures} accessibility problem(s) on ${path}`).toBe(0);
  });
}
