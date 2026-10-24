// The browser-tab icons, made from the app's square master icon with iOS-style
// "squircle" corners and transparent outside them: public/favicon.ico (16, 32
// and 48px), public/favicon-16x16.png and public/favicon-32x32.png.
//
// The corner is a superellipse, |x|^5 + |y|^5 = 1. Along the diagonal it meets
// a plain rounded corner with a radius of 22% of the side, but its curve starts
// further along the edge and eases in, as the iOS continuous corner does.
//
// apple-touch-icon.png and the manifest icons stay square: iOS and Android
// round those themselves. Reads the app repo, never writes to it.
//
//   node scripts/make-favicons.mjs [--app ~/git/doughnut-forge]
import { writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const SITE = new URL("..", import.meta.url).pathname;
const args = process.argv.slice(2);
const APP = args.includes("--app") ? args[args.indexOf("--app") + 1] : join(homedir(), "git/doughnut-forge");
// The full-bleed square icon the iOS app is built from
const MASTER = join(APP, "src-tauri/icons/AppIcon.icon/Assets/app-icon-ios.png");
const SIZE = 1024;
const EXPONENT = 5;

// The squircle as an SVG path, drawn at the master's size
const points = [];
for (let i = 0; i < 1440; i++) {
  const t = (i / 1440) * 2 * Math.PI;
  const c = Math.cos(t);
  const s = Math.sin(t);
  const x = Math.sign(c) * Math.abs(c) ** (2 / EXPONENT);
  const y = Math.sign(s) * Math.abs(s) ** (2 / EXPONENT);
  points.push(`${((x + 1) * SIZE) / 2},${((y + 1) * SIZE) / 2}`);
}
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><path d="M${points.join("L")}Z" fill="#fff"/></svg>`);

const rounded = await sharp(MASTER)
  .resize(SIZE, SIZE)
  .ensureAlpha()
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();
const png = (size) => sharp(rounded).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();

const out = (name) => join(SITE, "public", name);
writeFileSync(out("favicon-16x16.png"), await png(16));
writeFileSync(out("favicon-32x32.png"), await png(32));

// favicon.ico: an icon directory holding one PNG per size
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // 1 = icon
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const at = 6 + 16 * i;
  header.writeUInt8(size, at); // width
  header.writeUInt8(size, at + 1); // height
  header.writeUInt8(0, at + 2); // no palette
  header.writeUInt8(0, at + 3); // reserved
  header.writeUInt16LE(1, at + 4); // colour planes
  header.writeUInt16LE(32, at + 6); // bits per pixel
  header.writeUInt32LE(images[i].length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += images[i].length;
});
writeFileSync(out("favicon.ico"), Buffer.concat([header, ...images]));

console.log(`make-favicons: favicon.ico (${sizes.join(", ")}), favicon-16x16.png and favicon-32x32.png from ${MASTER}`);
