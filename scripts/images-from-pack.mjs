// Makes the v2 app screenshots the site shows, and the press kit screenshots,
// from the store screenshots in the website pack (read only, never written).
// The store images put the app screen inside a drawn device frame on a blue
// background under a headline. The site draws its own frame, so this crops
// each image to the bare screen inside the frame's bezel.
//
// Writes:
//   src/assets/app/v2/<lang>/*.webp   phones 720 px, iPad 1080 px wide (the largest the frames ask for at 2x)
//   public/press/*.png                full-size bare screens, English light
//   src/assets/press/*.webp           480 px previews of those
//   src/data/press-files.json         the screenshot entries (icons kept)
//
//   node scripts/images-from-pack.mjs [--pack ~/website-pack-v2]

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const packArg = args.indexOf("--pack");
const PACK = packArg === -1 ? join(homedir(), "website-pack-v2") : args[packArg + 1];
const SHOTS = join(PACK, "screenshots");
const SITE = new URL("..", import.meta.url).pathname;

if (!existsSync(SHOTS)) {
  console.error(`No screenshots found at ${SHOTS}. Pass --pack <dir>.`);
  process.exit(1);
}

const languages = JSON.parse(readFileSync(join(SITE, "src/i18n/languages.json"), "utf8")).languages;

// --- Finding the screen ----------------------------------------------------
// The pack's frame draws its bezel in one flat near-black (#0b0c0e). Walking
// in from each image edge, the screen starts at the first pixel after that
// bezel run. Several scan lines per side, keeping the innermost hit, so a
// status bar icon or the Dynamic Island never decides the edge.
const BEZEL = [11, 12, 14];
const TOLERANCE = 6;
// Drops the one antialiased pixel row where bezel meets screen.
const INSET = 2;
const SCAN_AT = [0.35, 0.5, 0.65];

function screenRect({ data, info }, file) {
  const { width, height, channels } = info;
  const isBezel = (x, y) => {
    const i = (y * width + x) * channels;
    return BEZEL.every((c, k) => Math.abs(data[i + k] - c) <= TOLERANCE);
  };
  // Steps from `start` towards the centre and returns the first index after the bezel run.
  const innerEdge = (length, start, step, at) => {
    let i = start;
    const limit = length / 2;
    while (!at(i) && Math.abs(i - start) < limit) i += step;
    if (Math.abs(i - start) >= limit) throw new Error(`${file}: no device bezel found`);
    while (at(i)) i += step;
    return i;
  };
  const rows = SCAN_AT.map((f) => Math.round(height * f));
  const cols = SCAN_AT.map((f) => Math.round(width * f));
  const left = Math.max(...rows.map((y) => innerEdge(width, 0, 1, (x) => isBezel(x, y))));
  const right = Math.min(...rows.map((y) => innerEdge(width, width - 1, -1, (x) => isBezel(x, y))));
  const top = Math.max(...cols.map((x) => innerEdge(height, 0, 1, (y) => isBezel(x, y))));
  const bottom = Math.min(...cols.map((x) => innerEdge(height, height - 1, -1, (y) => isBezel(x, y))));
  return {
    left: left + INSET,
    top: top + INSET,
    width: right - left + 1 - 2 * INSET,
    height: bottom - top + 1 - 2 * INSET,
  };
}

async function bareScreen(platform, lang, name) {
  const file = join(SHOTS, platform, lang, `${name}.png`);
  const raw = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  return sharp(file).extract(screenRect(raw, file));
}

// --- Site images -------------------------------------------------------------
// [platform, source name, output name, width]
const PHONE = 720;
const TABLET = 1080;
const EVERY_LANGUAGE = [
  ["iphone", "dark-01-files", "iphone-files-dark", PHONE],
  ["iphone", "dark-04-text", "iphone-text-dark", PHONE],
  ["iphone", "dark-05-identity", "iphone-identity-dark", PHONE],
  ["iphone", "light-02-encrypt", "iphone-encrypt-light", PHONE],
  ["iphone", "light-03-progress", "iphone-progress-light", PHONE],
  ["ipad", "light-01-files", "ipad-files-light", TABLET],
];
// The blog posts are in English only.
const ENGLISH_ONLY = [
  ["iphone", "light-01-files", "iphone-files-light", PHONE],
  ["iphone", "light-05-identity", "iphone-identity-light", PHONE],
];

for (const { code } of languages) {
  const dir = join(SITE, "src/assets/app/v2", code);
  mkdirSync(dir, { recursive: true });
  const list = code === "en" ? [...EVERY_LANGUAGE, ...ENGLISH_ONLY] : EVERY_LANGUAGE;
  for (const [platform, from, to, width] of list) {
    const image = await bareScreen(platform, code, from);
    await image.resize({ width }).webp({ quality: 85 }).toFile(join(dir, `${to}.webp`));
  }
  console.log(`wrote src/assets/app/v2/${code}/ (${list.length} images)`);
}

// --- Press kit -----------------------------------------------------------------
// iPhone shots come from the 6.7" set, the size press usually asks for.
const PRESS = [
  ["iphone-6.7in", "light-01-files", "iphone-files.png"],
  ["iphone-6.7in", "light-02-encrypt", "iphone-encrypt.png"],
  ["iphone-6.7in", "light-03-progress", "iphone-progress.png"],
  ["iphone-6.7in", "light-04-text", "iphone-text.png"],
  ["iphone-6.7in", "light-05-identity", "iphone-identity.png"],
  ["ipad", "light-01-files", "ipad-files.png"],
  ["ipad", "light-03-identity", "ipad-identity.png"],
  ["ipad", "light-04-text", "ipad-text.png"],
];
const pressScreens = [];
for (const [platform, from, to] of PRESS) {
  const image = await bareScreen(platform, "en", from);
  const full = join(SITE, "public/press", to);
  const { width, height } = await image.png({ compressionLevel: 9, effort: 10 }).toFile(full);
  await sharp(full)
    .resize({ width: 480 })
    .webp({ quality: 88 })
    .toFile(join(SITE, "src/assets/press", to.replace(/\.png$/, ".webp")));
  pressScreens.push({ file: to, width, height });
  console.log(`wrote public/press/${to}`);
}

const pressJson = join(SITE, "src/data/press-files.json");
const { files } = JSON.parse(readFileSync(pressJson, "utf8"));
const icons = files.filter((f) => f.file.startsWith("doughnut-forge-icon"));
writeFileSync(
  pressJson,
  JSON.stringify(
    {
      _source: "website-pack-v2 (tag v2.0.0) store screenshots, cropped to the screen; icons from doughnut-forge 0.4.42",
      files: [...icons, ...pressScreens],
    },
    null,
    2,
  ) + "\n",
);
console.log("wrote src/data/press-files.json");
