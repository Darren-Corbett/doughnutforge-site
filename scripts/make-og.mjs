// Makes the social preview image (1200×630) for each page and blog post.
//
// English: public/og/<page>.png and public/og/blog/<slug>.png, made on a developer
// machine and committed. Run it after changing an English page title:
//
//   node scripts/make-og.mjs
//
// The English home page keeps public/og/default.png from scripts/sync-from-app.mjs.
//
// Other languages: <out>/<language folder>/<page>.png, one per page including the
// home page (default.png). These are not committed: the deploy (`npm run
// build:deploy`) and `npm run build:preview` make them after `astro build`:
//
//   node scripts/make-og.mjs --langs translations --out dist/og
//
// Pages point at these images only when the site is built with OG_IMAGES=all.
//
// Fonts: the Noto fonts in build-fonts/ and no others, on every machine
// (scripts/og-fonts.mjs), so the images look the same in the deploy and on a Mac
// and nothing is downloaded. Before drawing, every title is checked against its
// fonts; a character none of them has stops the run, naming it. `--fonts <dir>`
// uses another folder with its own fonts.conf (for tests).

import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { DEFAULT_FONTS, LATIN, familiesFor, loadFonts, missingGlyphs, useBuildFonts } from "./og-fonts.mjs";

const SITE = new URL("..", import.meta.url).pathname;
const args = process.argv.slice(2);
const arg = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const ICON = join(SITE, "src/assets/brand/app-icon.png");
const { languages } = JSON.parse(readFileSync(join(SITE, "src/i18n/languages.json"), "utf8"));
const langArg = arg("--langs", "en");
// "translations" is every language but English, whose images are committed
const langs =
  langArg === "all" ? languages : langArg === "translations" ? languages.filter((l) => l.code !== "en") : languages.filter((l) => langArg.split(",").includes(l.code));
// Relative to the repo; an absolute folder stays as given
const OUT = resolve(SITE, arg("--out", "public/og"));
const FONT_DIR = resolve(SITE, arg("--fonts", DEFAULT_FONTS));

// fontconfig reads its settings when sharp first draws text: point it at the build fonts before loading sharp
useBuildFonts(FONT_DIR);
const { default: sharp } = await import("sharp");

const readJson = (path) => JSON.parse(readFileSync(join(SITE, path), "utf8"));
const loadUi = async (code) => (await import(pathToFileURL(join(SITE, "src/i18n/ui", `${code}.ts`)).href)).default;

// The title on each page's image, in one language
const titles = async (code) => {
  const ui = await loadUi(code);
  return {
    features: ui["features.title"],
    pricing: ui["home.pricing.title"],
    download: ui["download.title"],
    privacy: readJson(`src/content/legal/privacy/${code}.json`).strings.title,
    support: ui["support.title"],
    press: ui["press.title"],
    legal: ui["legal.title"],
    roadmap: ui["roadmap.title"],
    security: ui["security.title"],
    answered: ui["answered.title"],
    "known-issues": ui["known.title"],
    // English uses the separate default.png design for home, and alone has a blog
    ...(code === "en" ? { blog: ui["blog.title"] } : { default: readJson(`src/i18n/store/${code}.json`).mac.parts.headline }),
  };
};

// Blog posts: the title from each English post's front matter
const posts = {};
const blogDir = join(SITE, "src/content/blog/en");
if (existsSync(blogDir)) {
  for (const file of readdirSync(blogDir).filter((f) => /^[^_].*\.mdx?$/.test(f))) {
    const text = readFileSync(join(blogDir, file), "utf8");
    // Published posts only: public/ is deployed as it is, so a draft's image would
    // put its title online. New posts are drafts unless they say `draft: false`.
    if (!/^draft:\s*false\s*$/m.test(text)) continue;
    const title = /^title:\s*["']?(.+?)["']?\s*$/m.exec(text)?.[1];
    if (title) posts[file.replace(/\.mdx?$/, "")] = title;
  }
}

// The font-family list for a language's titles, and for the "Doughnut Forge" line
const fontList = (lang) => familiesFor(lang).join(", ");
const BRAND = LATIN.join(", ");

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Japanese, Chinese and Korean letters are about twice as wide as Latin ones
const WIDE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const SPACELESS = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}]/u;
const width = (s) => [...s].reduce((w, c) => w + (WIDE.test(c) ? 1.9 : 1), 0);

// The pieces a line may break between: words, never parts of a word. Languages
// without spaces are cut into words by Intl.Segmenter; punctuation stays with
// the word before it.
const pieces = (text, lang) => {
  if (!SPACELESS.test(text)) return text.split(/\s+/).map((w, i) => (i ? ` ${w}` : w));
  const out = [];
  for (const { segment, isWordLike } of new Intl.Segmenter(lang, { granularity: "word" }).segment(text)) {
    // Japanese particles (one or two hiragana, such as は or には) stay with the word before them
    const particle = /^\p{Script=Hiragana}{1,2}$/u.test(segment) && out.length && !/\s$/.test(out.at(-1));
    if (!out.length || ((isWordLike || /^\s/.test(segment)) && !particle)) out.push(segment);
    else out[out.length - 1] += segment;
  }
  return out;
};
// Lines of at most `max` letters, as few as fit, then as even as possible
const greedy = (parts, max) => {
  const lines = [];
  for (const part of parts) {
    const last = lines.at(-1);
    if (last !== undefined && width(last + part) <= max) lines[lines.length - 1] = last + part;
    else lines.push(part.trimStart());
  }
  return lines;
};
const wrap = (text, lang, max) => {
  const parts = pieces(text, lang);
  const count = greedy(parts, max).length;
  for (let w = Math.ceil(width(text) / count); w < max; w++) {
    const lines = greedy(parts, w);
    if (lines.length <= count) return lines;
  }
  return greedy(parts, max);
};

const icon = await sharp(ICON).resize(150).png().toBuffer();

const make = async (title, lang, path) => {
  const font = fontList(lang);
  // Shorter titles get larger text; long titles get up to four lines
  let size = width(title) <= 20 ? 92 : width(title) <= 44 ? 72 : 58;
  let lines = wrap(title, lang, Math.floor(1020 / (size * 0.52)));
  while (lines.length > 4 && size > 40) {
    size -= 6;
    lines = wrap(title, lang, Math.floor(1020 / (size * 0.52)));
  }
  const lineHeight = Math.round(size * (familiesFor(lang) !== LATIN ? 1.3 : 1.1));
  const top = 330 - ((lines.length - 1) * lineHeight) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#15202b"/>
  <rect x="0" y="606" width="1200" height="24" fill="#1da1f2"/>
  <text x="270" y="140" font-family="${BRAND}" font-size="44" font-weight="800" fill="#4cb5f5">Doughnut Forge</text>
  ${lines
    .map(
      (line, i) =>
        `<text x="90" y="${top + 60 + i * lineHeight}" font-family="${font}" font-size="${size}" font-weight="900" fill="#ffffff">${escape(line)}</text>`,
    )
    .join("\n  ")}
</svg>`;
  await sharp(Buffer.from(svg))
    .composite([{ input: icon, left: 90, top: 60 }])
    .png({ compressionLevel: 9 })
    .toFile(path);
  console.log(`wrote ${path.replace(SITE, "")}`);
};

// Every title, checked against its fonts before anything is drawn
const jobs = [];
for (const lang of langs) {
  for (const [name, title] of Object.entries(await titles(lang.code))) jobs.push({ lang, name, title });
  if (lang.code === "en") for (const [slug, title] of Object.entries(posts)) jobs.push({ lang, name: `blog/${slug}`, title });
}
const fonts = loadFonts(FONT_DIR);
const problems = [];
if (missingGlyphs(fonts, LATIN, "Doughnut Forge").length) problems.push(`"Doughnut Forge": no ${LATIN.join(", ")} in ${FONT_DIR}`);
for (const { lang, name, title } of jobs) {
  const missing = missingGlyphs(fonts, familiesFor(lang.code), title);
  if (missing.length) problems.push(`${lang.code} ${name}: missing ${missing.join(" ")} in "${title}" (fonts: ${familiesFor(lang.code).join(", ")})`);
}
if (problems.length) {
  console.error(`make-og: these characters are in no font in ${FONT_DIR}, so they would draw as empty boxes:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`make-og: every title's characters are in build-fonts (${jobs.length} images)`);

for (const lang of langs) {
  const dir = lang.code === "en" ? OUT : join(OUT, lang.path);
  mkdirSync(dir, { recursive: true });
  for (const [name, title] of Object.entries(await titles(lang.code))) await make(title, lang.code, join(dir, `${name}.png`));
  if (lang.code === "en") {
    mkdirSync(join(OUT, "blog"), { recursive: true });
    for (const [slug, title] of Object.entries(posts)) await make(title, "en", join(OUT, "blog", `${slug}.png`));
  }
}
