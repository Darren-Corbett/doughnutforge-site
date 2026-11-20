// Reference only: pages never show amounts. The stores show the local price.
// Kept here so a price change is recorded in one place.
// From 3.0.0 the iPhone, iPad and Android apps are free to download, with one
// in-app purchase, paid once ("Encrypt files"); each switches when its own
// store sells 3.0 (src/data/pricing.ts), and its old price goes with it.
import release from "./release.json" with { type: "json" };
import { pricingSplit } from "./pricing";

const encryptFiles = [{ amount: 0, inAppPurchase: { name: "Encrypt files", amount: 3.99 } }];

/** The prices in USD, for the stores that sell 3.0 */
export const pricesFor = (storesWith3: readonly string[]) => {
  const free = (id: string) => pricingSplit([{ id, status: "available" }], storesWith3).free.length > 0;
  return {
    currency: "USD",
    mac: [{ amount: 4.99 }],
    windows: [{ amount: 4.99 }],
    ios: free("ios")
      ? encryptFiles
      : [
          { amount: 2.99, until: "2026-12-11" },
          { amount: 3.99, from: "2026-12-11" },
        ],
    // Owner, 14 November 2026: no launch price
    android: free("android") ? encryptFiles : [{ amount: 3.99 }],
  };
};

export const prices = pricesFor(release.storesWith3);
