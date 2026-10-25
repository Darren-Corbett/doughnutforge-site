// A store badge's wording in a language: the badge's own text (src/assets/badges/alt.json)
// where the store has a badge in that language, otherwise English, marked as English.
// Used by the badge itself and by its fallback link and /get/ page (src/components/StoreBadge.astro).
import alts from "../assets/badges/alt.json";
import type { StoreId } from "./stores";

export const badgeWording = (store: StoreId, code: string) => {
  const altText: Record<string, string> = alts[store];
  const own = Boolean(altText[code]);
  const alt = own ? altText[code] : altText.en;
  if (!alt) throw new Error(`No alt text for ${store}/${own ? code : "en"} in src/assets/badges/alt.json`);
  return { alt, own };
};

/** The site's own page that forwards to a store, for when a blocker hides the badge */
export const getPath = (store: StoreId, langPath: string) => `/get/${store}/${langPath}/`;
