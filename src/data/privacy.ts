// The privacy policy. This repo is its source (since 13 November 2026; it was
// first copied word for word from the forge-privacy repo): src/content/legal/privacy/
// holds the text in every language. scripts/check-privacy-wording.mjs fails the
// build if a page differs from it by a single character or link.
import { reached, type Stage } from "./stages";

type Policy = { links: Record<string, string>; strings: Record<PolicyKey, string>; held?: Partial<Record<PolicyKey, Stage>> };
export type PolicyKey =
  | "title"
  | "effectiveDate"
  | "hero"
  | "sec1Title"
  | "sec1Desc"
  | "sec2Title"
  | "sec2Desc"
  | "sec2Purchase"
  | "sec3Title"
  | "sec3Desc"
  | "sec4Title"
  | "sec4Desc"
  | "sec5Title"
  | "sec5Desc"
  | "sec6Title"
  | "sec6Counts"
  | "sec6Never"
  | "sec6Device"
  | "sec6Processor"
  | "sec6Basis"
  | "sec6OptOut"
  | "sec6Public"
  | "sec6Hosting"
  | "publisherInfo";

const files = import.meta.glob<Policy>("../content/legal/privacy/*.json", { eager: true, import: "default" });

/**
 * Parts of the policy held back until a launch stage (en.json "held"): the page
 * leaves them out and marks them, and scripts/check-privacy-wording.mjs accepts
 * only those as missing
 */
export const heldParts = (): PolicyKey[] =>
  (Object.entries(files["../content/legal/privacy/en.json"]?.held ?? {}) as [PolicyKey, Stage][]).filter(([, stage]) => !reached(stage)).map(([key]) => key);

/** The policy in one language, with links made into <a> tags. Every site language has its own file. */
export const getPolicy = (lang: string) => {
  const policy = files[`../content/legal/privacy/${lang}.json`];
  if (!policy) throw new Error(`No privacy policy for ${lang}: add src/content/legal/privacy/${lang}.json`);
  const html = (key: PolicyKey) =>
    policy.strings[key]
      .replace(/\[\[(\w+)\]\]/g, (_, token: string) => `<a href="${policy.links[token]}">`)
      .replace(/\[\[\/\w+\]\]/g, "</a>");
  return { html };
};

/**
 * The policy's own title as plain text ("Privacy Policy", "Datenschutzerklärung"),
 * used wherever the site links to it, so the link says what the page says.
 */
export const policyTitle = (lang: string) =>
  getPolicy(lang)
    .html("title")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&");
