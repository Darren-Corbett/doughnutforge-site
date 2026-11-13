// The page counter for doughnut-forge.app: a Cloudflare Worker with a D1 database.
//   POST /hit                  one page view or store tap, from navigator.sendBeacon
//   GET  /summary?window=7|30  totals for the last 7 or 30 complete days, public
//   daily (cron)               deletes totals older than 13 months
// It reads only the Origin, DNT and Sec-GPC headers and Cloudflare's country
// code. It never reads the IP address or the browser, and logs nothing.
import { addOne, deleteBefore, totalsBetween } from "./db.js";
import { dayOf, monthsBefore } from "./dates.js";
import { countsFor } from "./hit.js";
import { perSecond } from "./limit.js";
import { pageList } from "./pages.js";
import { grouped, windowFor } from "./summary.js";

const SITE = "https://doughnut-forge.app";
const MAX_BODY_BYTES = 512;
const KEEP_MONTHS = 13;

const json = (body, status, cache) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": SITE,
      "cache-control": cache,
    },
  });

export function createWorker({ pages, limit, now }) {
  // Both windows end yesterday, so a summary does not change during the day.
  // The cache holds today's two and is emptied when the day moves on.
  const summaries = new Map();

  async function countsOf(request) {
    const headers = request.headers;
    if (headers.get("origin") !== SITE) return null;
    if (headers.get("dnt") === "1" || headers.get("sec-gpc") === "1") return null;
    if (Number(headers.get("content-length")) > MAX_BODY_BYTES) return null;
    if (!limit.allow()) return null;
    const body = await request.text();
    if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) return null;
    const list = await pages.get();
    return list && countsFor(body, list, request.cf?.country);
  }

  // Always the same answer, so a beacon learns nothing about what was counted
  async function hit(request, db) {
    const counts = await countsOf(request);
    if (counts) await addOne(db, dayOf(now()), counts);
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  }

  async function summary(search, db) {
    const window = windowFor(search, now());
    if (!window) return json({ error: "window must be 7 or 30" }, 400, "no-store");
    const key = `${window.days}:${window.to}`;
    if (!summaries.has(key)) {
      if (summaries.size >= 2) summaries.clear();
      const totals = grouped(await totalsBetween(db, window.from, window.to));
      summaries.set(key, { window: window.days, from: window.from, to: window.to, totals });
    }
    return json(summaries.get(key), 200, "public, max-age=3600");
  }

  return {
    async fetch(request, env) {
      const { pathname, searchParams } = new URL(request.url);
      if (request.method === "POST" && pathname === "/hit") return hit(request, env.DB);
      if (request.method === "GET" && pathname === "/summary") return summary(searchParams, env.DB);
      return new Response(null, { status: 404 });
    },
    async scheduled(_controller, env) {
      await deleteBefore(env.DB, monthsBefore(now(), KEEP_MONTHS));
    },
  };
}

export default createWorker({
  pages: pageList({ url: `${SITE}/count-pages.json`, fetch: (url) => fetch(url) }),
  limit: perSecond(50),
  now: () => new Date(),
});
