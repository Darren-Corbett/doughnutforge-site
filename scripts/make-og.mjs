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
// home page (default.png). These are not committed: the deploy makes them after
// `astro build` with Noto fonts installed (.github/workflows/deploy.yml), and
// `npm run build:preview` makes them locally with the Mac's own fonts:
//
//   node scripts/make-og.mjs --langs translations --out dist/og
//
// Pages point at these images only when the site is built with OG_IMAGES=all.

import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const SITE = new URL("..", import.meta.url).pathname;
const args = process.argv.slice(2);
const arg = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const ICON = join(SITE, "src/assets/brand/app-icon.png");
const { languages } = JSON.parse(readFileSync(join(SITE, "src/i18n/languages.json"), "utf8"));
const langArg = arg("--langs", "en");
// "translations" is every language but English, whose images are committed
const langs =
  langArg === "all" ? languages : langArg === "translations" ? languages.filter((l) => l.code !== "en") : languages.filter((l) => langArg.split(",").includes(l.code));
const OUT = join(SITE, arg("--out", "public/og"));

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
    const title = /^title:\s*["']?(.+?)["']?\s*$/m.exec(readFileSync(join(blogDir, file), "utf8"))?.[1];
    if (title) posts[file.replace(/\.mdx?$/, "")] = title;
  }
}

// Fonts: Noto in the deploy (Linux), the Mac's own fonts when made locally
const FONTS = {
  ja: "Noto Sans CJK JP, Hiragino Sans, sans-serif",
  "zh-CN": "Noto Sans CJK SC, PingFang SC, sans-serif",
  "zh-TW": "Noto Sans CJK TC, PingFang TC, sans-serif",
  ko: "Noto Sans CJK KR, Apple SD Gothic Neo, sans-serif",
  th: "Noto Sans Thai, Thonburi, sans-serif",
  hi: "Noto Sans Devanagari, Kohinoor Devanagari, sans-serif",
};
const LATIN = "Helvetica Neue, Noto Sans, Arial, sans-serif";

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
  const font = FONTS[lang] ?? LATIN;
  // Shorter titles get larger text; long titles get up to four lines
  let size = width(title) <= 20 ? 92 : width(title) <= 44 ? 72 : 58;
  let lines = wrap(title, lang, Math.floor(1020 / (size * 0.52)));
  while (lines.length > 4 && size > 40) {
    size -= 6;
    lines = wrap(title, lang, Math.floor(1020 / (size * 0.52)));
  }
  const lineHeight = Math.round(size * (FONTS[lang] ? 1.3 : 1.1));
  const top = 330 - ((lines.length - 1) * lineHeight) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#15202b"/>
  <rect x="0" y="606" width="1200" height="24" fill="#1da1f2"/>
  <text x="270" y="140" font-family="${LATIN}" font-size="44" font-weight="800" fill="#4cb5f5">Doughnut Forge</text>
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

for (const lang of langs) {
  const dir = lang.code === "en" ? OUT : join(OUT, lang.path);
  mkdirSync(dir, { recursive: true });
  for (const [name, title] of Object.entries(await titles(lang.code))) await make(title, lang.code, join(dir, `${name}.png`));
  if (lang.code === "en") {
    mkdirSync(join(OUT, "blog"), { recursive: true });
    for (const [slug, title] of Object.entries(posts)) await make(title, "en", join(OUT, "blog", `${slug}.png`));
  }
}
