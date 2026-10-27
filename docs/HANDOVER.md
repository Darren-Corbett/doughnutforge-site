# Handover

Where the site work stands, and what comes next. Read this at the start of every session. Update it at the end of every phase.

- **Last updated:** 27 October 2026, after the /go/ handoff page design (see "/go/ handoff page design, A2"); before that, after the /go/ page fix (see "/go/ pages: a way on and a way back"); before that, after the mobile-first order, the phone and tablet copy and the visitor's own platform first (see "Mobile first"); earlier the same day, after iPhone and iPad went on sale on the site (App Store ID 6821344597) and the identity update moved to Shipped for Mac, iPhone and iPad; before that, 26 October 2026, after the branded fallback badge, the uploaded-archive check, the launch retro, the blog topics file and the session retro (`docs/RETRO.md`); see "Content blockers on phones" and "Weekly blog draft: `/blog-draft`" below
- **Branch:** `main` (trunk-based, no other branches)
- **Full plan:** [`docs/PLAN.md`](PLAN.md), a copy of the saved master plan. Each phase also had its own detailed plan, approved before it was built.
- **Rules:** [`CLAUDE.md`](../CLAUDE.md). Two rules matter most: commit freely on main; ask before every push (a push deploys), and never publish anything without approval.
- **Pre-launch review scope (owner, 23 October 2026):** before launch the owner reviews facts and automated checks only. Copy style is reviewed after launch by an external copywriter (see "Post-launch copy review"). For blog posts, show the owner only each post's claims table for approval, not the full text. The CLAUDE.md copy rules still apply when writing.

---

## Phase status

| Phase | What | Status | Commits |
|---|---|---|---|
| 1 | Astro setup, design system, layout, English home page | Done | `f512825` set up and home page, `b62a608` home page redesign, `4809639` dark header on every page |
| 2 | The other English pages: features, pricing, download, privacy, support/FAQ, press, legal, blog layout, 404, sitemap, robots.txt, social images | Done | `c0d0d83` |
| 3 | All 30 languages, hreflang, language switcher | Done | `71b71f0` translations, `121d53c` first batch marked reviewed |
| 4 | The four launch blog posts in English | **Done**: published 23 October 2026 (claims in `docs/BLOG-CLAIMS.md`) | `ee042f8` setup, `70f46f9` `c78eb76` `89ffe96` `8b7a3c4` `d0aca89` posts, `206e3dd` published |
| 5 | Support issue forms and the "answered issues" pages | **Done** (24 October 2026); see "Phase 5: issue forms and answered issues" below | `583d4cd` `df665db` `9a8627a` tests, `1284373` forms, `129fccb` pages and translations, `e549219` form fields; forge-privacy `b12ffff` |
| 6 | SEO, Lighthouse and accessibility checks, launch | **Done: the site is live** (23 October 2026). Step 9 (Search Console) is done; steps 6 and 8 of `docs/launch/LAUNCH-CHECKLIST.md` are still open | `a2b003c` to `99d31ff`; forge-privacy `a9ed0d8` |
| – | Stale pages in iPhone Safari: build ID check | **Done** (25 October 2026); see "Stale pages in iPhone Safari" below | `cc2f34d` tests, `cc1ccc2` fix |
| – | Content blockers on phones: list test, store fallback, naming check | **Done** (25 October 2026); see "Content blockers on phones" below | `97112b0` `78dde60` tests, `3cc8cde` fix |
| – | Build ID from the content, reproducible builds | **Done** (25 October 2026); see "Build ID from the content" below | `508fc66` `6bc3ceb` `254c60b` `52d77ad` tests, `450f469` restore, `5257e46` fix |
| – | Branded fallback badge, `/go/` pages, uploaded-archive check | **Done** (26 October 2026, live); see "Content blockers on phones" | `828a11d` `aa9d15e` `be191f9` `d668ba6` tests, `44c25cd` `28bc8fe` `de1f21e` fixes |
| – | `/roadmap/`, `/security/` and `/.well-known/security.txt`, in all 30 languages | **Done** (24 October 2026); see "Roadmap and security pages" below | `a6d1d26` tests, `f3a577d` pages and translations |

---

## Where we are now

- **The site is live** at https://doughnut-forge.app in all 30 languages (every language reviewed and indexed), with the four blog posts, served by GitHub Pages from GitHub Actions. **Every push to `main` deploys** within about two minutes. The deploy fails, and the live site stays as it was, if any check in `npm run build:deploy` fails or the live `apple-app-site-association` is missing.
- **The old privacy page redirects:** forge-privacy `a9ed0d8` sends `darren-corbett.github.io/forge-privacy` (with or without the trailing slash, and every `?lang=`) to the matching `/privacy/` page. The store Support URL (forge-privacy issues) is unchanged.
- **Working tree:** clean. Everything up to `ed415e3` is pushed and live (deploy run 40207142250, 25 October 2026). The retro commits after it wait for the owner's yes to push.
- **Post-launch audit (24 October 2026):** [`docs/audit/2026-10-24.md`](audit/2026-10-24.md). It covers the owner's eight live-site issues and the full audit (246 pages × 30 languages × Chromium, WebKit and WebKit iPhone × five widths × two themes, axe, links, and real Mobile Safari in the iOS Simulator). There are no critical findings. The high ones are the deploy's missing live-page check (issue 1), store links not opening in a new tab (issue 5), the header wrapping at 320px with Display Zoom (issue 8), and a German FAQ heading that pans at 320px (issue 7). **Stage 2 (24 October 2026) fixed H1, H2, H3, H4, M4 and L1**; see "Audit fixes" below. Issues 2 (Mac badge) and 7 (English pan), and M1 (desktop widths), are resolved: the owner confirmed on their own devices after Stage 2 that they no longer happen or look fine. The 320px layout tests stay as the guard.
- **Launch incident:** the first deploy left out `.well-known/apple-app-site-association` for about 42 minutes (13:13 to 13:55 UTC), because the Pages upload drops files whose names start with a dot. Fixed in `42fb02c` (`include-hidden-files: true`, plus a live check at the end of the deploy job). Whether Apple fetched the file during the gap is unknown.

- **Unexplained test failure, watch for it again (27 October 2026):** in a full `npm run test:layout` run, `tests/layout/layout.spec.ts` failed once on `/ru/download/` in `webkit-iphone` with "3 layout problem(s)". It passed on a single rerun, in 450 repeats of every download page and in a full `webkit-iphone` rerun with `AUDIT_DIR` set; the problems themselves were not recorded, because `AUDIT_DIR` was not set on the failing run. Cause unknown. On the iPhone profile the visitor-first script moves nothing (iPhone is already first), so it is not a likely cause. If it happens again, rerun that page with `AUDIT_DIR=<folder> PAGES='^/ru/download/$'` and read the findings before fixing anything.

## What is next, in order

0. **Pushed and checked (26 October 2026, deploy run 40293939511):** every step passed, including "Check the uploaded archive holds every built file". The live `apple-app-site-association` lists both apps. Live `/pricing/` and `/de/download/` (WebKit iPhone and Chromium, 360px) show only the official badges without a blocker, and two second badges with the store links hidden. **Confirmed by the owner (26 October 2026):** on their iPhone, with AdGuard for Safari on default settings, the branded fallback badge shows in place of the hidden official badge, in English and in Chinese.
0. **No scheduled CI jobs any more (owner, 26 October 2026; CLAUDE.md: CI is lean).** The deploy runs on pushes that change the site and by hand, and the blocker tests run by hand only (`npm run test:blockers`). After labelling an issue for the site, press "Run workflow" under Actions → Deploy site. The scheduled runs were dropped after this pattern:
   - **25 October:** the 06:17 deploy started at 11:22 UTC, five hours late, and passed. The blocker workflow did not exist yet (pushed at 13:52 UTC).
   - **26 October:** at 10:52 UTC neither the 06:17 deploy nor the first 07:41 blocker run had started. In all, GitHub had started one scheduled run in this repo, ever.
   - **What was checked (26 October, read-only):**
     - both cron lines are valid and on `main`;
     - the API reports both workflows `active` (not disabled);
     - GitHub's status page lists no Actions incident on 24 to 26 October.

     No cause in the repo. GitHub documents scheduled runs as best effort (delayed, sometimes dropped, under load), but the scheduler's queue is not visible from outside, so this is not proven.
   - **Later on 26 October** the blocker workflow was removed (owner): the blocker tests no longer run in CI, only by hand with `npm run test:blockers`. The daily deploy only matters for newly labelled answered issues; every push deploys anyway.
   - Then the owner removed the deploy's 06:17 schedule too, keeping the manual button, so there is nothing scheduled left to check.
0. **Weekly blog draft:** the owner runs `/blog-draft`. The cloud routine is on hold until the owner decides about linking GitHub; see "Weekly blog draft: `/blog-draft`".
0. **Blog backlog approved:** the owner approved all 10 topics in `docs/BLOG-TOPICS.md` (26 October 2026), so `/blog-draft` can draft from it.
0. **Check the Phase 5 deploy** (the push of `7f82405` to this docs commit): the log shows "Fetch answered issues" (expect "0 answered question(s), 0 known issue(s)" until issues are labelled) and every existing check passing. Then confirm the support page links to the three forms in a few languages, and that `/support/answered/` does not exist yet.
1. **Owner: create the two labels** in forge-privacy (Issues → Labels → New label): `site-faq` ("Answer shown on doughnut-forge.app", `#1da1f2`) and `site-known-issue` ("Known issue shown on doughnut-forge.app", `#ff7a00`). On 24 October 2026 neither existed. Also open https://github.com/Darren-Corbett/forge-privacy/issues/new/choose signed in, and confirm it shows the three forms, "Report a security problem privately" and no blank issue (it needs a sign-in, so Claude could not see it).
2. **Audit follow-ups:** all closed.
   - **Stage 2 is live:** deploy run 40087614665 passed, including "Check Pages deploys from GitHub Actions" and "Check the live pages are this build", which ran there for the first time.
   - **M1, desktop widths:** resolved; the owner confirmed they look fine (24 October 2026). No change.
   - **Issues 2 (Mac badge) and 7 (English pan):** resolved; they no longer happen on the owner's iPhone after Stage 2 (24 October 2026). The 320px layout tests stay as the guard.
   - **L2:** left as it is (owner, 24 October 2026).
   - **iPhone and iPad are on sale (owner, 27 October 2026; issue 4 and N1 closed).** App Store ID 6821344597 (`apps.apple.com/app/id6821344597`, no country code). Apple's lookup confirms it is the iPhone and iPad app (`software`, bundle `com.darrencorbett.doughnutforge.mobile`); the Mac app stays 6812778888 (`mac-software`). The switch is one line in `src/data/stores.ts`; the cards, official badges, second badges and `/go/` pages follow from it. The audit's strings changed in all 30 languages (independent review, one blocking finding fixed, re-checked clean), and the "coming soon" captions in two blog posts with `docs/BLOG-CLAIMS.md` rows 2.3, 4.11 and 4.19. `npm run test:links` now checks each Apple ID against Apple's lookup.

   **A branch rollback serves the old "Coming soon" placeholder at `/`** (the repo-root `index.html`), with no other pages, until the root files are removed on or after 6 November. Since H1, the deploy also stops unless Pages deploys from GitHub Actions, and fails if the live `/` and `/download/` are not the pages it built.
3. **Step 8, store listing URLs (owner, in progress).**
   - The app repo session is updating `fastlane/metadata/{mac,ios}/en-GB/privacy_url.txt` and `marketing_url.txt`.
   - Partner Center: the owner updates it by hand.
   - App Store Connect: set the same values by hand if the next fastlane upload does not send them. Privacy `https://doughnut-forge.app/privacy/`, Marketing `https://doughnut-forge.app/`, Support unchanged (`https://github.com/Darren-Corbett/forge-privacy/issues`).
4. **When the owner confirms the Windows package is live:** in `src/data/roadmap.ts`, set "Identity protection for Windows" (`roadmap.identityWindows`) to `"shipped"`. Since 27 October 2026 the identity update shows as Shipped for Mac, iPhone and iPad (owner), and the Windows item stays under Next. Then consider merging the two items back into one, which needs retranslating.
4a. **Waiting on the owner's test: restoring an iPhone identity on a Mac (27 October 2026).** When the owner confirms it works, add the example to `faq.restore.a` ("…for example from an iPhone to a Mac, or from a Mac to a Windows PC."), retranslate through the review, and stamp. Until then the answer keeps only the Mac to Windows example. The iPhone app has Restore Identity with the same 24-word phrase (`src/components/identity/mobile-restore-identity-form.tsx` in the app repo), but that is not yet tested across platforms.
5. **On or after 6 November 2026: step 6, remove the old root files.** Remove the root copies of `.well-known/`, `CNAME`, `.nojekyll`, the icons, `site.webmanifest` and `index.html`, and make `scripts/check-production-files.mjs` check the built files alone. Until then they are the rollback: switch Pages back to "Deploy from a branch" (`main`, root) **and push any commit**, because a source switch alone does not rebuild. That rollback restores only the apps' `apple-app-site-association`: the site itself becomes the old "Coming soon" placeholder at `/`, with no other pages. While Pages deploys from a branch, every push still starts the Actions deploy, which stops at "Check Pages deploys from GitHub Actions". That failure is expected during a rollback.
6. **Step 9, Google Search Console: done (owner, 24 October 2026).** A Domain property for `doughnut-forge.app`, verified by a DNS TXT record, and `https://doughnut-forge.app/sitemap-index.xml` submitted. Nothing changed on the site: no tag, file or script, and no visitor tracking.
7. **11 December 2026:** iOS launch pricing ends. Pages show no prices; update `src/data/prices.ts` so the record stays true.
8. **When the copywriter's notes arrive:** follow "Post-launch copy review" below.
9. **New blog posts:** no more than one or two a week, each starting as `draft: true` with a claims table in `docs/BLOG-CLAIMS.md`, published only on the owner's say-so.
10. **Retro follow-ups (25 October 2026), for the owner to decide** (`docs/RETRO.md`):
   - Done (26 October 2026, `44c25cd`): the text link marks only the badge wording as English; the forwarding pages (now `/go/`) have a `main`, an `h1` and a 44px link.
   - FreshCheck reloads once per new build ID. If that reload gets the old page (a CDN edge not caught up), the tab stays on it until the next deploy or a manual reload.
11. **By 24 September 2027: renew `security.txt`.** Set `Expires` in `public/.well-known/security.txt` to one year from that day, and move this reminder a year on. The build fails from 24 September 2027 (30 days before the 24 October 2027 expiry) until it is renewed.

### Later (owner, 26 October 2026; not built yet)

- **Optional, small (owner, 27 October 2026): the plain store button on /go/ pages without JavaScript.** With JavaScript off and the badge image blocked, the page shows the empty badge space and "Back to Doughnut Forge", but not the plain "Open the App Store" button, because nothing can notice the badge is missing. A fix: show that button whenever JavaScript is off (for example a `<noscript>` style), and test it in `tests/blockers/go-pages.spec.ts` ("without JavaScript").

- **A static redirect for the old `/get/` addresses.** `/get/<store>/<language>/` was live for about a day before `/go/` replaced it, and now returns 404.
- **Run `npm run test:links` locally before a push**, by hand or with a local git hook, never a GitHub Action. Today it runs only when asked.

## /go/ handoff page design, A2 (27 October 2026)

- **Picked by the owner** from three previews (dev-only pages, deleted after the pick, never built): A2, one card on the night colour. Copy (owner): the platform name, "Get Doughnut Forge" (`button.getApp`), "Tap below to open the {store}." (`go.tap`), "One-time purchase, never a subscription." (`home.pricing.title`), "Works without the internet." (`go.offline`), "Back to Doughnut Forge" (`go.back`). "Welcome back" and "Did the App Store open?" were dropped.
- **States** (`src/pages/go/[code]/[lang].astro`): a head script adds `opening` before the page is drawn: icon, platform, heading and a progress bar while it forwards. It drops `opening` on `pageshow` (from the back-forward cache), when the tab comes back into view, or after 3 seconds. Without JavaScript the page is in the come-back state from the start.
- **Way on:** the badge (`/s/<hash>.svg`, empty alt, wording as screen-reader text) links to the page itself; a tap goes straight to the store. If the badge is not drawn, the plain "Open the App Store" button (`go.open`) replaces it. Without JavaScript there is no such check, so a blocked badge image leaves only the way back.
- **Tests:** `tests/blockers/go-pages.spec.ts` (copy in six languages, every blocker simulation from `tests/blockers/simulations.ts`, each state, no JavaScript, reduced motion, the badge tap) and `tests/layout/go-pages.spec.ts` (all 90 pages, both states, 320 and 390px). They serve the pages with the forward an hour away: a stand-in store answer leaves Chromium with a navigation that never finishes.
- **Lighthouse** (a copy without the forward): 100 performance, accessibility and best practices, mobile and desktop, no layout shift. SEO 66, only because the page is `noindex` on purpose.

## /go/ pages: a way on and a way back (27 October 2026)

- **Bug (owner, iPhone, AdGuard default):** tapping the branded fallback App Store badge opened `/go/ef9771/en/` in a new tab, which forwarded to the App Store. Back in Safari, the tab showed only the heading "Download on the App Store". Reproduced on the live site in WebKit iPhone: with a blocker rule that hides store links, the page's only link (straight to `apps.apple.com`) was hidden.
- **Fix:** `src/pages/go/[code]/[lang].astro` never links to the store. Its button ("Open the App Store", or the right store; `go.open`) links to the /go/ page itself, so blockers leave it, and a small inline script sends the tap straight to the store address from the page's forward tag; without the script the tap reloads the page, which forwards. "Back to Doughnut Forge" (`go.back`) links to the download page in the page's language, in the same tab. Both are plain parts of the page, so they show whenever Safari shows the tab again. Two strings in all 30 languages (independent review, no findings).
- **Tests:** `tests/blockers/go-pages.spec.ts`, on the iPhone and Android profiles: every store in five languages under five blocker rules; the page shown again after leaving it; the retry for each store. Tests simulate the return from the store with a 204 answer (an aborted request leaves Chromium on its error page).
- **Not provable in a test browser:** WebKit's iPhone mode sometimes cancels a tapped `apps.apple.com` link in the browser ("Navigation canceled by policy check") and sometimes loads it; why it varies is not known (perhaps it hands the link to the App Store app, as Safari does, but that is not proven). For Apple links on iPhone the test accepts either; everywhere else the store page must load. The App Store app opening cannot be seen in a test. **The owner should check once on the iPhone, with AdGuard on:** tap a fallback badge, come back to Safari, tap "Open the App Store" (the App Store should open) and "Back to Doughnut Forge".

## Mobile first (27 October 2026)

- **Order:** set once in `src/data/stores.ts` (`mobileFirst`): iPhone and iPad, Android, Mac, Windows, Linux. Platforms on sale come first, then those still coming, so Android sits with Linux until it ships and then moves to second by itself. Cards, badge rows, the press fact sheet, structured data and the download title and description follow it. Tests: `tests/layout/stores.spec.ts`.
- **Copy (approved by the owner):** leads, search descriptions, the features title, the offline paragraph, the press short description, the buying FAQ and pricing text now cover iPhone and iPad as well as computers. Phones never get "folders" (the iPhone app does not encrypt them), and copy names iPhone and iPad, not "phone", until Android ships. The pages no longer use the Mac listing's computer-only parts; `scripts/sync-from-app.mjs` writes only `headline` and `never` now. The offline paragraph (`offline.text`) is the iPhone listing's paragraph without "You pay once". Independent review: five Thai comma errors fixed, re-checked clean.
- **The visitor's own platform first:** `src/components/VisitorFirst.astro`, an inline script after each list, moves the visitor's platform to the front if it is on sale (iPhone; iPad, which calls itself a Mac but has touch; Mac; Windows; Android once on sale). It runs before the first paint, hides nothing, stores and sends nothing, and leaves the fixed order if it fails. Each badge and its two fallbacks carry `data-platform` and move together. Tests: `tests/layout/visitor-first.spec.ts` (six platforms, 320px and 1280px, Chromium and WebKit, a failing script, no scripts, and a blocker).
- **Checks:** `build:deploy` 0/0/0; layout 2131 passed plus one intermittent failure on `/ru/download/` in WebKit iPhone (3 layout problems, not seen again in 450 repeats of the download pages and a full rerun; cause unknown); blockers 804/804; links 42/42 (a first run hit one 503 from the live site); reproducible builds match; Lighthouse on the home page 100 in every category on mobile and on desktop as a Windows visitor. The only layout shift (CLS 0.011 mobile, 0.002 desktop) is the home specimen's scan animation, not the store lists.

## Social image fonts in the repo (26 October 2026)

- **Why:** the deploy installed the Noto fonts with `apt-get` before every build. GitHub's mirror stalled on the 61 MB CJK download three times on 26 October (runs 40295571635, 40302985240 and 40304927284), and the last two failed the deploy. The fonts only draw the non-English social preview images. A 10-minute limit and apt retries were tried first and did not help.
- **Now:** the fonts are committed in `build-fonts/` (about 20 MB: Noto Sans ExtraBold and Black, Noto Sans CJK Black, Noto Sans Thai Black and Noto Sans Devanagari Black, with each source's OFL licence; sources in `build-fonts/README.md`). The deploy has no font step.
- **How `make-og.mjs` uses them** (`scripts/og-fonts.mjs`): before sharp loads, it points fontconfig at `build-fonts/fonts.conf` (that folder only) and sets `PANGOCAIRO_BACKEND=fc`. Without that setting, on a Mac sharp drew with the system's fonts (Core Text) and ignored fontconfig; that was found and tested while making this change. Before drawing, every title is checked against its fonts, and a missing character stops the build, naming it.
- **Build tools only:** no font file is in `public/`, `src/` or `dist/`.
- **The committed English images** (`public/og/*.png`) were made on the Mac with Helvetica Neue and are unchanged. Running `node scripts/make-og.mjs` again would redraw them in Noto Sans. Not done: the owner can decide.
- **Tests** (`tests/checks/og-fonts.spec.ts`): the fonts and licences are present; no font file anywhere the site serves; no font download in the deploy; every language drawn with no missing glyphs; a missing glyph fails the run; the system's fonts never fill in.

## Weekly blog draft: `/blog-draft` (26 October 2026)

- **How it runs:** the owner types `/blog-draft` in this repo, about once a week. The project skill is `.claude/skills/blog-draft/SKILL.md`; it runs only when typed.
- **Step 1, replies to earlier drafts.** It reads the comments on each earlier "Blog draft:" doc:
  - "publish": copy the post into `src/content/blog/en/` as `draft: true`, add the claims rows to `docs/BLOG-CLAIMS.md`, build and test, show the claims table, set `draft: false` only on the owner's yes, update the log, and ask before the push;
  - "bin": log it as binned, return a backlog topic to "approved", and retitle the doc;
  - "changes: ...": revise the doc for review again, publishing nothing.
- **Step 2, the topic** (`docs/BLOG-TOPICS.md`): the past week's privacy or security news first, if it fits honestly; otherwise the next "approved" backlog topic; otherwise three proposals. It runs the repeat checks against the log, every earlier draft doc and the posts.
- **Step 3, the draft:** one Claude Doc, "Blog draft: <title>", with:
  - a weekly note (why this topic, and every repeat check);
  - the post;
  - a claims table checked live;
  - image notes;
  - a footer explaining "publish", "bin" and "changes".

  Writing rules: the launch-post rules, plus the topical guardrails.
- **Step 4:** a one-line summary, also sent as a push notification when one is available.
- **Cloud routine: on hold, waiting on a GitHub decision (owner, 26 October 2026).**
  - The scheduled cloud routine "Weekly blog draft" was agreed: Mondays 07:00 UTC, Opus 5.5, the Claude Docs connector, read-only.
  - It was not saved. A cloud routine clones the repo from GitHub, so it needs the owner's Claude account linked to GitHub. The server refused without that link ("Connect your GitHub account before saving a scheduled task that uses a GitHub repository").
  - The owner has decided not to link GitHub for now, and to keep approving every push personally. `/blog-draft` does the same job, run by hand.
  - If the owner links GitHub later (`/web-setup`, or https://claude.ai/connect-github), the routine can be saved with the same prompt as the skill. It must stay read-only: no commits, pushes or branches.

## Stale pages in iPhone Safari (25 October 2026)

- **What happened:** on Sunday 25 October the owner's iPhone Safari still showed Friday's site, two days and several deploys later.
- **Evidence (live, 25 October):**
  - `/`, `/download/`, `/roadmap/`, a hashed `/_astro/Base.Cq88Ng4X.css`, `/site.webmanifest`, `/sitemap-index.xml` and `/.well-known/apple-app-site-association` all return `cache-control: max-age=600`, an ETag and `last-modified: Sat, 24 Oct 2026 13:39:39 GMT` from Fastly (`x-cache: MISS`). So the CDN served the newest build, and HTML is fresh for 10 minutes only. **The headers cannot explain two days**, and GitHub Pages does not let the site set its own.
  - **No service worker**, ever: `/sw.js` and `/service-worker.js` are 404, `git log --all -S serviceWorker` finds nothing, and no page registers one.
  - **Manifest:** `display: standalone`, with no `start_url`, `scope` or `id`. A Home Screen copy runs as its own web app and keeps its page in memory. Unchanged.
  - CSS and images are hashed; the only scripts are inline; there are no cache `<meta>` tags. These are not the cause.
  - No `unload` handlers, so pages go into Safari's back-forward cache.
- **Cause (most likely):** iOS Safari does not refetch a tab it comes back to. It redraws it from memory or the back-forward cache, and a tab it had unloaded is restored from the disk cache whatever `max-age` says (WebKit loads history and restored tabs that way). A tab opened on Friday shows Friday's page until a real reload. Nothing on the server can force this; only the page can notice it is old. **No hosting move is needed.**
- **Fix:**
  - Every build gets an ID, **a hash of the built site's content** (since the content-ID change below). Every page carries it in `<meta name="build-id">`, and `/build.json` holds it.
  - `src/components/FreshCheck.astro` (in `Base.astro`): on every `pageshow` and whenever the tab comes back into view, it fetches `/build.json?t=<now>` with `cache: "no-store"`. If the live ID differs, it reloads once.
  - Same origin, sends nothing, and any failure leaves the page as it is. It also removes any old service worker.
  - **Reload guard:** `sessionStorage` key `build:<path>` holds the ID that page last reloaded for, so a CDN still serving the old page causes one reload, never a loop.
  - `check-production-files.mjs` fails unless `build.json` and the pages share the ID. The deploy's live check now covers `/build.json` too.
- **Web storage exception (owner, 25 October 2026):** the website may use `sessionStorage` for this guard only. It holds only the build ID and clears when the tab closes. Recorded in `CLAUDE.md`. **The app's no-web-storage rule still applies to the app and is never to be relaxed there.**
- **Tests:** `tests/deploy/fresh-build.spec.ts` (`deploy-webkit`, WebKit as an iPhone 13) runs against a local server with GitHub Pages' headers. After a switch to a new build, it checks a fresh visit, a tab opened before the switch that comes back into view, pages restored by going back and forward, a failed check (404 and an aborted request), a lagging CDN (one reload at most) and an old service worker. `tests/checks/check-production-files.spec.ts` checks the build ID check.
- **Commits:** `cc2f34d` tests (12 failed before the fix), `cc1ccc2` fix. Pushed with the owner's yes on 25 October 2026.
- **Checks before the push:**
  - `build:deploy`: 0 errors, 0 warnings, 0 hints;
  - fresh-build 7/7 (35/35 repeated five times), deploy and checks 20/20, layout 1976/1976;
  - checked at 360, 768 and 1280px in English and German: no pan, no extra reload, no errors;
  - Lighthouse on the home page: 100 in every category, mobile and desktop.
- **Deploy:** run 40191021731 passed every step, including "Check the live pages are this build" (now with `/build.json`) and "Check apple-app-site-association is live". Afterwards:
  - the live `/build.json` (`cc1ccc2-mvnrx4f5`) matched the `build-id` on `/`, `/download/`, `/roadmap/` and `/de/support/`;
  - `build.json` is not in the sitemap;
  - a live WebKit iPhone visit made one load and two checks, with no reload and no errors.
- **Settled (owner, 25 October 2026):** the first ID included the build time, so the daily rebuild made every open tab reload once a day for nothing. It is now a content hash; see "Build ID from the content" below.
- **Limit: pages saved before the fix cannot update themselves.** The check is part of each page, so a tab still showing a page from before `cc1ccc2` (25 October 2026) needs one manual reload; after that it updates itself after every deploy. An earlier note here said old tabs would switch by themselves, which was wrong.
- **Correction (25 October 2026):** a note in `a3017b9` said the owner's iPhone still showed Friday's `/pricing/` because its Mac badge was missing. That was wrong: the page was current, and AdGuard's default behaviour hid the badge (see "Content blockers on phones").
- **Confirmed:** a deploy that changed no site file (run 40194019642, the docs commit `9bd8524`) kept the build ID `be46717c11f5cf72`, and every check passed.


## Content blockers on phones (25 and 26 October 2026)

- **What happened:** AdGuard for Safari on the owner's iPhone hides the Mac App Store badge on `/` and `/pricing/`. "Reload Without Content Blockers" brings it back. The same symptom was audit finding M3 on launch day.
- **Correction (owner, 26 October 2026):** it is **AdGuard's default behaviour, with no user rules involved**. An earlier note here said it was a user rule the owner deleted; that was wrong. On 26 October the owner's iPhone, on AdGuard's default settings, still showed the text link instead of the badge.
- **Cause: not identified, and no longer pursued (owner, 26 October 2026).** None of these hides it:
  - 25 October: 536 public lists (every list in AdGuard's iPhone, Safari and Android registries, EasyList, EasyPrivacy, Fanboy's, uBlock Origin's, Brave's and Peter Lowe's), run on every page through `@ghostery/adblocker` as an iPhone and an Android phone;
  - 26 October: every rule from AdGuard's own Safari and iOS builds of its default and annoyance filters that applies to the site (17,216 selectors, extended CSS included, read with AdGuard's ExtendedCss in WebKit), their network rules, and the rules AdGuard for Safari had compiled on the owner's Mac.

  Why the published lists cannot show it: see `docs/RETRO.md`, 26 October. **The site now assumes blockers hide store badges in ways no one can predict, and works around any of them.**
- **What phone browsers block:**
  - Safari: content blockers (AdGuard, 1Blocker, Wipr, Ghostery);
  - Brave: built in;
  - Firefox for Android: uBlock Origin or AdGuard;
  - Samsung Internet: AdGuard or Adblock Plus plug-ins;
  - DuckDuckGo, Firefox for iOS, Edge, Vivaldi, Opera: tracker or ad lists;
  - Chrome: no user blocking.
- **The fix, three layers per badge** (`src/components/StoreBadge.astro`, `src/components/StoreFallback.astro`):
  1. **The official badge**, linking straight to the store. Visitors without a blocker see only this, exactly as before.
  2. **A second branded badge**, shown in its place when the first is not drawn for any reason: hidden, zero size, invisible, transparent, moved off the page, removed, its container hidden, or its image blocked, at load, later, or when an image fails. It is the same official file, byte for byte, served as `/s/<first 12 hex of its SHA-256>.svg` (`src/pages/s/[name].svg.ts`, built for every store's artwork). It has an empty `alt`, the badge's wording as screen-reader text, and neutral names (`get-art`, `data-get`), so nothing in it says store, badge, app or download. It opens `/go/<code>/<language>/` in a new tab, where the code is the first six hex characters of the SHA-256 of the store's ID (`e18fb8` and `ede629` today), so the address names no store either (`44c25cd`, `de1f21e`, 26 October). The first version linked to `/get/mac-app-store/…`; the review found that one rule on link addresses hid all three layers.
  3. **The plain text link** in the badge's wording, to the same `/go/` page, only if the second badge is not drawn either. Only the wording is marked `lang="en"`, so its "(opens in a new tab)" note is read in the page's language.

  If the badges' container is hidden, the fallbacks move out to just after it, in their order.
- **`/go/<code>/<language>/`** (`src/pages/go/[code]/[lang].astro`; `/get/` before 26 October): forwards at once to the same store page as the badge. It has a `main`, an `h1` (the badge wording) and a link to tap, the store's name, at least 44px tall. There are 60 of these pages (2 stores × 30 languages): noindex, no social image (`check-og` skips forwarding pages), not in the sitemap. On iPhone the App Store may open as Apple's web page, because the visit comes through a forwarding page; normal badge taps are unchanged.
- **Names:** `check-blocker-names.mjs` fails the build on class, id or built-file names with words blockers hide (badge, banner, ad, promo, sponsor, popup, social).
- **Guards:**
  - `tests/blockers/fallback.spec.ts` (WebKit as an iPhone 13 and Chromium as a Pixel 7) simulates every way of hiding a badge on six pages, without relying on any blocker's rules:
    - the ways: hidden by link address (including any address that mentions app, store or get), zero size, invisible, transparent, off the page, image hidden by description, image blocked, container hidden, removed, hidden late;
    - each one must show the second badge (drawn, the official file byte for byte, no store word in any attribute, new tab, the right accessible name) and no text link;
    - hiding both badges must show the text link;
    - also covered: the text link's `lang`, the `/go/` page's `main`, `h1` and 44px link, and that the iPhone and iPad artwork is built.
  - `scripts/check-artifact.mjs` (deploy, before publishing): the uploaded archive holds every built file, and the build has `apple-app-site-association` (`tests/checks/check-artifact.spec.ts`).
- **Results (26 October 2026, after `de1f21e`):**
  - `build:deploy`: 0 errors, 0 warnings; two builds of the same commit are the same;
  - blockers 804/804 (public lists and fallback, iPhone and Android), checks 36/36, layout 1976/1976 (WebKit iPhone at 320px included);
  - `/`, `/pricing/`, `/download/` in English and German at 360, 768 and 1280px, in WebKit and Chromium, with and without a simulated blocker: 72/72 with no pan and no errors, two second badges with a blocker and none without;
  - Lighthouse on the home page: 100 in every category, mobile and desktop.
  - `tests/blockers/lists.spec.ts` (unchanged) runs every public list on every page.
  - The lists are downloaded fresh and cached 12 hours in `test-results/blocker-lists/`.
  - Both run **by hand only**, with `npm run test:blockers`: no CI workflow runs them (owner, 26 October 2026; `.github/workflows/blockers.yml` removed, and `tests/deploy/check-live-deploy.spec.ts` checks no workflow brings them back). No AdGuard-specific check.
- **iPhone and iPad:** when App Review approves 0.4.44, the switch is one line in `src/data/stores.ts`; see "What is next".
- **Running tests locally:** `astro preview` now starts in the background and its command exits at once, which Playwright reads as a failed web server. Start it first (`npx astro preview --port 4329`) and the tests reuse it.

## Build ID from the content (25 October 2026)

- **What:** the build ID is the first 16 hex characters of a SHA-256 over every file in `dist/` (path and bytes), without `build.json`, with each page's `build-id` put back to the placeholder `__BUILD_ID__`. A rebuild that changed nothing keeps its ID, so open tabs reload only when something really changed, and the deploy's live check passes as usual.
- **How:** pages are built with the placeholder (`src/data/build.ts`). `scripts/build-id.mjs` runs after `astro build` and `make-og` in every build script. It stamps the hash into every page and writes `build.json`, so the `src/pages/build.json.ts` endpoint is gone. Stamping again changes nothing. **Anything that writes to `dist/` must run before it**; `check-production-files.mjs` fails if the ID is not the content hash or a page still has the placeholder.
- **Builds were not reproducible, and now are:** two builds of the same commit differed. Astro keeps one file for identical SVGs and names it after whichever it reads first, and that order varies. The store badges `en-US` (all three stores) and `es-MX` (Microsoft) were byte-identical to `en` and `es`, so the shared file was `en.…svg` or `en-US.…svg` by chance.
  - **Fix:** those four files are removed. `StoreBadge.astro` uses the language's file with the regional alt text, and `fetch-badges.mjs` no longer writes a regional badge identical to its language's.
  - **Guard:** `check-production-files.mjs` fails if two SVGs in `src/assets` are identical.
  - `scripts/asset-names.mjs` also names any asset Rolldown makes from identical files after the first name in sorted order (it does not reach Astro's SVG step).
  - **Proof:** three `build:deploy` runs of the same tree gave the same ID and identical files.
- **Commits:** `508fc66` tests, `6bc3ceb` a test type fix that **by mistake also removed `src/pages/build.json.ts`** (a staged removal), `254c60b` and `52d77ad` tests, `450f469` restores that file (history is never rewritten), `5257e46` the fix.
- **Checks before the push:**
  - `build:deploy`: 0 errors, 0 warnings, 0 hints;
  - checks and deploy 38/38, layout 1976/1976;
  - 8 pages (including `/en-us/download/` and `/es-mx/download/`) at 360, 768 and 1280px: no pan, no reload, no errors;
  - Lighthouse on the home page: 100 in every category, mobile and desktop.
- **Deploy:** run 40193446748 passed every step, including "Check the live pages are this build" and "Check apple-app-site-association is live". Afterwards:
  - the live `/build.json` was `be46717c11f5cf72`, the same as the `build-id` on `/`, `/download/`, `/roadmap/`, `/de/support/`, `/en-us/download/` and `/es-mx/download/`;
  - no live page had the placeholder;
  - every badge on those pages loaded;
  - `apple-app-site-association` listed both apps.
- **CI and local IDs differed** (`be46717c…` live, `c3dc68b6…` on the owner's Mac) because the machines' builds differed, for example the fonts in the social images. Since 26 October 2026 both draw the images with the same committed fonts (`build-fonts/`), so the IDs may now match; not yet confirmed. Only CI's builds go live.

## Phase 5: issue forms and answered issues (24 October 2026)

- **Issue forms** in forge-privacy (`b12ffff`), kept in step with `docs/forge-privacy/.github/ISSUE_TEMPLATE/`, which the tests check (`tests/forms/issue-forms.spec.ts`). Change them here first, then copy them across. There are three forms: bug report, question and feature idea.
  - Each opens with the bold never-attach warning and "Issues are public".
  - Platform is a dropdown, App version a text field, and no field asks for anything personal.
  - `config.yml` turns blank issues off and adds "Report a security problem privately", which goes to private vulnerability reporting.
  - GitHub reported no errors in any form (checked on each file's page).
- **What appears on the site:**
  - Only issues the owner labels `site-faq` (Answered questions) or `site-known-issue` (Known issues), open or closed. **A label means the owner has checked the issue is fit to publish.**
  - The answer is the owner's latest comment (`Darren-Corbett`); an issue the owner has not commented on is left out.
  - Only the title, the question and the answer are shown, as plain text, with `@handles` replaced and no usernames, avatars or other comments.
  - Form fields read as "Platform: Mac", empty fields and the "Your question" heading are left out, and longer fields keep their headings.
- **How it is built:**
  - `scripts/fetch-issues.mjs` uses the public API with no token and writes `src/data/issues.json`. On any failure it keeps the committed data.
  - The deploy runs it before every build. There is no daily run any more (26 October 2026): after labelling an issue, press "Run workflow" under Actions → Deploy site.
  - The committed `issues.json` has empty lists. To refresh it, run `npm run fetch:issues`, then make a commit, shown for approval.
  - Unauthenticated requests are limited to 60 an hour per IP, and runners share IPs. If a day's fetch is limited, that deploy uses the committed data.
- **Pages:**
  - `/support/answered/` and `/support/known-issues/` are built in all 30 languages, and only when they have an issue. The support page links to them only then.
  - Each issue has one English page, `/support/<list>/<number>-<slug>/`, like a blog post.
  - `check-issues.mjs` checks the data and the pages in every build.
- **Test builds:** `ISSUES_FILE=tests/fixtures/issues.json npm run build` builds with three sample issues, local only.
- **Translations:**
  - The 13 new strings were reviewed by four independent reviewers. Their one blocking finding (zh-TW `meta.known.description`) is fixed and re-checked.
  - Every language is stamped. The `issue.*` strings are English only, like the blog.
- **Checks:**
  - `build:deploy` has 0 warnings;
  - forms 8/8, checks 2/2, deploy 7/7, full layout 1976/1976;
  - with sample issues: 368 pages, support and issue tests 1037/1037;
  - checked by hand at 360, 768 and 1280px in English and German;
  - Lighthouse 100/100/100/100 on mobile and desktop.

## Also on 24 October 2026

- **Favicons** (`e87d47c`): `favicon.ico` (16, 32 and 48px) and the 16 and 32px PNGs have iOS-style squircle corners and transparent corners. They are made from the app's square iOS master by `node scripts/make-favicons.mjs`. `apple-touch-icon.png` and the manifest icons stay square. The repo-root copies (the rollback) are unchanged.
- **Roadmap and security hreflang** (`f7ec59c` test, `09a141c` fix): the two pages were missing from `translatedPages`, so they had no hreflang links and the language menu went to each language's home page. **Guard** (`edd1737` test, `ae161ce` check): `check-hreflang.mjs` now fails when a page built in more than one language has no hreflang links.

## Roadmap and security pages (24 October 2026)

- **`/roadmap/`** (`src/views/RoadmapPage.astro`, items in `src/data/roadmap.ts`): shipped, next and later only. Every item not yet shipped carries a "Planned" label. Never add dates, version numbers, audit finding codes, open weaknesses, severity counts or branch names (`tests/layout/pages.spec.ts` checks for dates, codes and versions in every language). A section with no items is not shown, so "Shipped" is hidden for now.
  - Next: identity protection (the 0.4.44 work: `1229e88`, `d0a7694`, `a036397` in the app repo), stricter protection, Doughnut Forge for Android.
  - Later: an independent security audit.
- **`/security/`** (`src/views/SecurityPage.astro`): on-device only, no servers and no account, post-quantum encryption, keys stay on the device, not audited yet (with a link to the roadmap), and "Report a vulnerability". Reports go to `site.reportUrl`, GitHub's private vulnerability reporting on forge-privacy (opens in a new tab), never to public issues. The page promises a reply and no legal action against good-faith research. It never says the sender of a file is verified or that an audit has happened.
- **Private vulnerability reporting** on forge-privacy: turned on by the owner and confirmed on 24 October 2026 (the API returned `"enabled": true`, and the Security tab shows "Report a vulnerability"). The deploy now stops before deploying if it is ever off.
- **`/.well-known/security.txt`** (RFC 9116): Contact (the same reporting page), Expires 2027-10-24, Policy (`/security/`), Canonical, Preferred-Languages en. Not signed, and not copied to the repo root (the root files are only the rollback for the apps' association file). `check-production-files.mjs` checks it in every build. The deploy's live check compares the live copy with the build.
- **Claims and sources:**
  - on the device, never uploaded: the store listings;
  - no servers, no account: the live home copy;
  - post-quantum: the store listings and `faq.quantum.a`;
  - keys never on a server or sent: `faq.storage.a`;
  - not audited: the Phase 4 facts below;
  - reports are private to the maintainer: GitHub private vulnerability reporting.
- **Translations:** drafted by four subagents, then reviewed by four independent reviewers.
  - **Blocking findings (5), all fixed:**
    - fr "never uploaded" said "never sent online";
    - it "Next" read the same as "Later";
    - uk "good faith" said "diligently";
    - hu "uses no servers";
    - ru "will not sue" instead of "will not take legal action".
  - **Notes:** 18 more that changed meaning were taken.
  - **Re-check:** a separate reviewer checked all 23 changed strings and found none blocking.
  - Every finding is now a note in `review.json`, so every language stays `reviewed`, and each one's 37 keys are stamped. de and nl keep "Roadmap", and nl "Later", in `same-as-english.json`.
- **Checks:**
  - `npm run build:deploy` passes with 0 warnings;
  - layout tests 1856/1856 (then 626 and 476 more after the last fixes);
  - the new page spec 182/182, and deploy 6/6;
  - checked by hand at 360, 768 and 1280px in English and German;
  - Lighthouse on the home page: 100/100/100/100 on mobile and desktop.

## Audit fixes (Stage 2, 24 October 2026)

Each fix is a test commit that failed, then a fix commit that made it pass. Tests and site code are never in the same commit.

| Finding | Test commit | Fix commit | What changed |
|---|---|---|---|
| H1, deploy check (issue 1) | `1aaedea` | `cb0f8fa` | The deploy stops unless Pages deploys from GitHub Actions, and fails unless the live `/` and `/download/` match the build (`scripts/check-live-deploy.mjs`) |
| H2, new tab (issue 5) | `5bd309f` | `60c10db` | Store links open in a new tab and say "(opens in a new tab)" to screen readers, in 30 languages (reviewed, stamped) |
| L1, 404 `og:url` | `97f931c` | `cfabec3` | No `og:url` on `noindex` pages |
| 320px required | `c146d59` | | Every layout test runs at 320px (iPhone Display Zoom) |
| H3, header (issue 8) | (`c146d59`) | `b40a68c` | Below 360px the nav links are 14px with 2px padding: one row in every language |
| H4, German FAQ pan (issue 7) | (`c146d59`) | `893be3b` | Components set heading sizes in `--fs`, so the shared fit-to-longest-word rule always applies (`--fit-reserve` keeps room for icons). The middleware measures Thai by dictionary words, so Thai headings are no longer shrunk |
| M4, prose words at 320px | (`c146d59`) | `8ef1401` | Prose cards have 12px side padding below 360px |

**Rule from now on:** components set a heading's size in `--fs`, never in `font-size` (global.css), or long words in some languages will overflow at 320px.

Results after the fixes:
- layout: 738/738;
- accessibility and interactions: 636/636;
- deploy: 5/5;
- links: 41/41;
- real Mobile Safari (iPhone 16e, iOS 26.2): 46 pages × light and dark, 0 problems;
- Lighthouse on the home page: 100 on mobile and desktop.

## Decisions on record (23 October 2026)

- **Blog:** external facts are allowed, each sourced to an official page and checked live before writing. No algorithm names; NIST's 2024 post-quantum standards may be mentioned in general. No personal byline: the page shows no author, and the `Article` structured data names Doughnut Forge as an `Organization`. MDX is fine. The Mac file menu opens from the ⋮ button or by right-clicking.
- **Claims:** keep `docs/BLOG-CLAIMS.md` in step with the posts. A later copy change must not add a claim without a row.
- **Translations:** stale-translation detection is built (see "Translations: keeping them in step with English" below).
- **Privacy policy source:** the wording lives on this site now. `check-privacy-wording.mjs` and `extract-privacy.mjs` keep comparing with the pinned original, forge-privacy@3e7911c. Any wording change is made here, and only with the owner's approval.
- **Nothing blocks launch:** company details, the press contact and the first release date were removed instead of filled, and the Mac App Store ID is 6812778888.

### Facts found for Phase 4 (23 October 2026, app version 0.4.42)
These change what the posts can say:
- **No clean Mac or Windows screenshots exist.** The store shots and the in-app help images (`src/assets/{set-up,directory,contact-identity}`) show ".DS_Store", "MILITARY-GRADE ENCRYPTION" or the old interface (`did:forge:` IDs, "HARDWARE SECURITY ACTIVE"). Only the iPhone and iPad screenshots are clean.
- **Files can only be encrypted for identities** (yourself or contacts). There is no option to protect a file with a password. The password only unlocks the app.
- **Contacts are added only by importing a `.vltc2` contact card.** There is no QR code and no paste-an-ID field. Each card can be checked with a 16-character contact code, compared in person or on a call.
- **The desktop app has no share button for encrypted files.** On the Mac, the `.vlt2` file is saved next to the original. Only iOS opens the share sheet after encrypting. Folder vaults made on desktop cannot be opened on iPhone or iPad.
- **No drag and drop** for files in the app.
- **No network code found** in the app. But the macOS entitlements turn on `network.client` "for APIs or updates", so a post must not say the app cannot reach the internet. It can say the app works entirely on the device, needs no account, and uploads nothing. Those claims are already in the store listings.
- **Post-quantum:** the store listings say "Uses post-quantum encryption". The app has an encryption-type label "Hybrid Post-Quantum", but users cannot reach it (backlog item 9). No user-facing app text says "quantum-safe".
- **Not open source.** `Cargo.toml` says `license = "Proprietary"`. The app is not audited.

---

## Launch decisions (23 October 2026)

- **No company details.** The footer shows only "© {year} Doughnut Forge", and the legal page holds only the trademark notices. CLAUDE.md says so.
- **Press contact** is the public GitHub issues page (`site.issuesUrl`). No first release date is shown.
- **Mac App Store ID:** 6812778888 (`src/data/stores.ts`). Store links carry no country code.
- `src/data/placeholder.ts` and `scripts/check-placeholders.mjs` stay for any future unknown value; none is in use.

**Site copy fixed (23 October 2026):** the backup FAQ (`faq.backup.a`) no longer tells people to export their contacts, in all 30 languages, because the app cannot export contacts yet. The independent reviewer found no blocking findings in the 28 changed translations (en-US inherits the English). No blog post mentioned it.

---

## Language review status

From `src/i18n/review.json`. A subagent independent of the drafter reviews every translation and records its findings, each with a severity, in the same file. A `draft` language is built, but it is `noindex` and left out of hreflang and the sitemap.

**Rule (owner, 23 October 2026):** a language is marked `reviewed` once the independent reviewer has no blocking findings, meaning every finding is a `note`. Claude may set the status under this rule, recording `approvedAt` and `approvedUnder`. The change still goes in a commit shown for approval. Before this rule, only the owner set the status.

- **Reviewed by the owner (6):** English (source), French, German, Spanish, Japanese, Portuguese (Brazil), on 23 October 2026.
- **Reviewed under the no-blocking-findings rule (24):** Italian, Dutch, Swedish, Danish, Finnish, Norwegian, Polish, Czech, Hungarian, Romanian, Russian, Greek, Ukrainian, English (US), Spanish (Mexico), Turkish, Chinese (Simplified), Chinese (Traditional), Korean, Hindi, Indonesian, Malay, Thai, Vietnamese. All 79 of their findings are notes.
- **Drafts:** none.
- The notes stay in `review.json` for the post-launch copy review.

Review sheets for the owner: `node scripts/review-sheet.mjs <out dir> --langs it,nl` (or `--langs all`).

### Translations: keeping them in step with English
`src/i18n/sources/<code>.json` records, for every translated string, a fingerprint of the English it was translated from and of the translation itself (`scripts/translation-sources.mjs`).
- **When English changes,** the translation check lists every language and key whose English has changed since ("stale"). Local builds only warn; the deploy build fails until each stale string is fixed.
- **To clear a stale string:** retranslate it, run the independent reviewer on it, then `node scripts/stamp-translations.mjs --lang <code> --keys <key,...>`. Never stamp just to silence the check.
- **If the English change does not affect the translation** (a typo fix in English, say), stamping is refused unless you pass `--confirm-unchanged`.
- **en-US** reuses UK English for everything it does not override. Only its own strings (currently 3) are recorded.
- **Not covered:** the privacy policy (its own word-for-word check), the app and store copy synced from the app repo, and English-only blog and 404 strings. Blog translations get a `source` fingerprint in their front matter when the first one is made.
- **Baseline:** all 29 languages were stamped on 23 October 2026, after the backup FAQ change, when every translation matched the English.

---

## How to run things

Node version: `.nvmrc` (24). Install with `npm ci`.

| Task | Command |
|---|---|
| Local dev server, drafts shown | `npm run dev`, then http://localhost:4321/ |
| Build (as for review) | `npm run build`: `astro check`, build, then every check |
| Preview build with social images in every language | `npm run build:preview` |
| Build with drafts included | `DRAFTS=1 npm run build` (see `src/data/blog.ts`; first real use is in Phase 4) |
| Deploy build (used by CI; fails on placeholders) | `npm run build:deploy` |
| Serve the last build | `npm run preview`, then http://localhost:4321/ |
| Copy strings, store copy and screenshots from the app repo | `npm run sync:app` (local only; reads `~/git/doughnut-forge`, never writes to it) |
| Store badge coverage | `npm run badges` |
| Layout, accessibility and interaction tests (build first; no network) | `npm run test:layout`, narrowed with `PAGES=` and `LANGS=`; see `tests/README.md` |
| Link tests (live site and stores) | `npm run test:links` |
| The deploy's live-page check, and open and fresh tabs reaching the new build (WebKit iPhone), against local servers | `npm run test:deploy` |
| The issue forms and the issue fetch, against a local server | `npm run test:forms` |
| The build checks, on small built sites of their own | `npm run test:checks` |
| Content blockers on phones: every public list on every page, and the store fallback (downloads the lists) | `npm run test:blockers` |
| Before every commit: what is staged, and the type check (tests included) | `npm run check:commit` |
| Two builds of the same commit are the same (after changing the config, `package.json`, `scripts/` or `src/assets/`) | `npm run check:reproducible` |
| Refresh the committed answered issues (then commit, shown for approval) | `npm run fetch:issues` |
| Build with three sample issues (local only) | `ISSUES_FILE=tests/fixtures/issues.json npm run build` |
| Remake the favicons from the app's master icon | `node scripts/make-favicons.mjs` |
| The layout checks in real Mobile Safari (iOS Simulator) | `node tests/ios/real-safari.ts <udid>` (setup in the file) |
| Record which English a translation came from (after review only) | `node scripts/stamp-translations.mjs --lang de --keys a,b` |

**The checks** (all run by `npm run build`, in this order):
- `check-production-files.mjs`: the built `apple-app-site-association` and `CNAME` match the live root copies, `.nojekyll` exists, `build.json` and the home page share the build ID, and `security.txt` has its Contact, Policy and Canonical lines and an Expires date between 30 days and a year ahead.
- `check-privacy-wording.mjs`: the privacy policy wording is unchanged from forge-privacy.
- `check-translations.mjs`: every language has every key, and no translation is stale. Stale or unstamped strings are a warning locally and fail `build:deploy` (`--strict`).
- `check-hreflang.mjs`: hreflang and canonical links agree, and every page built in more than one language has hreflang links (that is, it is in `translatedPages`).
- `check-og.mjs`: every `og:image` has a file (pages that only forward to a store have none).
- `check-blocker-names.mjs`: no class, id or built file name uses a word content blockers hide (badge, banner, ad, promo, sponsor, popup, social).
- `check-issues.mjs`: the answered-issues data holds only titles, questions, answers and issue links (no usernames), and every list and issue page is built, and only when it has an issue.
- `check-placeholders.mjs`: lists unfilled values (fails with `--strict`).

**Deploy:** `.github/workflows/deploy.yml` runs on every push to `main` (and by hand). Pages deploys from GitHub Actions. Before deploying, it checks that Pages still deploys from Actions and that private vulnerability reporting is on in forge-privacy. After deploying, it checks that the live `/`, `/download/`, `/.well-known/security.txt` and `/build.json` are this build, and that the live `apple-app-site-association` lists both apps. The root `.well-known/`, `CNAME`, `.nojekyll`, icons, `site.webmanifest` and `index.html` stay as the rollback until step 6 (on or after 6 November 2026).

Before saying a change is done (CLAUDE.md): build with no warnings; run `npm run test:layout` (it also covers WebKit on a phone and 320px, which CLAUDE.md does not name); check each changed page at 360, 768 and 1280px; check one left-to-right language (no right-to-left language is supported yet); run Lighthouse on the home page and report the scores.

---

## Backlog for the app repo (not this site)

These belong in `~/git/doughnut-forge`. This repo never edits it.

1. **"MILITARY-GRADE ENCRYPTION" label.** `src/locales/en/secure-directory.json` `sealModal.subtitle` is "Military-Grade Encryption", which breaks the copy rules. It also shows in the Mac and Windows store screenshots.
2. **The unprotected backup PDF.** "Export Backup PDF" saves the 24 words in a PDF with no password. The site FAQ warns about this. The app could protect the PDF or warn when saving it.
3. **An in-app "Forgot password? Restore with your backup phrase" flow.** The password cannot be reset, and the app does not point people to restoring from the backup phrase when they forget it.
4. **Clean Mac and Windows screenshots** without ".DS_Store", "MILITARY-GRADE" or the old interface. The site and the blog need them; until then they use the iPhone and iPad screenshots only.
5. **Store subtitle mismatch.** 14 store locales use "Encryption without subscription" as the subtitle and the rest use "Pay once". Separately, `tauri.conf.json` `shortDescription` is "Offline Document Reader and Privacy Vault", which matches neither.
6. **Update the restore FAQ once contacts import ships.** `faq.restore.a` (and `faq.backup.a`) say contacts do not come back with a restore. When contacts export and import work in the app, the site FAQ must change in every language.
7. **Remove the unused network permission from the Mac app.** `src-tauri/Entitlements.macOS.plist` turns on `com.apple.security.network.client` ("for APIs or updates"), but the app has no network code. Removing it makes "works entirely on your computer" provable from the app's own settings. The site and blog never claim the app cannot connect until it is removed.
8. **Fix the help text that claims a "shows who sent it" feature.** `src/locales/en/mobile-views.json:30` ("…and shows who it came from.") and `:166` ("When you unlock something, the app shows which contact it came from.") describe something the app does not do. Decrypting returns no sender (`src-tauri/src/types.rs:141-144`); the only sender signal is the "Unknown Sender Detected" warning. The blog does not claim this feature.
9. **The "Hybrid Post-Quantum" label cannot be reached.** `src/components/header-inspector/index.tsx:144-148` shows the encryption type in a file-details panel, but nothing calls `openInspector` (`src/hooks/use-header-inspector.ts`), so users never see it. Either wire it up or remove it. The blog does not mention it.
10. **Update the site FAQs when contacts export ships.** `faq.backup.a` now says only that contacts are not part of the backup phrase, and `faq.restore.a` says contacts do not come back with a restore. Once the app can export and import contacts, both answers (and any blog post that mentions backups) must say how, in every language.

---

## Post-launch copy review

- **After launch, an external copywriter reviews all site copy and the blog posts.** Their notes will be supplied later.
- **When the notes arrive:**
  1. The owner pastes them in.
  2. Claude plans the changes in plan mode, for the owner's approval.
  3. Claude applies them to the English strings (`src/i18n/ui/en.ts`) and the posts (`src/content/blog/en/`).
  4. Claude retranslates only the changed strings, runs the independent reviewer on them, and fixes any findings.
  5. Claude republishes: the usual commits, each shown first, then a deploy.
- **Already on the list (owner, 24 October 2026)**, found while fixing the audit. Both are copy questions, not layout bugs: no word breaks and nothing overflows.
  - **Thai home tagline** (`home.tagline`, `/th/`): since headings went back to their design size (`893be3b`), "มีเพียงคนที่คุณเลือกเท่านั้นที่เปิดได้" wraps with "ได้" alone on the second line at 390px. A shorter tagline, or one that breaks better, would fix it.
  - **The long German FAQ question** (`faq.quantum.q`, `/de/support/`): "Was bedeutet Post-Quanten-Verschlüsselung?" is shrunk to fit its one long word. At 320px it is about 14px, against 19px for the other questions, and it is slightly smaller at 360px (16px) and 390px (18px) too. A wording with a shorter longest word would keep it at 19px.
- **The privacy policy is excluded** unless the owner approves a specific wording change, because it stays word for word with forge-privacy (`scripts/check-privacy-wording.mjs`).
- The translation check lists every language and key whose English changed (see "Translations: keeping them in step with English"), so step 4 is checkable, and the deploy build fails until every changed string is retranslated, reviewed and stamped.
