// Structured data for search engines, built in one place so every page that
// describes the app says the same thing.
import { localePath, type Language } from "../i18n";
import { platforms, storeUrl } from "./stores";
import { site } from "./site";

const OS_NAMES: Record<string, string> = { mac: "macOS", windows: "Windows", ios: "iOS, iPadOS", android: "Android" };

/** The operating systems the app is on sale for today, from the store data */
export const availableSystems = () =>
  platforms
    .filter((p) => p.status === "available")
    .map((p) => OS_NAMES[p.id])
    .join(", ");

/**
 * `SoftwareApplication` for the home and download pages. No `offers`: pages show
 * no prices, because each store shows the local one.
 */
export const softwareApplication = (lang: Language, path: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  description,
  url: new URL(localePath(lang.code, path), site.url).href,
  image: new URL("/og/default.png", site.url).href,
  applicationCategory: "SecurityApplication",
  operatingSystem: availableSystems(),
  inLanguage: lang.hreflang,
});

/** `Organization` for the home page: who makes the app, with its icon as the logo and its store listings */
export const organization = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: new URL("/", site.url).href,
  logo: new URL("/icon-512.png", site.url).href,
  sameAs: platforms.flatMap((p) => (p.status === "available" ? [storeUrl(p.store, p.storeId, "en-GB")] : [])),
});
