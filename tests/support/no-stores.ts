// No test may open a real store or hand a store address to macOS. On a Mac,
// WebKit hands an App Store address to the App Store app before any request is
// made (Playwright reports "Navigation canceled by policy check"), so answering
// the request is not enough: the browser must never go to a store address.
//
// - A click on a store link, or on a link with a store's own scheme, is
//   cancelled before the browser follows it. The page's own click listeners
//   still run, so what a click does on the page can still be tested.
// - Every store address in a /go/ page (its forward, and the address its badge
//   sends the browser to) becomes a stand-in on store.test that keeps the real
//   address after it, so tests still check where each one leads.
// - Requests to the stores and to the stand-in are answered with an empty page.
import type { BrowserContext } from "@playwright/test";

export const STORE = /^https:\/\/(apps\.apple\.com|apps\.microsoft\.com|play\.google\.com)\//;
const STORE_SCHEME = /^(itms-apps|itms-appss|itms|macappstore|ms-windows-store|market):/;
const STAND_IN = "https://store.test/";

/** Where a test sees the browser go instead of `url`: https://store.test/apps.apple.com/app/id… */
export const standIn = (url: string) => url.replace(/^https:\/\//, STAND_IN);

/** A /go/ page's HTML with every store address replaced by its stand-in */
export const withStandIns = (html: string) => html.replace(/https:\/\/(apps\.apple\.com|apps\.microsoft\.com|play\.google\.com)\//g, `${STAND_IN}$1/`);

const EMPTY = { status: 200, contentType: "text/html", body: "<!doctype html><title>Store stand-in</title>" };

export async function keepStoresClosed(context: BrowserContext) {
  await context.addInitScript(
    ({ store, scheme }) => {
      const stores = [new RegExp(store), new RegExp(scheme)];
      addEventListener(
        "click",
        (event) => {
          const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
          if (link instanceof HTMLAnchorElement && stores.some((s) => s.test(link.href))) event.preventDefault();
        },
        true,
      );
    },
    { store: STORE.source, scheme: STORE_SCHEME.source },
  );
  await context.route(STORE, (route) => route.fulfill(EMPTY));
  await context.route(`${STAND_IN}**`, (route) => route.fulfill(EMPTY));
  await context.route(
    (url) => url.pathname.startsWith("/go/") && !STORE.test(url.href),
    async (route) => {
      const response = await route.fetch();
      if (!(response.headers()["content-type"] ?? "").startsWith("text/html")) return route.fulfill({ response });
      return route.fulfill({ response, body: withStandIns(await response.text()) });
    },
  );
}
