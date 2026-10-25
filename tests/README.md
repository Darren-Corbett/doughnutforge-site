# Tests

Browser tests for the built site, with Playwright. Build first (`npm run build`); the tests serve `dist/` with `astro preview` on port 4329.

| Command | What it checks | Network |
|---|---|---|
| `npm run test:layout` | Layout (`layout.spec.ts`), in Chromium, WebKit and WebKit as an iPhone (touch, mobile viewport): every page in every language has no element wider than the screen and no sideways pan, at 320, 360, 390, 768, 1280 and 1440px (phones at 320, 360, 390 and 430px): the header links on one row on phones, images that load, text that fits its box and no links covering each other; the language menu and the FAQ open and fit. In Chromium and desktop WebKit only: axe-core WCAG 2.2 AA in light and dark (`a11y.spec.ts`), and the language menu, store badges per language, keyboard focus rings and the 404 page (`interactions.spec.ts`). | none |
| `npm run test:deploy` | The deploy's live-page check (`scripts/check-live-deploy.mjs`) against a local server: it passes only when `/` and `/download/` are the build just deployed. Also that the deploy job's token can read the Pages settings. In WebKit as an iPhone (`fresh-build.spec.ts`): after a deploy, a fresh visit, a tab opened before it and a page restored by going back all end up on the new build ID, a failed check changes nothing, and a lagging CDN causes one reload at most. | none |
| `npm run test:blockers` | Content blockers on phones, as Safari on an iPhone (WebKit) and Chrome on Android (Chromium). `lists.spec.ts`: every page against every public list phone browsers use (`lists.ts`: every list in AdGuard's iPhone, Safari and Android registries, EasyList, EasyPrivacy, Fanboy's, uBlock Origin's, Brave's and Peter Lowe's): no rule may hide an element, block a request or inject a script, and no request may leave the site. `fallback.spec.ts`: when a store badge is hidden anyway (by address, image, container, removal or late), a visible link with the badge's wording still leads to the store through `/get/`. Also runs daily (`.github/workflows/blockers.yml`). | the lists (cached 12 hours in `test-results/blocker-lists/`) |
| `npm run test:links` | Internal links and `#fragments` in `dist/`, every external link, the live feed, sitemap, robots.txt, apple-app-site-association and 404, and the old forge-privacy redirects for every `?lang=`. | live site and stores |
| `node tests/ios/real-safari.ts <udid>` | The layout checks in real Mobile Safari on an iOS Simulator (macOS with Xcode; see the file for setup). | none |

Narrow a run with `PAGES` (a regular expression on the path) or `LANGS` (a comma list, `en` for the unprefixed pages), for example `LANGS=de,fi PAGES=support npm run test:layout`. `PHONE_WIDTHS=375,414` replaces the phone widths for one run; the default includes 320px (iPhone Display Zoom).

With `AUDIT_DIR=<dir>`, every failed check is also written to `<dir>/findings.jsonl` with a screenshot of the first case of each kind. The audits in `docs/audit/` are written from that.

The Microsoft Store blocks most automated visits with a 403, so its links are opened in a browser and a 403 is reported, not failed.
