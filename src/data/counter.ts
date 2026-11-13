// The page counter (analytics-worker/): its address, and the store links a tap
// is counted on. While the address is empty nothing is counted, and the page
// script, the footer line and /stats/ are left out of the build.
// COUNTER_URL_FOR_TESTS switches counting on for tests/count/, with a fake
// address the tests answer themselves.
import { storeCode } from "./badges";
import { platforms, storeUrl } from "./stores";

export const counterUrl = process.env.COUNTER_URL_FOR_TESTS ?? "";
export const counting = counterUrl !== "";

/** Each store on sale: its store page (without the query) and the start of its /go/ pages */
export const storeTaps = platforms.flatMap((p) =>
  p.status === "available" ? [{ store: p.store, href: storeUrl(p.store, p.storeId, "").split("?")[0], go: `/go/${storeCode(p.store)}/` }] : [],
);
