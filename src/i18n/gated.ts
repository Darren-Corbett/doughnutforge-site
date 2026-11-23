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
  // Android encrypts text and shares it too (owner, 19 November 2026)
  "meta.home.description": "android",
  "home.lead": "android",
  "home.what.text": "android",
  "meta.features.description": "android",
  "features.lead": "android",
  "blog.cta.text": "android",

  // A phone store sells 3.0: free to download and use, and encrypting files, photos
  // and videos is a one-time in-app purchase (pricing-and-unlock.md v2, 21 November 2026)
  "home.pricing.title": "mobileFree",
  "home.pricing.text": "mobileFree",
  "meta.pricing.title": "mobileFree",
  "meta.pricing.description": "mobileFree",
  "pricing.where.textFree": "mobileFree",
  "pricing.free": "mobileFree",
  "pricing.free.googlePlay": "mobileFree",
  "faq.subscription.a": "mobileFree",
  "faq.free.q": "mobileFree",
  "faq.free.a": "mobileFree",
  "faq.unlock.q": "mobileFree",
  "faq.unlock.a": "mobileFree",
  "faq.restorePurchase.q": "mobileFree",
  "faq.restorePurchase.a": "mobileFree",
  "faq.refund.q": "mobileFree",
  "faq.refund.a": "mobileFree",
  "faq.desktop.q": "mobileFree",
  "faq.desktop.a": "mobileFree",
  "faq.platforms.aFree": "mobileFree",
  "faq.offline.a": "mobileFree",
  "press.facts.priceValue": "mobileFree",
  // Buying goes through Apple and Google, and the Android permissions are not
  // settled: waits for the final white paper and android-permission.md
  "technical.network.none": "mobileFree",
  "technical.glance.network": "mobileFree",

  // The first store with 3.0: what people meet first in the new version
  "faq.code.q": "first3",
  "faq.code.a": "first3",
  "faq.older.q": "first3",
  "faq.older.a": "first3",
  "faq.share.a": "first3",
  "technical.visible.older": "first3",
  "roadmap.small.text": "first3",
  "home.phones.title": "first3",
  "home.phones.text": "first3",
  "features.cta.text": "first3",

  // Every store with 3.0: the new format's copy and the white paper
  "technical.visible.size.text": "all3",
  "technical.encryption.auth.text": "all3",
  "technical.limits.recipients.text": "all3",
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

  // 3.0 is live: the security review replaces the planned audit (Darren, 23 November 2026)
  "security.audit.text": "live3",
  "security.audit.title": "live3",
};
