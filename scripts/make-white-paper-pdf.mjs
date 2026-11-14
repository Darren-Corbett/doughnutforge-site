// Makes the white paper's PDF for each language from the built page, run by hand
// on the Mac after `npm run build`, never in GitHub Actions. The PDF is the page's
// own text (searchable, tagged, with an outline from the headings), with every
// "How this is checked" note opened and the site's header and footer left out.
// It is written to public/ and committed, and its fingerprint and its text's are
// recorded in src/data/white-paper-pdfs.json for scripts/check-white-paper.mjs.
// Build again afterwards, so dist/ has the new PDF.
//
//   node scripts/make-white-paper-pdf.mjs [--lang en]
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const root = new URL("..", import.meta.url).pathname;
const TEXTS = join(root, "src/content/white-paper");
const RECORD = join(root, "src/data/white-paper-pdfs.json");
const PORT = 4341;
const sha = (data) => createHash("sha256").update(data).digest("hex");

const { languages } = JSON.parse(readFileSync(join(root, "src/i18n/languages.json"), "utf8"));
const only = parseArgs({ options: { lang: { type: "string" } } }).values.lang;
const codes = readdirSync(TEXTS)
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.slice(0, -3))
  .filter((code) => !only || code === only);
if (codes.length === 0) throw new Error(`No white paper text for ${only ?? "any language"} in src/content/white-paper/`);

const server = spawn("npx", ["astro", "preview", "--port", String(PORT), "--ignore-lock"], { cwd: root, stdio: "ignore" });
const browser = await chromium.launch();
try {
  for (let tries = 0; ; tries++) {
    if ((await fetch(`http://localhost:${PORT}/`).catch(() => null))?.ok) break;
    if (tries > 60) throw new Error("astro preview did not start: run npm run build first");
    await new Promise((r) => setTimeout(r, 500));
  }
  const record = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, "utf8")) : {};
  const page = await browser.newPage();
  for (const code of codes) {
    const lang = languages.find((l) => l.code === code);
    const path = `${code === "en" ? "" : `/${lang.path}`}/security/white-paper/`;
    const res = await page.goto(`http://localhost:${PORT}${path}`);
    if (!res?.ok()) throw new Error(`${path} answered ${res?.status()}: build the site first`);
    await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
    await page.addStyleTag({ content: "body > header, body > footer, nav, .pdf, .skip-link { display: none !important; } .prose { border: 0 !important; padding: 0 !important; }" });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ format: "A4", margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" }, printBackground: true, tagged: true, outline: true });
    const name = `doughnut-forge-white-paper-${code}.pdf`;
    for (const dir of [join(root, "public", path), join(root, "dist", path)]) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, name), pdf);
    }
    record[code] = { source: sha(readFileSync(join(TEXTS, `${code}.md`), "utf8")), pdf: sha(pdf) };
    console.log(`wrote public${path}${name} (${Math.round(pdf.length / 1024)} KB)`);
  }
  const sorted = Object.fromEntries(Object.keys(record).sort().map((code) => [code, record[code]]));
  writeFileSync(RECORD, `${JSON.stringify(sorted, null, 2)}\n`);
} finally {
  await browser.close();
  server.kill();
}
