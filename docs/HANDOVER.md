# Handover

Where the site work stands, and what comes next. Read this at the start of every session. Update it at the end of every phase.

- **Last updated:** 24 October 2026, after the audit fixes, Stage 2 (deployed: `99d31ff`; committed, not yet pushed: `33cbb25` to `8ef1401`, plus this docs commit)
- **Branch:** `main` (trunk-based, no other branches)
- **Full plan:** [`docs/PLAN.md`](PLAN.md), a copy of the saved master plan. Each phase also had its own detailed plan, approved before it was built.
- **Rules:** [`CLAUDE.md`](../CLAUDE.md). Two rules matter most: never commit without the owner's yes on the files, diff and message, and never publish anything without approval.
- **Pre-launch review scope (owner, 23 October 2026):** before launch the owner reviews facts and automated checks only. Copy style is reviewed after launch by an external copywriter (see "Post-launch copy review"). For blog posts, show the owner only each post's claims table for approval, not the full text. The CLAUDE.md copy rules still apply when writing.

---

## Phase status

| Phase | What | Status | Commits |
|---|---|---|---|
| 1 | Astro setup, design system, layout, English home page | Done | `f512825` set up and home page, `b62a608` home page redesign, `4809639` dark header on every page |
| 2 | The other English pages: features, pricing, download, privacy, support/FAQ, press, legal, blog layout, 404, sitemap, robots.txt, social images | Done | `c0d0d83` |
| 3 | All 30 languages, hreflang, language switcher | Done | `71b71f0` translations, `121d53c` first batch marked reviewed |
| 4 | The four launch blog posts in English | **Done**: published 23 October 2026 (claims in `docs/BLOG-CLAIMS.md`) | `ee042f8` setup, `70f46f9` `c78eb76` `89ffe96` `8b7a3c4` `d0aca89` posts, `206e3dd` published |
| 5 | Support issue forms and the "answered issues" Action | **Deferred to next week**, not part of launch | none |
| 6 | SEO, Lighthouse and accessibility checks, launch | **Done: the site is live** (23 October 2026). Steps 6, 8 and 9 of `docs/launch/LAUNCH-CHECKLIST.md` are still open | `a2b003c` to `99d31ff`; forge-privacy `a9ed0d8` |

### Why Phase 5 is deferred
The owner moved it out of launch on 23 October 2026, to cut what launch depends on. Support at launch is what the site already has: `/support/` links to GitHub issues on forge-privacy and shows the bold never-attach warning in every language. No page links to "Answered questions" or "Known issues", and none may until Phase 5 ships. Phase 6 must not depend on anything from Phase 5. The full Phase 5 plan is under "Next week" in `docs/PLAN.md`, unchanged and ready to pick up.

Known gap until then: CLAUDE.md asks for GitHub issue forms that each carry the bold warning. Those forms do not exist yet, so the "New issue" link opens GitHub's plain new-issue page. The warning is on the site but not on GitHub.

---

## Where we are now

- **The site is live** at https://doughnut-forge.app in all 30 languages (every language reviewed and indexed), with the four blog posts, served by GitHub Pages from GitHub Actions. **Every push to `main` deploys** within about two minutes. The deploy fails, and the live site stays as it was, if any check in `npm run build:deploy` fails or the live `apple-app-site-association` is missing.
- **The old privacy page redirects:** forge-privacy `a9ed0d8` sends `darren-corbett.github.io/forge-privacy` (with or without the trailing slash, and every `?lang=`) to the matching `/privacy/` page. The store Support URL (forge-privacy issues) is unchanged.
- **Working tree:** clean. Twelve commits since `99d31ff` are on local `main`, not pushed: the audit and its tests, then each Stage 2 fix as a test commit and a fix commit. A push deploys them, and the deploy's new live-page check runs for the first time; push only when the owner asks.
- **Post-launch audit (24 October 2026):** [`docs/audit/2026-10-24.md`](audit/2026-10-24.md). It covers the owner's eight live-site issues and the full audit (246 pages × 30 languages × Chromium, WebKit and WebKit iPhone × five widths × two themes, axe, links, and real Mobile Safari in the iOS Simulator). There are no critical findings. The high ones are the deploy's missing live-page check (issue 1), store links not opening in a new tab (issue 5), the header wrapping at 320px with Display Zoom (issue 8), and a German FAQ heading that pans at 320px (issue 7). Issues 2 and 7 (English) did not reproduce, and the owner's device details are needed. **Stage 2 (24 October 2026) fixed H1, H2, H3, H4, M4 and L1**; see "Audit fixes" below.
- **Launch incident:** the first deploy left out `.well-known/apple-app-site-association` for about 42 minutes (13:13 to 13:55 UTC), because the Pages upload drops files whose names start with a dot. Fixed in `42fb02c` (`include-hidden-files: true`, plus a live check at the end of the deploy job). Whether Apple fetched the file during the gap is unknown.

## What is next, in order

0. **Audit follow-ups (waiting on the owner):**
   - **Push** the Stage 2 commits when the owner asks, then read the deploy log: "Check Pages deploys from GitHub Actions" and "Check the live pages are this build" run for the first time.
   - **M1, desktop widths:** waits for the owner's desktop screenshots. The current widths are tabled in the audit.
   - **Issues 2 and 7 (English):** wait for the owner's iPhone details (model, iOS version, Display Zoom, Safari aA zoom, content blockers) and the screen recording; plan them in plan mode when they arrive.
   - **L2:** left as it is (owner, 24 October 2026).
   - **The iOS App Store ID** (issue 4): it does not exist yet, so iOS stays "Coming soon".

   **A branch rollback serves the old "Coming soon" placeholder at `/`** (the repo-root `index.html`), with no other pages, until the root files are removed on or after 6 November. Since H1, the deploy also stops unless Pages deploys from GitHub Actions, and fails if the live `/` and `/download/` are not the pages it built.
1. **Step 8, store listing URLs (owner, in progress).**
   - The app repo session is updating `fastlane/metadata/{mac,ios}/en-GB/privacy_url.txt` and `marketing_url.txt`.
   - Partner Center: the owner updates it by hand.
   - App Store Connect: set the same values by hand if the next fastlane upload does not send them. Privacy `https://doughnut-forge.app/privacy/`, Marketing `https://doughnut-forge.app/`, Support unchanged (`https://github.com/Darren-Corbett/forge-privacy/issues`).
2. **Next week: Phase 5**, the support issue forms and the answered-issues pages. The plan is under "Next week" in `docs/PLAN.md`. When it ships, add the links to `/support/` and rerun the Phase 6 checks on the changed and new pages.
3. **On or after 6 November 2026: step 6, remove the old root files.** Remove the root copies of `.well-known/`, `CNAME`, `.nojekyll`, the icons, `site.webmanifest` and `index.html`, and make `scripts/check-production-files.mjs` check the built files alone. Until then they are the rollback: switch Pages back to "Deploy from a branch" (`main`, root) **and push any commit**, because a source switch alone does not rebuild. That rollback restores only the apps' `apple-app-site-association`: the site itself becomes the old "Coming soon" placeholder at `/`, with no other pages. While Pages deploys from a branch, every push still starts the Actions deploy, which stops at "Check Pages deploys from GitHub Actions". That failure is expected during a rollback.
4. **Step 9, Google Search Console (deferred by the owner).** When picked up, go one step at a time:
   1. search.google.com/search-console → Add property → **Domain** → `doughnut-forge.app` → copy the `google-site-verification=` TXT value (do not click Verify yet).
   2. Porkbun (the domain's DNS host) → DNS for doughnut-forge.app → add a TXT record on the root host with that value. Check it with `dig +short TXT doughnut-forge.app` before verifying.
   3. Click Verify, then Sitemaps → submit `https://doughnut-forge.app/sitemap-index.xml`.

   Nothing changes on the site: no tag, file or script, and no visitor tracking.
5. **11 December 2026:** iOS launch pricing ends. Pages show no prices; update `src/data/prices.ts` so the record stays true.
6. **When the copywriter's notes arrive:** follow "Post-launch copy review" below.
7. **New blog posts:** no more than one or two a week, each starting as `draft: true` with a claims table in `docs/BLOG-CLAIMS.md`, published only on the owner's say-so.

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
| The deploy's live-page check, against a local server | `npm run test:deploy` |
| The layout checks in real Mobile Safari (iOS Simulator) | `node tests/ios/real-safari.ts <udid>` (setup in the file) |
| Record which English a translation came from (after review only) | `node scripts/stamp-translations.mjs --lang de --keys a,b` |

**The checks** (all run by `npm run build`, in this order):
- `check-production-files.mjs`: the built `apple-app-site-association` and `CNAME` match the live root copies, and `.nojekyll` exists.
- `check-privacy-wording.mjs`: the privacy policy wording is unchanged from forge-privacy.
- `check-translations.mjs`: every language has every key, and no translation is stale. Stale or unstamped strings are a warning locally and fail `build:deploy` (`--strict`).
- `check-hreflang.mjs`: hreflang and canonical links agree.
- `check-og.mjs`: every `og:image` has a file.
- `check-placeholders.mjs`: lists unfilled values (fails with `--strict`).

**Deploy:** `.github/workflows/` holds the deploy workflow. It runs only by hand (`workflow_dispatch`) until the owner switches GitHub Pages to "GitHub Actions". Until then the live site is served from the repo root, so the root `.well-known/`, `CNAME`, `.nojekyll`, icons, `site.webmanifest` and `index.html` must stay. The shipped apps rely on the root `apple-app-site-association` for password-manager linking.

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
- **The privacy policy is excluded** unless the owner approves a specific wording change, because it stays word for word with forge-privacy (`scripts/check-privacy-wording.mjs`).
- The translation check lists every language and key whose English changed (see "Translations: keeping them in step with English"), so step 4 is checkable, and the deploy build fails until every changed string is retranslated, reviewed and stamped.
