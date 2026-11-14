// Sentences that name a store. English says "the App Store" but "Google Play",
// with no "the", so Google Play has sentences of its own in every language.
import type { StoreId } from "../data/stores";
import type { UiKey } from "./index";

const PHRASES = {
  open: "go.open",
  tap: "go.tap",
  oneTime: "pricing.oneTime",
} as const satisfies Record<string, UiKey>;

export const storePhrase = (store: StoreId, phrase: keyof typeof PHRASES): UiKey =>
  store === "google-play" ? `${PHRASES[phrase]}.googlePlay` : PHRASES[phrase];
