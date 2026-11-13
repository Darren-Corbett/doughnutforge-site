// The counting tests' copy of the site (build.setup.ts), served in the browser
// as https://doughnut-forge.app or any other address, with the counter faked:
// every beacon is recorded, and /summary answers what each test says.
import type { BrowserContext } from "@playwright/test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

export const SITE = "https://doughnut-forge.app";
export const COUNTER = "https://counter.test";
export const SITE_DIR = new URL("../../test-results/count-site/", import.meta.url).pathname;

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

export type Beacon = { url: string; method: string; type: string | undefined; body: string | null };
export type Summaries = Partial<Record<"7" | "30", unknown>> | "fail";

/**
 * Serves the copy at `origin`, records beacons to the fake counter, answers its
 * /summary with `summaries` ("fail" aborts every request), and stops every store
 * page from loading.
 */
export async function serveSite(context: BrowserContext, { origin = SITE, summaries = {} as Summaries } = {}) {
  const beacons: Beacon[] = [];
  const summaryAsks: string[] = [];
  await context.route(`${origin}/**`, (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);
    let file = join(SITE_DIR, path);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) return route.fulfill({ status: 404, contentType: TYPES[".html"], body: readFileSync(join(SITE_DIR, "404.html")) });
    return route.fulfill({ status: 200, contentType: TYPES[extname(file)] ?? "application/octet-stream", body: readFileSync(file) });
  });
  await context.route(`${COUNTER}/**`, (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === "/hit") {
      beacons.push({ url: request.url(), method: request.method(), type: request.headers()["content-type"], body: request.postData() });
      return route.fulfill({ status: 204 });
    }
    summaryAsks.push(request.url());
    if (summaries === "fail") return route.abort();
    const body = summaries[url.searchParams.get("window") as "7" | "30"];
    if (!body) return route.fulfill({ status: 400 });
    return route.fulfill({ status: 200, contentType: TYPES[".json"], headers: { "access-control-allow-origin": SITE }, body: JSON.stringify(body) });
  });
  await context.route(/^https:\/\/(apps\.apple\.com|apps\.microsoft\.com|play\.google\.com)\//, (route) => route.abort());
  return { beacons, summaryAsks };
}

/** The beacon bodies, parsed */
export const bodies = (beacons: Beacon[]) => beacons.map((b) => JSON.parse(b.body ?? "null"));
