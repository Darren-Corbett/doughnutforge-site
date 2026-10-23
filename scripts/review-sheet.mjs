// Writes one HTML review sheet per language: every string the site shows in that
// language, with where it comes from, the English, the reviewer's back-translation
// and findings. For whoever decides to mark a language reviewed. Not part of the site.
//
//   node scripts/review-sheet.mjs <out dir> [--langs de,fr | all] [--reviews <dir with <code>-review.json>]

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SITE = new URL("..", import.meta.url).pathname;
const args = process.argv.slice(2);
const arg = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const out = args[0];
if (!out || out.startsWith("--")) {
  console.error("Usage: node scripts/review-sheet.mjs <out dir> [--langs de,fr | all] [--reviews <dir>]");
  process.exit(1);
}
const reviewsDir = arg("--reviews", null);
const read = (path) => JSON.parse(readFileSync(join(SITE, path), "utf8"));
const { languages } = read("src/i18n/languages.json");
const langArg = arg("--langs", "all");
const langs = languages.filter((l) => l.code !== "en" && (langArg === "all" || langArg.split(",").includes(l.code)));
const review = read("src/i18n/review.json");
const load = async (code) => (await import(pathToFileURL(join(SITE, "src/i18n/ui", `${code}.ts`)).href)).default;
const en = await load("en");
const enApp = read("src/i18n/app/en.json");
const enStore = read("src/i18n/store/en.json");
const enPolicy = read("src/content/legal/privacy/en.json");

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const row = (cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;

mkdirSync(out, { recursive: true });
for (const lang of langs) {
  if (!existsSync(join(SITE, "src/i18n/ui", `${lang.code}.ts`))) continue;
  const ui = await load(lang.code);
  const app = read(`src/i18n/app/${lang.code}.json`);
  const store = read(`src/i18n/store/${lang.code}.json`);
  const policy = read(`src/content/legal/privacy/${lang.code}.json`);
  const status = review[lang.code] ?? { status: "draft", findings: [] };
  const full = reviewsDir && existsSync(join(reviewsDir, `${lang.code}-review.json`)) ? JSON.parse(readFileSync(join(reviewsDir, `${lang.code}-review.json`), "utf8")) : null;
  const findings = new Map();
  for (const f of status.findings ?? []) findings.set(f.key, [...(findings.get(f.key) ?? []), f]);

  const newRows = Object.keys(ui)
    .map((key) => {
      const fs = findings.get(key) ?? [];
      const notes = fs.map((f) => `<p class="${f.severity}"><b>${f.severity}</b>: ${esc(f.issue)}${f.suggestion ? `<br>Suggested: <span lang="${lang.hreflang}">${esc(f.suggestion)}</span>` : ""}</p>`).join("");
      return row([`<code>${key}</code>`, "NEW", esc(en[key]), `<span lang="${lang.hreflang}">${esc(ui[key])}</span>`, esc(full?.backTranslations?.[key] ?? ""), notes]);
    })
    .join("\n");
  const reused = [
    ...Object.keys(app).filter((k) => k !== "_source").map((k) => [k, "app", enApp[k], app[k]]),
    ...Object.entries(store.mac.parts).map(([k, v]) => [`store mac.parts.${k}`, "store", enStore.mac.parts[k], v]),
    ...store.mac.features.map((f, i) => [`store mac.features.${i}`, "store", `${enStore.mac.features[i].title}: ${enStore.mac.features[i].text}`, `${f.title}: ${f.text}`]),
    ["store mac.closing", "store", enStore.mac.closing, store.mac.closing],
    ["privacy title (nav and footer link)", "privacy", enPolicy.strings.title, policy.strings.title],
  ]
    .map(([k, src, e, t]) => row([`<code>${esc(k)}</code>`, src, esc(e), `<span lang="${lang.hreflang}">${esc(t)}</span>`, "", ""]))
    .join("\n");
  const blocking = (status.findings ?? []).filter((f) => f.severity === "blocking").length;

  writeFileSync(
    join(out, `${lang.code}.html`),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Review: ${esc(lang.name)} (${lang.code})</title>
<style>body{font:15px/1.5 system-ui,sans-serif;margin:24px;color:#14171a}table{border-collapse:collapse;width:100%}td,th{border:1px solid #cbd5e1;padding:6px 8px;vertical-align:top;text-align:start}th{background:#f1f5f9}code{font-size:12px}.blocking{color:#b00554}.minor{color:#9c4a00}.note{color:#475569}</style></head><body>
<h1>${esc(lang.name)} (${lang.code})</h1>
<p>Status: <b>${esc(status.status)}</b>. Reviewed by: ${esc(status.reviewedBy ?? "not yet")} ${esc(status.reviewedAt ?? "")}. Findings: ${(status.findings ?? []).length}, of which ${blocking} blocking.</p>
${full?.register ? `<p>Register: ${esc(full.register)}</p>` : ""}
<p>To publish this language, set its <code>status</code> to <code>reviewed</code> in <code>src/i18n/review.json</code>.</p>
<h2>Site copy (new, drafted for the site)</h2>
<table><tr><th>Key</th><th>Source</th><th>English</th><th>${esc(lang.name)}</th><th>Back-translation</th><th>Findings</th></tr>
${newRows}</table>
<h2>Reused, already translated (app, store listing, privacy policy)</h2>
<table><tr><th>Where</th><th>Source</th><th>English</th><th>${esc(lang.name)}</th><th></th><th></th></tr>
${reused}</table>
</body></html>
`,
  );
  console.log(`wrote ${join(out, `${lang.code}.html`)}`);
}
