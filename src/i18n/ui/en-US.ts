// English (US) (en-US): UK English (src/i18n/ui/en.ts) with US spelling and
// usage, as the app's own en-US differs from en only in spelling.
// Review status and findings: src/i18n/review.json.
import type { Translation } from "../index";
import en from "./en.ts";

// The English-only blog and 404 strings are not part of a translation
const { "nav.blog": _blog, ...shared } = en;
const translated = Object.fromEntries(
  Object.entries(shared).filter(([key]) => !/^(blog|meta\.blog|notFound|meta\.notFound)\./.test(key)),
) as Translation;

export default {
  ...translated,
  "faq.share.a":
    "Ask the other person for their contact card (a .vltc2 file) and add it to your Contacts. Then encrypt the file and choose them as someone who can open it. Send the encrypted file any way you like, such as by email, in a messaging app or on a USB drive. Only the people you chose can open it.",
  "legal.privacy.text": "How Doughnut Forge handles data is explained in the {link}.",
  "press.usage.text":
    "You may use these descriptions, icons and screenshots in articles, reviews and videos about Doughnut Forge. Please do not change the shape or colors of the icon.",
} satisfies Translation;
