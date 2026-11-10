// Structured data for search engines, built in one place so every page that
// describes the app says the same thing.
import { localePath, type Language } from "../i18n";
import { platforms, storeUrl } from "./stores";
import { site } from "./site";

// The one Organization: the app, the company and the blog's author are the same
// entity, so every page's structured data points at this @id.
export const ORG_ID = new URL("/#organization", site.url).href;
// Pages Doughnut Forge controls besides its store listings
const MEDIUM = "https://medium.com/@doughnut_forge";

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
  publisher: { "@id": ORG_ID },
});

/**
 * `Organization` for the home page: who makes the app, with its icon as the logo.
 * `sameAs` lists only pages Doughnut Forge controls: its store listings, without
 * a language parameter, and its Medium profile.
 */
export const organization = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: site.name,
  url: new URL("/", site.url).href,
  logo: new URL("/icon-512.png", site.url).href,
  sameAs: [
    ...platforms.flatMap((p) => {
      if (p.status !== "available") return [];
      const listing = new URL(storeUrl(p.store, p.storeId, "en-GB"));
      listing.search = "";
      return [listing.href];
    }),
    MEDIUM,
  ],
});
