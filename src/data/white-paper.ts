// Where a page links to the white paper: its own language's paper once it is
// translated (src/content/white-paper/<code>.md), otherwise the English one,
// marked as English for the link (hreflang), as the footer does for the blog.
import { localePath } from "../i18n";

const translated = new Set(Object.keys(import.meta.glob("../content/white-paper/*.md")).map((f) => f.replace(/^.*\/|\.md$/g, "")));

export const whitePaperLink = (code: string): { href: string; hreflang?: string } =>
  translated.has(code) ? { href: localePath(code, "security/white-paper/") } : { href: "/security/white-paper/", hreflang: "en" };
