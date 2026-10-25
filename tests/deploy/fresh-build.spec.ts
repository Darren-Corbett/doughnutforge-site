// After a deploy, every Safari tab must end up on the new build: a fresh visit,
// a tab opened before the deploy that comes back into view, and a page restored
// by going back or forward (src/components/FreshCheck.astro). Runs in WebKit as
// an iPhone, against a local server that serves dist/ with GitHub Pages' headers
// (max-age=600, ETag, Last-Modified, the query ignored). Build B is dist/ with
// its build ID swapped, in every page and in /build.json. Build first.
import { expect, test, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { extname, join } from "node:path";

const dist = new URL("../../dist/", import.meta.url).pathname;
const buildFile = join(dist, "build.json");
// Build A is the real build; the tests fail if it made no build.json
const A = existsSync(buildFile) ? (JSON.parse(readFileSync(buildFile, "utf8")).id as string) : "missing";
const B = "test-build-b";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

type Live = { html: "A" | "B"; json: "A" | "B" | 404 };

/** Serves dist/ like GitHub Pages. `live` says which build the pages and /build.json come from */
const serve = async () => {
  const live: Live = { html: "A", json: "A" };
  const hits: Record<string, number> = {};
  const server: Server = createServer((req, res) => {
    const path = new URL(req.url!, "http://x").pathname;
    let file = join(dist, path);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    const type = TYPES[extname(file)] ?? "application/octet-stream";
    const isHtml = type.startsWith("text/html");
    if (isHtml) hits[path] = (hits[path] ?? 0) + 1;
    if (path === "/build.json" && live.json === 404) return res.writeHead(404).end();
    // A worker of the kind an older site might have left behind
    if (path === "/old-sw.js") return res.writeHead(200, { "Content-Type": TYPES[".js"] }).end("self.addEventListener('fetch', () => {});");
    if (!existsSync(file)) return res.writeHead(404).end();
    let body = readFileSync(file);
    const build = path === "/build.json" ? live.json : isHtml ? live.html : "A";
    if (build === "B") body = Buffer.from(body.toString("utf8").replaceAll(A, B));
    const etag = `"${createHash("sha1").update(body).digest("hex").slice(0, 16)}"`;
    const headers = { "Content-Type": type, "Cache-Control": "max-age=600", ETag: etag, "Last-Modified": new Date(build === "B" ? 2e12 : 1.9e12).toUTCString() };
    if (req.headers["if-none-match"] === etag) return res.writeHead(304, headers).end();
    res.writeHead(200, headers).end(body);
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  return { base: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, live, hits, close: () => new Promise((r) => server.close(r)) };
};

// Read straight from the page, so a page with no ID fails at once instead of waiting
const buildId = (page: Page) => page.evaluate(() => document.querySelector('meta[name="build-id"]')?.getAttribute("content") ?? null);
/** What Safari fires when a tab comes back into view */
const showAgain = (page: Page) => page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
const settle = (page: Page) => page.waitForTimeout(1500);

let site: Awaited<ReturnType<typeof serve>>;
test.beforeEach(async () => {
  site = await serve();
});
test.afterEach(async () => {
  await site.close();
});

test("the build has an ID, the same in its pages and in /build.json", async ({ page }) => {
  expect(A, "dist/build.json").not.toBe("missing");
  await page.goto(`${site.base}/`);
  expect(await buildId(page)).toBe(A);
});

test("a fresh visit after a deploy gets the new build", async ({ browser, page }) => {
  await page.goto(`${site.base}/`);
  expect(await buildId(page)).toBe(A);
  site.live.html = site.live.json = "B";
  const context = await browser.newContext({ ...test.info().project.use });
  const fresh = await context.newPage();
  await fresh.goto(`${site.base}/`);
  await expect.poll(() => buildId(fresh)).toBe(B);
  await context.close();
});

test("a tab opened before a deploy reloads once to the new build when it comes back", async ({ page }) => {
  await page.goto(`${site.base}/`);
  await settle(page);
  expect(await buildId(page)).toBe(A);
  expect(site.hits["/"]).toBe(1);
  site.live.html = site.live.json = "B";
  await showAgain(page);
  await expect.poll(() => buildId(page)).toBe(B);
  await settle(page);
  expect(site.hits["/"], "one reload").toBe(2);
});

test("pages restored by going back and forward end up on the new build", async ({ page }) => {
  await page.goto(`${site.base}/download/`);
  await page.goto(`${site.base}/roadmap/`);
  await settle(page);
  site.live.html = site.live.json = "B";
  await page.goBack();
  await expect.poll(() => buildId(page)).toBe(B);
  expect(new URL(page.url()).pathname).toBe("/download/");
  await page.goForward();
  await expect.poll(() => buildId(page)).toBe(B);
  expect(new URL(page.url()).pathname).toBe("/roadmap/");
});

test("when the check fails, the page stays as it is and works", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  site.live.json = 404;
  await page.goto(`${site.base}/`);
  await settle(page);
  await showAgain(page);
  await settle(page);
  // The request never reaches the server at all
  await page.route("**/build.json*", (route) => route.abort());
  await showAgain(page);
  await settle(page);
  expect(site.hits["/"], "no reload").toBe(1);
  expect(await buildId(page)).toBe(A);
  await expect(page.locator("h1")).toBeVisible();
  expect(errors).toEqual([]);
});

test("a CDN still serving the old pages causes one reload, never a loop", async ({ page }) => {
  site.live.json = "B";
  await page.goto(`${site.base}/`);
  await expect.poll(() => site.hits["/"]).toBe(2);
  await settle(page);
  await showAgain(page);
  await settle(page);
  expect(site.hits["/"], "one reload, then no more").toBe(2);
  expect(await buildId(page)).toBe(A);
});

test("a service worker left from an older site is removed", async ({ page }) => {
  await page.goto(`${site.base}/`);
  const supported = await page.evaluate(() => "serviceWorker" in navigator);
  test.skip(!supported, "this WebKit build has no service workers");
  const registered = await page.evaluate(async () => {
    await navigator.serviceWorker.register("/old-sw.js", { scope: "/" });
    return (await navigator.serviceWorker.getRegistrations()).length;
  });
  expect(registered, "the old worker was registered").toBe(1);
  await page.reload();
  await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(0);
});
