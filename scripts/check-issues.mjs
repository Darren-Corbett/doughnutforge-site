// Checks the labelled issues the support pages are built from (src/data/issues.json,
// or ISSUES_FILE) and the pages built from them. Runs after `astro build`; any
// problem fails the build.
//   - each item has exactly number, slug, title, question, answer and url
//   - nothing about any person: no @handle, and no user, login or avatar field
//   - slugs are unique, and every item has its built page
//   - a list with no items has no page, in any language
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = new URL("..", import.meta.url).pathname;
const file = process.env.ISSUES_FILE ?? join(SITE, "src/data/issues.json");
const data = JSON.parse(readFileSync(file, "utf8"));
const LISTS = { answered: "support/answered/", known: "support/known-issues/" };
const FIELDS = ["answer", "number", "question", "slug", "title", "url"].join();
const { languages } = JSON.parse(readFileSync(join(SITE, "src/i18n/languages.json"), "utf8"));

const problems = [];
if (Object.keys(data).sort().join() !== "answered,known") problems.push(`${file}: expected exactly "answered" and "known"`);
const slugs = new Set();
for (const [list, path] of Object.entries(LISTS)) {
  for (const item of data[list] ?? []) {
    const name = `${list} #${item.number}`;
    if (Object.keys(item).sort().join() !== FIELDS) problems.push(`${name}: fields are ${Object.keys(item).join(", ")}`);
    if (/@[A-Za-z0-9-]+/.test(`${item.title} ${item.question} ${item.answer}`)) problems.push(`${name}: contains an @handle`);
    if (!/^https:\/\/github\.com\/Darren-Corbett\/forge-privacy\/issues\/\d+$/.test(item.url)) problems.push(`${name}: url ${item.url}`);
    if (!item.answer?.trim()) problems.push(`${name}: no answer`);
    if (slugs.has(item.slug)) problems.push(`${name}: slug ${item.slug} is used twice`);
    slugs.add(item.slug);
    if (!existsSync(join(SITE, "dist", path, item.slug, "index.html"))) problems.push(`${name}: dist/${path}${item.slug}/ was not built`);
  }
  // An empty list has no page in any language
  const built = languages.filter((l) => existsSync(join(SITE, "dist", l.code === "en" ? "" : l.path, path, "index.html")));
  if (!(data[list] ?? []).length && built.length) problems.push(`${list}: no issues, but ${path} was built in ${built.length} language(s)`);
  if ((data[list] ?? []).length && built.length !== languages.length) problems.push(`${list}: ${path} was built in ${built.length} of ${languages.length} languages`);
}
if (/"(user|login|avatar_url)"/.test(readFileSync(file, "utf8"))) problems.push(`${file}: holds a user, login or avatar field`);

if (problems.length) {
  console.error(`check-issues: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-issues: ${data.answered.length} answered question(s), ${data.known.length} known issue(s), every page built`);
