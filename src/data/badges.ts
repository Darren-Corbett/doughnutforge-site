// A store badge's wording in a language: the badge's own text (src/assets/badges/alt.json)
// where the store has a badge in that language, otherwise English, marked as English.
// Used by the badge itself and by its fallbacks and /go/ page (src/components/StoreBadge.astro).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { ImageMetadata } from "astro";
import alts from "../assets/badges/alt.json";
import type { StoreId } from "./stores";

export const badgeWording = (store: StoreId, code: string) => {
  const altText: Record<string, string> = alts[store];
  const own = Boolean(altText[code]);
  const alt = own ? altText[code] : altText.en;
  if (!alt) throw new Error(`No alt text for ${store}/${own ? code : "en"} in src/assets/badges/alt.json`);
  return { alt, own };
};

const badges = import.meta.glob<{ default: ImageMetadata }>("../assets/badges/*/*.svg", { eager: true });

/** Every badge file, as "<store>/<code>.svg" */
export const badgeFiles = Object.keys(badges).map((k) => k.replace("../assets/badges/", ""));

/**
 * A store badge's artwork in a language: the language's own file where the store
 * has one (a regional badge identical to its language's is not kept, so es-MX at
 * Microsoft uses es.svg), otherwise English. `file` is "<store>/<code>.svg".
 */
export const badgeArt = (store: StoreId, code: string) => {
  const { own } = badgeWording(store, code);
  const tries = own ? [code, code.split("-")[0]] : ["en"];
  const file = tries.map((c) => `${store}/${c}.svg`).find((f) => badges[`../assets/badges/${f}`]);
  if (!file) throw new Error(`No badge for ${store}/${tries[0]}: add src/assets/badges/${store}/${tries[0]}.svg`);
  return { file, image: badges[`../assets/badges/${file}`]!.default };
};

/** A badge file's exact bytes (read from the source, never processed) */
export const badgeBytes = (file: string) => readFileSync(`${process.cwd()}/src/assets/badges/${file}`);

/**
 * Where the second copy of a badge is served, for when a blocker hides the first:
 * the same bytes under a name made from them, which says nothing about stores
 * (src/pages/s/[name].svg.ts)
 */
export const secondArt = (file: string) => `/s/${createHash("sha256").update(badgeBytes(file)).digest("hex").slice(0, 12)}.svg`;

/**
 * A short code for a store in the fallback's address, made from its ID, so the
 * address says nothing about stores either: blockers also hide links by address
 */
export const storeCode = (store: StoreId) => createHash("sha256").update(store).digest("hex").slice(0, 6);

/** The site's own page that forwards to a store, for when a blocker hides the badge (src/pages/go/) */
export const goPath = (store: StoreId, langPath: string) => `/go/${storeCode(store)}/${langPath}/`;
