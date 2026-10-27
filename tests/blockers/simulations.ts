// How the blocker tests hide things: each way a content blocker can hide a store
// badge or its link, applied the way a blocker would. Shared by the badge
// fallback tests and the /go/ page tests.
import type { Page } from "@playwright/test";

export type Rule = { name: string; css?: string; remove?: string; delay?: number; abort?: string };
export const RULES: Rule[] = [
  { name: "hides every link whose address names an app or a store", css: 'a[href*="app"], a[href*="store"], a[href*="get"] { display: none !important; }' },
  { name: "makes store links transparent", css: 'a[href^="https://apps."] { opacity: 0 !important; }' },
  { name: "moves store links off the page", css: 'a[href^="https://apps."] { position: absolute !important; left: -9999px !important; }' },
  { name: "hides store links by address", css: 'a[href^="https://apps.apple.com"], a[href^="https://apps.microsoft.com"] { display: none !important; }' },
  { name: "makes badge images zero size", css: 'a[href^="https://apps."] img { width: 0 !important; height: 0 !important; }' },
  { name: "makes store links invisible", css: 'a[href^="https://apps."] { visibility: hidden !important; }' },
  { name: "hides badge images by their description", css: 'img[alt*="Store"] { display: none !important; }' },
  { name: "blocks the badge images", abort: "**/_astro/*.svg" },
  { name: "hides the badge's container", css: '*:has(> a[href^="https://apps."]) { display: none !important; }' },
  { name: "removes store links from the page", remove: 'a[href^="https://apps."]' },
  { name: "hides store links a second after load", css: 'a[href^="https://apps."] { display: none !important; }', delay: 1000 },
];

/** Hides the official badges and the second ones: only the text link is left */
export const BOTH: Rule[] = [
  { name: "blocks every image", abort: "**/*.svg" },
  { name: "hides every image in a link", css: "a img { display: none !important; }" },
  { name: "removes every link with an image", remove: "a:has(img)" },
];

/**
 * Applies a rule the way a blocker would: once the page is parsed, before its
 * load event (an init script runs before the document exists, so a style added
 * then is lost), or a while after load; or blocks a request outright
 */
export const block = async (page: Page, rule: Rule) => {
  if (rule.abort) await page.route(rule.abort, (route) => route.abort("blockedbyclient"));
  await page.addInitScript((r: Rule) => {
    const apply = () => {
      if (r.css) {
        const style = document.createElement("style");
        style.textContent = r.css;
        document.head.append(style);
      }
      if (r.remove) document.querySelectorAll(r.remove).forEach((e) => e.remove());
    };
    if (r.delay) addEventListener("load", () => setTimeout(apply, r.delay));
    else document.addEventListener("DOMContentLoaded", apply);
  }, rule);
};
