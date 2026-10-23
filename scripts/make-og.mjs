// Makes the social preview image (1200×630) for each page and blog post:
// public/og/<page>.png and public/og/blog/<slug>.png.
// Runs on a developer machine only, so the text is drawn with the same fonts
// every time; the images are committed. Run it after changing a page title:
//
//   node scripts/make-og.mjs
//
// The home page keeps public/og/default.png from scripts/sync-from-app.mjs.

import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import en from "../src/i18n/ui/en.ts";

const SITE = new URL("..", import.meta.url).pathname;
const OUT = join(SITE, "public/og");
const ICON = join(SITE, "src/assets/brand/app-icon.png");
const privacy = JSON.parse(readFileSync(join(SITE, "src/content/legal/privacy/en.json"), "utf8"));

const pages = {
  features: en["features.title"],
  pricing: en["home.pricing.title"],
  download: en["download.title"],
  privacy: privacy.strings.title,
  support: en["support.title"],
  press: en["press.title"],
  legal: en["legal.title"],
  blog: en["blog.title"],
};

// Blog posts: the title from each English post's front matter
const posts = {};
const blogDir = join(SITE, "src/content/blog/en");
if (existsSync(blogDir)) {
  for (const file of readdirSync(blogDir).filter((f) => /^[^_].*\.md$/.test(f))) {
    const title = /^title:\s*["']?(.+?)["']?\s*$/m.exec(readFileSync(join(blogDir, file), "utf8"))?.[1];
    if (title) posts[file.replace(/\.md$/, "")] = title;
  }
}

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Word wrap that never breaks inside a word
const greedy = (text, max) => {
  const lines = [];
  for (const word of text.split(/\s+/)) {
    const last = lines.at(-1);
    if (last && `${last} ${word}`.length <= max) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
};
// Balanced lines, like CSS text-wrap: balance: as few lines as fit, then as even as possible
const wrap = (text, max) => {
  const count = greedy(text, max).length;
  for (let width = Math.ceil(text.length / count); width < max; width++) {
    const lines = greedy(text, width);
    if (lines.length <= count) return lines;
  }
  return greedy(text, max);
};

const icon = await sharp(ICON).resize(150).png().toBuffer();

const make = async (title, path) => {
  // Shorter titles get larger text; long blog titles get up to four lines
  const size = title.length <= 20 ? 92 : title.length <= 44 ? 72 : 58;
  const lines = wrap(title, Math.floor(1020 / (size * 0.52)));
  const lineHeight = Math.round(size * 1.1);
  const top = 330 - ((lines.length - 1) * lineHeight) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#15202b"/>
  <rect x="0" y="606" width="1200" height="24" fill="#1da1f2"/>
  <text x="270" y="140" font-family="Helvetica Neue, Arial, sans-serif" font-size="44" font-weight="800" fill="#4cb5f5">Doughnut Forge</text>
  ${lines
    .map(
      (line, i) =>
        `<text x="90" y="${top + 60 + i * lineHeight}" font-family="Helvetica Neue, Arial, sans-serif" font-size="${size}" font-weight="900" fill="#ffffff">${escape(line)}</text>`,
    )
    .join("\n  ")}
</svg>`;
  await sharp(Buffer.from(svg))
    .composite([{ input: icon, left: 90, top: 60 }])
    .png({ compressionLevel: 9 })
    .toFile(path);
  console.log(`wrote ${path.replace(SITE, "")}`);
};

mkdirSync(join(OUT, "blog"), { recursive: true });
for (const [name, title] of Object.entries(pages)) await make(title, join(OUT, `${name}.png`));
for (const [slug, title] of Object.entries(posts)) await make(title, join(OUT, "blog", `${slug}.png`));
