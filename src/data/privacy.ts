// The privacy policy, word for word from forge-privacy (see scripts/extract-privacy.mjs).
// Never edit the JSON by hand: scripts/check-privacy-wording.mjs fails the build
// if the page differs from it. Wording changes are proposed separately for approval.
type Policy = { _source: string; links: Record<string, string>; strings: Record<PolicyKey, string> };
export type PolicyKey =
  | "title"
  | "effectiveDate"
  | "hero"
  | "sec1Title"
  | "sec1Desc"
  | "sec2Title"
  | "sec2Desc"
  | "sec3Title"
  | "sec3Desc"
  | "sec4Title"
  | "sec4Desc"
  | "sec5Title"
  | "sec5Desc"
  | "publisherInfo";

const files = import.meta.glob<Policy>("../content/legal/privacy/*.json", { eager: true, import: "default" });

/** The policy in one language, with links made into <a> tags. Every site language has its own file. */
export const getPolicy = (lang: string) => {
  const policy = files[`../content/legal/privacy/${lang}.json`];
  if (!policy) throw new Error(`No privacy policy for ${lang}: run scripts/extract-privacy.mjs --langs all`);
  const html = (key: PolicyKey) =>
    policy.strings[key]
      .replace(/\[\[(\w+)\]\]/g, (_, token: string) => `<a href="${policy.links[token]}">`)
      .replace(/\[\[\/\w+\]\]/g, "</a>");
  return { html, source: policy._source };
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
