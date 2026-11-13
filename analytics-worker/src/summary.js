import { daysBefore } from "./dates.js";

export const KINDS = ["page", "language", "country", "referrer", "store"];
const FEWEST_SHOWN = 5;

// Only two fixed windows, both ending yesterday. With free date ranges, totals
// for overlapping ranges could be subtracted to reveal counts below 5.
const WINDOWS = new Map([
  ["7", 7],
  ["30", 30],
]);

/** The window asked for in `?window=7` or `?window=30`, or null for anything else */
export function windowFor(search, now) {
  const keys = [...search.keys()];
  if (keys.length !== 1 || keys[0] !== "window") return null;
  const days = WINDOWS.get(search.get("window"));
  if (!days) return null;
  return { days, from: daysBefore(now, days), to: daysBefore(now, 1) };
}

/**
 * Totals per kind, largest first. Every value below 5 goes into one Others line,
 * whose total is shown only when it is 5 or more (null means fewer than 5).
 */
export function grouped(rows) {
  const totals = {};
  const small = {};
  for (const kind of KINDS) {
    totals[kind] = { rows: [], others: null };
    small[kind] = 0;
  }
  for (const { kind, value, count } of rows) {
    if (!totals[kind]) continue;
    if (count >= FEWEST_SHOWN) totals[kind].rows.push({ value, count });
    else small[kind] += count;
  }
  for (const kind of KINDS) {
    totals[kind].rows.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    if (small[kind] > 0) totals[kind].others = { count: small[kind] >= FEWEST_SHOWN ? small[kind] : null };
  }
  return totals;
}
