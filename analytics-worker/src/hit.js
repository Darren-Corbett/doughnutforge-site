// What one beacon from the site adds to the daily totals. A beacon is either
// {"p": path, "r": referrer} for a page view or {"s": store} for a store tap.
// Anything else adds nothing.

// A lowercase domain name whose last part starts with a letter, so full
// addresses and IP addresses (an intranet's 192.168.1.10) never get in.
const DOMAIN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,61}[a-z0-9]$/;
const NO_DOMAIN = new Set(["direct", "internal"]);

const hasKeys = (beacon, keys) => Object.keys(beacon).sort().join() === keys;

// Cloudflare's two-letter country code. XX (unknown) and T1 (Tor) become unknown.
const countryOf = (code) => (typeof code === "string" && /^[A-Z]{2}$/.test(code) && code !== "XX" ? code : "unknown");

/**
 * The totals one beacon adds to, as [{ kind, value }], or null to count nothing.
 * `list` is the site's page list: { pages: { path: language }, stores: [id] }.
 */
export function countsFor(body, list, country) {
  let beacon;
  try {
    beacon = JSON.parse(body);
  } catch {
    return null;
  }
  if (typeof beacon !== "object" || beacon === null || Array.isArray(beacon)) return null;

  if (hasKeys(beacon, "p,r")) {
    const { p, r } = beacon;
    if (typeof p !== "string" || !Object.hasOwn(list.pages, p)) return null;
    if (typeof r !== "string" || !(NO_DOMAIN.has(r) || DOMAIN.test(r))) return null;
    return [
      { kind: "page", value: p },
      { kind: "language", value: list.pages[p] },
      { kind: "country", value: countryOf(country) },
      { kind: "referrer", value: r },
    ];
  }
  if (hasKeys(beacon, "s") && list.stores.includes(beacon.s)) return [{ kind: "store", value: beacon.s }];
  return null;
}
