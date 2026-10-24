# Tests

Browser tests for the built site, with Playwright. Build first (`npm run build`); the tests serve `dist/` with `astro preview` on port 4329.

| Command | What it checks | Network |
|---|---|---|
| `npm run test:layout` | Layout (`layout.spec.ts`), in Chromium, WebKit and WebKit as an iPhone (touch, mobile viewport): every page in every language has no element wider than the screen and no sideways pan, the header links on one row at 360 to 430px, images that load, text that fits its box and no links covering each other; the language menu and the FAQ open and fit. In Chromium and desktop WebKit only: axe-core WCAG 2.2 AA in light and dark (`a11y.spec.ts`), and the language menu, store badges per language, keyboard focus rings and the 404 page (`interactions.spec.ts`). | none |
| `npm run test:links` | Internal links and `#fragments` in `dist/`, every external link, the live feed, sitemap, robots.txt, apple-app-site-association and 404, and the old forge-privacy redirects for every `?lang=`. | live site and stores |
| `node tests/ios/real-safari.ts <udid>` | The layout checks in real Mobile Safari on an iOS Simulator (macOS with Xcode; see the file for setup). | none |

Narrow a run with `PAGES` (a regular expression on the path) or `LANGS` (a comma list, `en` for the unprefixed pages), for example `LANGS=de,fi PAGES=support npm run test:layout`. `PHONE_WIDTHS=320,375` tries other phone widths, such as iPhone Display Zoom (320).

With `AUDIT_DIR=<dir>`, every failed check is also written to `<dir>/findings.jsonl` with a screenshot of the first case of each kind. The audits in `docs/audit/` are written from that.

The Microsoft Store blocks most automated visits with a 403, so its links are opened in a browser and a 403 is reported, not failed.
