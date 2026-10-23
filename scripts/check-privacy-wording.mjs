// Proves the built privacy policy says exactly what forge-privacy says.
// Runs after `astro build`. For every element marked data-policy="<key>" in the
// built pages, compares it with the committed copy in src/content/legal/privacy/:
//   - the words, character for character (after decoding entities and collapsing spaces)
//   - the bold, code and link markup, including every link address
// Every key must appear on the privacy page. Any difference fails the build.
//
// To compare the committed copy with forge-privacy itself, use
//   node scripts/extract-privacy.mjs <index.html> --sha <commit> --check

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = new URL("..", import.meta.url).pathname;
const dist = join(SITE, "dist");
const policyDir = join(SITE, "src/content/legal/privacy");

if (!existsSync(dist)) {
  console.error("check-privacy-wording: no dist/ folder; run astro build first");
  process.exit(1);
}

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
const words = (html) =>
  decode(html.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
// The site wraps words with a hyphen in <span class="keep-word"> so they never split
// across lines, and puts <wbr> between Japanese and Chinese words (src/middleware.ts).
// That is layout, not wording, so it is removed first.
const unwrap = (html) => html.replace(/<span class="keep-word">([^<]*)<\/span>/g, "$1").replace(/<wbr>/g, "");
// The markup that matters: which tags, in order, with link addresses and code colours
const markup = (html) =>
  [...html.matchAll(/<\/?(\w+)([^>]*)>/g)]
    .map(([tag, name, attrs]) => {
      if (tag.startsWith("</")) return `</${name}>`;
      const href = /href="([^"]*)"/.exec(attrs)?.[1];
      const cls = /class="([^"]*)"/.exec(attrs)?.[1]?.split(/\s+/).filter((c) => !c.startsWith("astro-")).join(" ");
      return `<${name}${href ? ` href=${decode(href)}` : ""}${name === "code" && cls ? ` class=${cls}` : ""}>`;
    })
    .join("");

const render = (text, links) =>
  text.replace(/\[\[(\w+)\]\]/g, (_, token) => `<a href="${links[token]}">`).replace(/\[\[\/\w+\]\]/g, "</a>");

// Which language a built page belongs to: "/" is English, "/de/..." is German
const policies = Object.fromEntries(
  readdirSync(policyDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => [f.replace(/\.json$/, "").toLowerCase(), JSON.parse(readFileSync(join(policyDir, f), "utf8"))]),
);

const languageFolders = new Set(
  JSON.parse(readFileSync(join(SITE, "src/i18n/languages.json"), "utf8")).languages.map((l) => l.path),
);

const pages = readdirSync(dist, { recursive: true })
  .map(String)
  .filter((f) => f.endsWith(".html"));

let checked = 0;
const problems = [];
const seenOnPrivacy = new Map();

for (const page of pages) {
  const html = readFileSync(join(dist, page), "utf8");
  if (!html.includes("data-policy=")) continue;
  // English pages sit at the root; every other language has its own folder and policy
  const first = page.split("/")[0];
  const policy = first in policies ? policies[first] : languageFolders.has(first) ? undefined : policies.en;
  if (!policy) {
    problems.push(`${page}: no privacy policy file for the language "${first}"`);
    continue;
  }
  const isPrivacy = /(^|\/)privacy\/index\.html$/.test(page);

  for (let [, , key, inner] of html.matchAll(/<(\w+)\b[^>]*?\sdata-policy="(\w+)"[^>]*>([\s\S]*?)<\/\1>/g)) {
    checked++;
    if (isPrivacy) seenOnPrivacy.set(page, (seenOnPrivacy.get(page) ?? new Set()).add(key));
    const source = policy.strings[key];
    if (source === undefined) {
      problems.push(`${page}: data-policy="${key}" is not a key in the policy`);
      continue;
    }
    const expected = render(source, policy.links);
    inner = unwrap(inner);
    if (words(inner) !== words(expected)) {
      problems.push(`${page} "${key}": the words differ\n    page:   ${words(inner)}\n    policy: ${words(expected)}`);
    } else if (markup(inner) !== markup(expected)) {
      problems.push(`${page} "${key}": the links or formatting differ\n    page:   ${markup(inner)}\n    policy: ${markup(expected)}`);
    }
  }
}

// The privacy page must show every part of the policy
const privacyPages = pages.filter((p) => /(^|\/)privacy\/index\.html$/.test(p));
if (privacyPages.length === 0) problems.push("No privacy page was built");
// Every policy file has its page: privacy/ for English, <folder>/privacy/ for the rest
for (const lang of Object.keys(policies)) {
  const page = lang === "en" ? "privacy/index.html" : `${lang}/privacy/index.html`;
  if (!privacyPages.includes(page)) problems.push(`The ${lang} policy has no page at ${page}`);
}
for (const page of privacyPages) {
  const seen = seenOnPrivacy.get(page) ?? new Set();
  const missing = Object.keys(policies.en.strings).filter((k) => !seen.has(k));
  if (missing.length) problems.push(`${page} is missing: ${missing.join(", ")}`);
}

if (problems.length) {
  console.error(`check-privacy-wording: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(
  `check-privacy-wording: ${privacyPages.length} language(s), ${checked} passages, 0 differences from ${policies.en._source}`,
);
