// The stores release 3.0 one by one (owner, 18 November 2026), so the site
// switches in stages, never all at once. Each stage follows from
// src/data/release.json and the stores in src/data/stores.ts:
//   android  Android is on sale (it launches with 3.0)
//   first3   the first store sells 3.0: the FAQs on new contact codes and older apps
//   all3     every store on sale sells 3.0: the new format's copy and the white paper
// Until a stage is reached, its strings keep their earlier text (src/i18n/gated.ts).
import release from "./release.json" with { type: "json" };
import { platforms } from "./stores";

export type Stage = "android" | "first3" | "all3";

/** Whether a stage is reached, for a list of platforms and the stores that sell 3.0 */
export const stageReached = (stage: Stage, list: readonly { id: string; status: string }[], storesWith3: readonly string[]) => {
  const onSale = list.filter((p) => p.status === "available").map((p) => p.id);
  if (stage === "android") return onSale.includes("android");
  if (stage === "first3") return onSale.some((id) => storesWith3.includes(id));
  return onSale.length > 0 && onSale.every((id) => storesWith3.includes(id));
};

/** Whether the site has reached a stage */
export const reached = (stage: Stage) => stageReached(stage, platforms, release.storesWith3);
