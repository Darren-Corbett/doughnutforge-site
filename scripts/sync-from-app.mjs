// Copies what the site reuses from the app repo into this repo.
// Runs on a developer machine only; CI never needs the app repo.
// Never writes to the app repo.
//
//   node scripts/sync-from-app.mjs [--app ../doughnut-forge] [--langs en,de | all]

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};

const APP = arg("--app", join(homedir(), "git/doughnut-forge"));
const SITE = new URL("..", import.meta.url).pathname;

if (!existsSync(join(APP, "src/locales"))) {
  console.error(`App repo not found at ${APP}. Pass --app <path>.`);
  process.exit(1);
}

const appVersion = JSON.parse(readFileSync(join(APP, "package.json"), "utf8")).version;
const appCommit = execFileSync("git", ["-C", APP, "rev-parse", "--short", "HEAD"]).toString().trim();
const source = (file) => `doughnut-forge ${appVersion} (${appCommit}) ${file}`;

const writeJson = (path, data) => {
  writeFileSync(join(SITE, path), JSON.stringify(data, null, 2) + "\n");
  console.log(`wrote ${path}`);
};

// --- Languages: the enabled entries in src/constants/languages.ts ---------
// hreflang needs a region for the two English and two Spanish variants.
const HREFLANG = { en: "en-GB", es: "es-ES" };

const languagesTs = readFileSync(join(APP, "src/constants/languages.ts"), "utf8");
const entry =
  /code: "([^"]+)",\s*name: "([^"]+)",\s*flag: "[^"]+",\s*isoCountryCode: "[^"]+",\s*region: "([^"]+)",\s*enabled: (true|false)/g;
const languages = [...languagesTs.matchAll(entry)]
  .filter((m) => m[4] === "true")
  .map(([, code, name, region]) => ({
    code,
    path: code.toLowerCase(),
    hreflang: HREFLANG[code] ?? code,
    name,
    region,
    // No RTL language is enabled in the app today; set here when one is.
    dir: ["ar", "fa", "he"].includes(code.split("-")[0]) ? "rtl" : "ltr",
  }));

writeJson("src/i18n/languages.json", {
  _source: source("src/constants/languages.ts"),
  languages,
});

const allCodes = languages.map((l) => l.code);
const langsArg = arg("--langs", "en");
const langs = langsArg === "all" ? allCodes : langsArg.split(",");

// --- App strings: only the keys the site uses -----------------------------
const APP_KEYS = {
  app: [
    "navigation.tabs.vault",
    "navigation.tabs.mobile-vault",
    "navigation.tabs.text-vault",
    "navigation.tabs.identity",
    "navigation.tabs.contacts",
  ],
  // Plain sentences from the app's built-in guides, used on the features page
  help: [
    "secureDirectoryGuide.step1.description",
    "setupGuide.step2.description",
    "setupGuide.step3.description",
    "identityContactsGuide.step1.description",
    "identityContactsGuide.step3.description",
  ],
};

const pick = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

for (const lang of langs) {
  const strings = { _source: source(`src/locales/${lang}/*.json`) };
  for (const [ns, keys] of Object.entries(APP_KEYS)) {
    const json = JSON.parse(readFileSync(join(APP, "src/locales", lang, `${ns}.json`), "utf8"));
    for (const key of keys) {
      const value = pick(json, key);
      if (typeof value !== "string") throw new Error(`Missing ${lang}/${ns}.json ${key}`);
      strings[`${ns}:${key}`] = value;
    }
  }
  writeJson(`src/i18n/app/${lang}.json`, strings);
}

// --- Store copy: fastlane metadata ----------------------------------------
// Store locales differ from app locales; map each site language to one.
const STORE_LOCALE = {
  en: "en-GB", de: "de-DE", es: "es-ES", fr: "fr-FR", nl: "nl-NL",
  "zh-CN": "zh-Hans", "zh-TW": "zh-Hant",
};

const readStore = (platform, loc) => {
  const dir = join(APP, "fastlane/metadata", platform, loc);
  const read = (f) => readFileSync(join(dir, `${f}.txt`), "utf8").trim();
  const description = read("description");
  // "• Title: Text" lines are the feature list.
  const features = [...description.matchAll(/^• ([^:]+): (.+)$/gm)].map(([, title, text]) => ({ title, text }));
  const paragraphs = description.split(/\n\s*\n/).map((p) => p.trim());
  return {
    subtitle: read("subtitle"),
    promotionalText: read("promotional_text"),
    opening: paragraphs[0],
    noSubscription: paragraphs[1],
    closing: paragraphs.at(-1),
    features,
  };
};

for (const lang of langs) {
  const loc = STORE_LOCALE[lang] ?? lang;
  writeJson(`src/i18n/store/${lang}.json`, {
    _source: source(`fastlane/metadata/{mac,ios}/${loc}`),
    mac: readStore("mac", loc),
    ios: readStore("ios", loc),
  });
}

// --- Screenshots: resized and stored as high-quality WebP to keep the repo small;
// Astro sizes them again per device at build time.
// iPhone screenshots only: the phone app leads on the site. Add a Mac screenshot
// here once there is one of a clean demo folder (the current ones show .DS_Store).
const SCREENSHOTS = [
  ["fastlane/screenshots/ios/en-GB/iphone_01_secure_file.png", "iphone-secure-file.webp", 900],
  ["fastlane/screenshots/ios/en-GB/iphone_04_secure_text.png", "iphone-secure-text.webp", 900],
  ["fastlane/screenshots/ios/en-GB/iphone_05_identity.png", "iphone-identity.webp", 900],
  ["fastlane/screenshots/ios/en-GB/iphone_02_encrypting.png", "iphone-encrypting.webp", 900],
  ["fastlane/screenshots/ios/en-GB/iphone_03_contacts.png", "iphone-contacts.webp", 900],
  ["fastlane/screenshots/ios/en-GB/ipad_01_secure_file_ipad.png", "ipad-secure-file.webp", 1400],
];

mkdirSync(join(SITE, "src/assets/app"), { recursive: true });
for (const [from, to, width, crop] of SCREENSHOTS) {
  const image = sharp(join(APP, from));
  if (crop) image.extract(crop);
  await image.resize({ width, withoutEnlargement: true }).webp({ quality: 92 }).toFile(join(SITE, "src/assets/app", to));
  console.log(`wrote src/assets/app/${to}`);
}

// --- Press kit: full-size files for download from /press/ -------------------
// Only screens that are clean and true today. Mac and Windows screenshots join
// once there are new ones (the store sets show .DS_Store and "military-grade").
const PRESS_KIT = [
  ["src-tauri/app-icon.png", "doughnut-forge-icon.png", 1024],
  ["src-tauri/icons/AppIcon.icon/Assets/app-icon-ios.png", "doughnut-forge-icon-square-light.png", 1024],
  ["src-tauri/icons/AppIcon.icon/Assets/app-icon-ios-dark.png", "doughnut-forge-icon-square-dark.png", 1024],
  ["src-tauri/icons/AppIcon.icon/Assets/app-icon-ios-mono.png", "doughnut-forge-icon-mono.png", 1024],
  ["fastlane/screenshots/ios/en-GB/iphone_01_secure_file.png", "iphone-secure-file.png"],
  ["fastlane/screenshots/ios/en-GB/iphone_02_encrypting.png", "iphone-encrypting.png"],
  ["fastlane/screenshots/ios/en-GB/iphone_03_contacts.png", "iphone-contacts.png"],
  ["fastlane/screenshots/ios/en-GB/iphone_04_secure_text.png", "iphone-secure-text.png"],
  ["fastlane/screenshots/ios/en-GB/iphone_05_identity.png", "iphone-identity.png"],
  ["fastlane/screenshots/ios/en-GB/ipad_01_secure_file_ipad.png", "ipad-secure-file.png"],
  ["fastlane/screenshots/ios/en-GB/ipad_03_contacts_ipad.png", "ipad-contacts.png"],
  ["fastlane/screenshots/ios/en-GB/ipad_04_secure_text_ipad.png", "ipad-secure-text.png"],
];

// The full files go to public/press/ under stable names; small WebP previews go
// to src/assets/press/ for the page, and their sizes to src/data/press-files.json.
mkdirSync(join(SITE, "public/press"), { recursive: true });
mkdirSync(join(SITE, "src/assets/press"), { recursive: true });
const pressFiles = [];
for (const [from, to, size] of PRESS_KIT) {
  const image = sharp(join(APP, from));
  if (size) image.resize(size);
  const { width, height } = await image.png({ compressionLevel: 9, effort: 10 }).toFile(join(SITE, "public/press", to));
  await sharp(join(SITE, "public/press", to))
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(join(SITE, "src/assets/press", to.replace(/\.png$/, ".webp")));
  pressFiles.push({ file: to, width, height });
  console.log(`wrote public/press/${to}`);
}
writeJson("src/data/press-files.json", { _source: source("fastlane/screenshots, src-tauri icons"), files: pressFiles });

// --- Brand: app icon, and the default social preview image ------------------
mkdirSync(join(SITE, "src/assets/brand"), { recursive: true });
mkdirSync(join(SITE, "public/og"), { recursive: true });
const ICON = join(APP, "src-tauri/app-icon.png");
await sharp(ICON).resize(256).png().toFile(join(SITE, "src/assets/brand/app-icon.png"));
console.log("wrote src/assets/brand/app-icon.png");

const ogText = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#f5f8fa"/>
  <rect x="0" y="606" width="1200" height="24" fill="#1da1f2"/>
  <text x="440" y="270" font-family="Helvetica Neue, Arial, sans-serif" font-size="72" font-weight="800" fill="#14171a">Doughnut Forge</text>
  <text x="440" y="345" font-family="Helvetica Neue, Arial, sans-serif" font-size="40" font-weight="800" fill="#09649c">Keep private files private.</text>
  <text x="440" y="410" font-family="Helvetica Neue, Arial, sans-serif" font-size="30" font-weight="600" fill="#536471">Only the people you choose can open them.</text>
</svg>`);
const ogIcon = await sharp(ICON).resize(300).png().toBuffer();
await sharp(ogText)
  .composite([{ input: ogIcon, left: 90, top: 150 }])
  .png()
  .toFile(join(SITE, "public/og/default.png"));
console.log("wrote public/og/default.png");
