// The white paper (src/content/white-paper/<lang>.md) is public. The app side
// keeps an internal version of its notes with source file and test names; none
// of that may reach this repo or the site. And each language's PDF must be the
// one scripts/make-white-paper-pdf.mjs made from that language's current text,
// as recorded in src/data/white-paper-pdfs.json.
//
//   node scripts/check-white-paper.mjs [--root <repo>] [--dist <dist>]
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const args = parseArgs({ options: { root: { type: "string" }, dist: { type: "string" } } }).values;
const root = args.root ?? new URL("..", import.meta.url).pathname;
const dist = args.dist ?? join(root, "dist");
const TEXTS = join(root, "src/content/white-paper");
const RECORD = join(root, "src/data/white-paper-pdfs.json");
const sha = (data) => createHash("sha256").update(data).digest("hex");

const LEAKS = [
  [/src-tauri|TECH-SPEC-INTERNAL/, "an internal file name"],
  [/\b\w+\.rs\b/, "a Rust source file"],
  [/\b\w+_test\b/, "a test name"],
  [/^> ?Source:/m, "an internal source line"],
  [/\[PENDING/, "a draft marker"],
  [/\bC\d{1,2}\b/, "a finding code"],
  [/Notes for the author/i, "the notes for the author"],
];
const leaksIn = (text) => LEAKS.filter(([re]) => re.test(text)).map(([re, what]) => `${what} (${re.exec(text)[0]})`);

const problems = [];
const record = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, "utf8")) : {};
const langs = existsSync(TEXTS) ? readdirSync(TEXTS).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).sort() : [];
for (const lang of langs) {
  const text = readFileSync(join(TEXTS, `${lang}.md`), "utf8");
  for (const leak of leaksIn(text)) problems.push(`src/content/white-paper/${lang}.md: ${leak}`);

  const path = lang === "en" ? "security/white-paper" : `${lang.toLowerCase()}/security/white-paper`;
  const page = join(dist, path, "index.html");
  if (existsSync(page)) for (const leak of leaksIn(readFileSync(page, "utf8"))) problems.push(`${path}/index.html: ${leak}`);

  const name = `doughnut-forge-white-paper-${lang}.pdf`;
  const pdf = join(dist, path, name);
  const made = record[lang];
  if (!existsSync(pdf)) problems.push(`${path}/${name} is missing: run node scripts/make-white-paper-pdf.mjs --lang ${lang}`);
  else if (!made || made.source !== sha(text) || made.pdf !== sha(readFileSync(pdf)))
    problems.push(`${path}/${name} is not the PDF of the current ${lang}.md: run node scripts/make-white-paper-pdf.mjs --lang ${lang}`);
}

if (problems.length) {
  console.error(`check-white-paper:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-white-paper: ${langs.length} language(s), no private notes, every PDF made from its current text`);
