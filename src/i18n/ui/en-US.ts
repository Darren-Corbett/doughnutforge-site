// English (US) (en-US): UK English (src/i18n/ui/en.ts) with US spelling and
// usage, as the app's own en-US differs from en only in spelling.
// Review status and findings: src/i18n/review.json.
import type { Translation } from "../index";
import en from "./en.ts";

// The English-only blog and 404 strings are not part of a translation
const { "nav.blog": _blog, ...shared } = en;
const translated = Object.fromEntries(
  Object.entries(shared).filter(([key]) => !/^(blog|meta\.blog|notFound|meta\.notFound|issue)\./.test(key)),
) as Translation;

export default {
  ...translated,
  "faq.quantum.a":
    "In the future, powerful quantum computers may be able to break some of the encryption that is widely used today. Doughnut Forge is designed to resist attacks by future quantum computers, using NIST-standardized post-quantum algorithms alongside classical ones, to protect files and to sign them.",
  "faq.share.a":
    "Ask the other person for their contact card (a .vltc2 file) and add it to your Contacts. Then encrypt the file and choose them as someone who can open it. Send the encrypted file any way you like, such as by email, in a messaging app or on a USB drive. Only the people you chose can open it.",
  "meta.technical.description":
    "The standard methods Doughnut Forge uses: AES-256-GCM, X25519 with ML-KEM-1024, Ed25519 with ML-DSA-87, Argon2id, what can be seen without the key, and its network behavior.",
  "press.usage.text":
    "You may use these descriptions, icons and screenshots in articles, reviews and videos about Doughnut Forge. Please do not change the shape or colors of the icon.",
  "security.quantum.text":
    "Doughnut Forge is designed to resist attacks by future quantum computers, using NIST-standardized post-quantum algorithms alongside classical ones, to protect files and to sign them.",
} satisfies Translation;
