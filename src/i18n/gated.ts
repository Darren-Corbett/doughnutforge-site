// Strings that change at a launch stage (src/data/stages.ts). Until its stage is
// reached, a key that already had text keeps it, in every language, from
// src/i18n/before/<code>.json; a new key has none, and its page leaves it out.
// After the last stage, this file, src/i18n/before/ and src/data/release.json go.
import type { Stage } from "../data/stages";
import type { UiKey } from "./index";

export const gated: Partial<Record<UiKey, Stage>> = {
  // Android on sale: the platform lists, Google Play and the Android unlock row
  "meta.home.title": "android",
  "home.summary": "android",
  "pricing.where.text": "android",
  "meta.download.title": "android",
  "meta.download.description": "android",
  "faq.platforms.a": "android",
  "faq.restore.a": "android",
  "faq.data.a": "android",
  "press.about.shortText": "android",
  "legal.trademarks.other": "android",
  "meta.roadmap.description": "android",
  "technical.unlock.android.label": "android",
  "technical.unlock.android.text": "android",

  // The first store with 3.0: what people meet first in the new version
  "faq.code.q": "first3",
  "faq.code.a": "first3",
  "faq.older.q": "first3",
  "faq.older.a": "first3",
  "faq.share.a": "first3",
  "technical.visible.older": "first3",

  // Every store with 3.0: the new format's copy and the white paper
  "security.quantum.title": "all3",
  "security.quantum.text": "all3",
  "faq.quantum.a": "all3",
  "meta.technical.description": "all3",
  "technical.glance.exchange": "all3",
  "technical.keys.exchange.text": "all3",
  "technical.keys.signatures.text": "all3",
  "technical.stored.text": "all3",
  "technical.stored.memory.text": "all3",
  "technical.stored.passes.text": "all3",
  "technical.visible.count.text": "all3",
  "technical.limits.sender.label": "all3",
  "technical.limits.sender.text": "all3",
  "technical.limits.visible.label": "all3",
  "technical.limits.forward.label": "all3",
  "technical.limits.forward.text": "all3",
  "roadmap.format.title": "all3",
  "roadmap.format.text": "all3",
  "security.whitePaper.title": "all3",
  "security.whitePaper.text": "all3",
  "security.whitePaper.link": "all3",
  "technical.whitePaper": "all3",
  "footer.whitePaper": "all3",
};
