// The fonts for the social preview images (scripts/make-og.mjs): Noto, kept in
// build-fonts/ and used on every machine, the deploy and a Mac alike, so nothing
// is downloaded and the images look the same everywhere. Build tools only: the
// site never serves a font.
//
// Before sharp is loaded, useBuildFonts() points fontconfig at
// build-fonts/fonts.conf, which lists that folder and nothing else. missingGlyphs()
// then checks every character of a title against the fonts its language draws
// with, so a title that would show empty boxes stops the run instead.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = new URL("..", import.meta.url).pathname;
export const DEFAULT_FONTS = join(SITE, "build-fonts");

// The family each language's titles use, then Noto Sans for any Latin words in them
export const FAMILIES = {
  ja: ["Noto Sans CJK JP", "Noto Sans"],
  "zh-CN": ["Noto Sans CJK SC", "Noto Sans"],
  "zh-TW": ["Noto Sans CJK TC", "Noto Sans"],
  ko: ["Noto Sans CJK KR", "Noto Sans"],
  th: ["Noto Sans Thai", "Noto Sans"],
  hi: ["Noto Sans Devanagari", "Noto Sans"],
};
export const LATIN = ["Noto Sans"];
export const familiesFor = (lang) => FAMILIES[lang] ?? LATIN;

/**
 * Makes sharp draw text with the fonts in `dir` and no others. Call before
 * importing sharp. On a Mac its text library uses the system's fonts (Core Text)
 * unless told to use fontconfig; Linux uses fontconfig already.
 */
export const useBuildFonts = (dir = DEFAULT_FONTS) => {
  process.env.PANGOCAIRO_BACKEND = "fc";
  process.env.FONTCONFIG_FILE = join(dir, "fonts.conf");
};

// A minimal OpenType reader: each face's family names (name table) and the
// characters it has (cmap formats 4 and 12), from .ttf, .otf and .ttc files
const faces = (buf) => {
  const offsets = buf.toString("latin1", 0, 4) === "ttcf" ? Array.from({ length: buf.readUInt32BE(8) }, (_, i) => buf.readUInt32BE(12 + i * 4)) : [0];
  return offsets.map((base) => {
    const tables = {};
    for (let i = 0, n = buf.readUInt16BE(base + 4); i < n; i++) {
      const rec = base + 12 + i * 16;
      tables[buf.toString("latin1", rec, rec + 4)] = buf.readUInt32BE(rec + 8);
    }
    return { families: names(buf, tables.name), has: charset(buf, tables.cmap) };
  });
};
const names = (buf, at) => {
  const out = new Set();
  const count = buf.readUInt16BE(at + 2);
  const strings = at + buf.readUInt16BE(at + 4);
  for (let i = 0; i < count; i++) {
    const rec = at + 6 + i * 12;
    const [platform, , , id, length, offset] = [0, 2, 4, 6, 8, 10].map((o) => buf.readUInt16BE(rec + o));
    if (platform !== 3 || (id !== 1 && id !== 16)) continue;
    // UTF-16 big-endian: swap a copy to little-endian to decode it
    out.add(Buffer.from(buf.subarray(strings + offset, strings + offset + length)).swap16().toString("utf16le"));
  }
  return out;
};
const charset = (buf, at) => {
  const ranges = [];
  const count = buf.readUInt16BE(at + 2);
  for (let i = 0; i < count; i++) {
    const sub = at + buf.readUInt32BE(at + 4 + i * 8 + 4);
    const format = buf.readUInt16BE(sub);
    if (format === 4) {
      const segs = buf.readUInt16BE(sub + 6) / 2;
      for (let s = 0; s < segs; s++) {
        const end = buf.readUInt16BE(sub + 14 + s * 2);
        const start = buf.readUInt16BE(sub + 16 + segs * 2 + s * 2);
        if (start !== 0xffff) ranges.push([start, end]);
      }
    } else if (format === 12) {
      for (let g = 0, n = buf.readUInt32BE(sub + 12); g < n; g++) ranges.push([buf.readUInt32BE(sub + 16 + g * 12), buf.readUInt32BE(sub + 20 + g * 12)]);
    }
  }
  return (cp) => ranges.some(([a, b]) => cp >= a && cp <= b);
};

/** Every face in a fonts folder, by family name */
export const loadFonts = (dir = DEFAULT_FONTS) => {
  const byFamily = new Map();
  for (const file of readdirSync(dir).filter((f) => /\.(ttf|otf|ttc|otc)$/i.test(f)))
    for (const face of faces(readFileSync(join(dir, file))))
      for (const family of face.families) byFamily.set(family, [...(byFamily.get(family) ?? []), face.has]);
  return byFamily;
};

/** The characters of `text` that none of the families can draw (spaces aside) */
export const missingGlyphs = (fonts, families, text) => {
  const has = families.flatMap((f) => fonts.get(f) ?? []);
  return [...new Set([...text].filter((c) => !/\s/.test(c) && !has.some((h) => h(c.codePointAt(0)))))];
};
