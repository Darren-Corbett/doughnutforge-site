// The copy lint: the rules a machine can check from the app's copy style guide
// (~/Desktop/review/website-handoff/v3/copy-style.md, approved by Darren on
// 21 November 2026), on every English page as visitors and search engines read
// it. The brand step of the quality gate checks the rest, and every other
// language is checked by its reviewers against the guide's voice notes.
//
// The build runs it with --strict (owner, 22 November 2026, "lint A"): the copy
// on the site that day is approved as it is in scripts/copy-lint-known.json, and
// any new finding fails the build until it is fixed or the owner approves it.
//
//   node scripts/check-copy.mjs [--dist <dir>] [--summary] [--strict]
import { readdirSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { blocksOf, langOf } from "./page-text.mjs";

const root = new URL("..", import.meta.url).pathname;
const { values: args } = parseArgs({ options: { dist: { type: "string" }, summary: { type: "boolean" }, strict: { type: "boolean" } } });
const dist = (args.dist ?? `${root}dist`).replace(/\/?$/, "/");
const known = JSON.parse(readFileSync(`${root}scripts/copy-lint-known.json`, "utf8"));

const MAX_WORDS = 25;
const word = (s) => new RegExp(`(?<![\\p{L}\\p{N}-])(?:${s})(?![\\p{L}\\p{N}])`, "giu");

// Each rule finds its words in a block of text (a paragraph, list item, heading).
// Words in “quotes” are someone else's (a source, a policy), so they are left out.
const RULES = {
  // Words never used (the guide, "Words never used"); saying it is not audited is fine
  banned: (b) => b.replace(/\bnot (?:been |yet )?audited/gi, "").match(word("quantum-proof|quantum-safe|unbreakable|military-grade|bank-grade|100% secure|audited")),
  hype: (b) => b.match(word("amazing|revolutionary|ultimate|powerful|seamless(?:ly)?|effortless(?:ly)?|cutting-edge|game-changing|world-class|best|simply|just")),
  we: (b) => b.match(/(?<![\p{L}-])(?:we|our|ours|us)(?![\p{L}])|(?<![\p{L}])(?:We|Our|Ours)(?![\p{L}])/gu),
  contraction: (b) => b.match(/(?<![\p{L}])(?:\p{L}+(?:n[’']t|[’'](?:re|ve|ll|m|d))|(?:it|that|there|here|what|let|who)[’']s)(?![\p{L}])/giu),
  exclamation: (b) => b.match(/!(?=\s|$)/g),
  // "Unlock" is for opening the app; never for the purchase
  unlock: (b) => (/purchase|buy|bought|paid|price/i.test(b) ? b.match(word("unlock\\w*")) : null),
  // "Free" once in a field; the purchase said one way
  "free-twice": (b) => { const m = b.match(word("free")); return m && m.length > 1 ? m : null; },
  "paid-once": (b) => (/one-time/i.test(b) && /paid once/i.test(b) ? ["one-time", "paid once"] : null),
};

// Per sentence: the free phrase starts "On iPhone, iPad and Android,", any
// other "free to download" names the three in the same sentence, and 25 words at most
const SENTENCE_RULES = {
  platforms: (s) =>
    (/free to download and use/i.test(s) && !/^On iPhone, iPad and Android,/.test(s)) || (/free to download/i.test(s) && !["iPhone", "iPad", "Android"].every((d) => s.includes(d))) ? ["free to download"] : null,
  long: (s) => { const n = s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length; return n > MAX_WORDS ? [`${n} words`] : null; },
};
const sentencesOf = (block) => block.split(/(?<=[.?!])\s+(?=[\p{Lu}“"‘(])/u);

const unquoted = (block) => block.replace(/“[^”]*”/g, "…");

const isApproved = (rule, text) => known.some((k) => k.rule === rule && text.includes(k.text));

// One finding per rule and text, with the pages that show it
const findings = new Map();
const add = (rule, text, words, file) => {
  const key = `${rule}\n${text}`;
  const f = findings.get(key) ?? { rule, text, words: [...new Set(words)], pages: new Set(), approved: isApproved(rule, text) };
  f.pages.add(file);
  findings.set(key, f);
};

let pages = 0;
for (const file of readdirSync(dist, { recursive: true }).map(String).filter((f) => f.endsWith(".html")).sort()) {
  const html = readFileSync(`${dist}${file}`, "utf8");
  if (!langOf(html).startsWith("en")) continue;
  pages++;
  for (const block of new Set(blocksOf(html))) {
    for (const [rule, find] of Object.entries(RULES)) { const w = find(unquoted(block)); if (w) add(rule, block, w, file); }
    for (const sentence of sentencesOf(block)) for (const [rule, find] of Object.entries(SENTENCE_RULES)) { const w = find(sentence); if (w) add(rule, sentence, w, file); }
  }
}

const all = [...findings.values()];
const open = all.filter((f) => !f.approved);
const plural = (n, s) => `${n} ${s}${n === 1 ? "" : "s"}`;
const head = `check-copy: ${plural(open.length, "finding")} on ${plural(pages, "English page")}${all.length > open.length ? `, ${all.length - open.length} approved` : ""}`;

if (args.strict) {
  if (open.length) {
    console.error(`${head}. Fix these, or ask the owner to approve them in scripts/copy-lint-known.json:`);
    for (const f of open) console.error(`  [${f.rule}] "${f.words.join('", "')}" in "${f.text}"`);
    process.exit(1);
  }
  console.log(head);
} else if (args.summary) {
  console.log(`${head} (report only; npm run lint:copy lists them)`);
} else {
  console.log(`${head} (report only)`);
  for (const f of open.sort((a, b) => b.pages.size - a.pages.size || a.rule.localeCompare(b.rule))) {
    const where = f.pages.size === 1 ? [...f.pages][0] : `${f.pages.size} pages`;
    console.log(`  [${f.rule}] "${f.words.join('", "')}" in "${f.text}" (${where})`);
  }
}
