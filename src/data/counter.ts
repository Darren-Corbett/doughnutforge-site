// The page counter (analytics-worker/): its address, the visitor's opt-out flag,
// and the store links a tap is counted on. COUNTER_URL_FOR_TESTS points the
// counting tests (tests/count/) at a fake counter they answer themselves.
import { storeCode } from "./badges";
import { platforms, storeUrl } from "./stores";

export const counterUrl = process.env.COUNTER_URL_FOR_TESTS ?? "https://doughnut-forge-counter.doughnutforge.workers.dev";

/**
 * The one thing counting may store on the visitor's device: set in localStorage
 * by the opt-out on /stats/, only when the visitor chooses it (CLAUDE.md, privacy policy).
 */
export const optOutKey = "count-off";

/** Each store on sale: its store page (without the query) and the start of its /go/ pages */
export const storeTaps = platforms.flatMap((p) =>
  p.status === "available" ? [{ store: p.store, href: storeUrl(p.store, p.storeId, "").split("?")[0], go: `/go/${storeCode(p.store)}/` }] : [],
);
