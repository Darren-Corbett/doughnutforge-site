// From 3.0.0 the iPhone, iPad and Android apps are free to download, with one
// in-app purchase, paid once, that unlocks encrypting files, photos and videos.
// Mac and Windows stay a one-time purchase, with nothing locked (owner,
// 20 November 2026). Each phone platform switches when its own store sells 3.0.
import type { Language } from "../i18n";
import { listOf } from "../i18n/list";
import release from "./release.json" with { type: "json" };
import { platforms, storeNames, type PlatformId } from "./stores";

const PHONES: readonly string[] = ["ios", "android"] satisfies PlatformId[];

/** The platforms on sale, split into free to download and one-time purchase, in the order given */
export const pricingSplit = (list: readonly { id: string; status: string }[], storesWith3: readonly string[]) => {
  const onSale = list.filter((p) => p.status === "available").map((p) => p.id);
  const free = onSale.filter((id) => PHONES.includes(id) && storesWith3.includes(id));
  return { free, paid: onSale.filter((id) => !free.includes(id)) };
};

// Device names as a reader lists them: "iPhone, iPad and Android", not "iPhone and iPad and Android"
const DEVICES: Record<PlatformId, string[]> = { ios: ["iPhone", "iPad"], android: ["Android"], mac: ["Mac"], windows: ["Windows"] };

/** How each platform on sale is bought today */
export const pricingNow = pricingSplit(platforms, release.storesWith3);

/** The {free} and {paid} lists for the price lines, and {stores}, the stores selling the in-app purchase ("App Store or Google Play"), in a language */
export const pricingLists = (lang: Language) => {
  const { free, paid } = pricingNow;
  const names = (ids: string[]) => listOf(lang, ids.flatMap((id) => DEVICES[id as PlatformId]));
  const stores = new Intl.ListFormat(lang.hreflang, { type: "disjunction" }).format(platforms.flatMap((p) => (p.status === "available" && free.includes(p.id) ? [storeNames[p.store]] : [])));
  return { free: names(free), paid: names(paid), stores };
};
