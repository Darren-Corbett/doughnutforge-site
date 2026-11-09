// The v2 app screenshots, one set per language, made from the store screenshots
// by scripts/images-from-pack.mjs. Pages show each language its own screens.
import type { ImageMetadata } from "astro";

const files = import.meta.glob<{ default: ImageMetadata }>("../assets/app/v2/*/*.webp", { eager: true });

export type Screen =
  | "iphone-files-dark"
  | "iphone-text-dark"
  | "iphone-identity-dark"
  | "iphone-encrypt-light"
  | "iphone-progress-light"
  | "ipad-files-light";

export const screen = (lang: string, name: Screen): ImageMetadata => {
  const file = files[`../assets/app/v2/${lang}/${name}.webp`];
  if (!file) throw new Error(`No ${name} screenshot for ${lang}: run node scripts/images-from-pack.mjs`);
  return file.default;
};
