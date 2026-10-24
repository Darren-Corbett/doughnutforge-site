# Handover

Where the site work stands, and what comes next. Read this at the start of every session. Update it at the end of every phase.

- **Last updated:** 24 October 2026, end of day, after the roadmap and security pages (`f3a577d`; pushed with this docs commit)
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
| 6 | SEO, Lighthouse and accessibility checks, launch | **Done: the site is live** (23 October 2026). Step 9 (Search Console) is done; steps 6 and 8 of `docs/launch/LAUNCH-CHECKLIST.md` are still open | `a2b003c` to `99d31ff`; forge-privacy `a9ed0d8` |
| – | `/roadmap/`, `/security/` and `/.well-known/security.txt`, in all 30 languages | **Done** (24 October 2026); see "Roadmap and security pages" below | `a6d1d26` tests, `f3a577d` pages and translations |

### Why Phase 5 is deferred
The owner moved it out of launch on 23 October 2026, to cut what launch depends on. Support at launch is what the site already has: `/support/` links to GitHub issues on forge-privacy and shows the bold never-attach warning in every language. No page links to "Answered questions" or "Known issues", and none may until Phase 5 ships. Phase 6 must not depend on anything from Phase 5. The full Phase 5 plan is under "Next week" in `docs/PLAN.md`, unchanged and ready to pick up.

Known gap until then: CLAUDE.md asks for GitHub issue forms that each carry the bold warning. Those forms do not exist yet, so the "New issue" link opens GitHub's plain new-issue page. The warning is on the site but not on GitHub.

---

## Where we are now

- **The site is live** at https://doughnut-forge.app in all 30 languages (every language reviewed and indexed), with the four blog posts, served by GitHub Pages from GitHub Actions. **Every push to `main` deploys** within about two minutes. The deploy fails, and the live site stays as it was, if any check in `npm run build:deploy` fails or the live `apple-app-site-association` is missing.
- **The old privacy page redirects:** forge-privacy `a9ed0d8` sends `darren-corbett.github.io/forge-privacy` (with or without the trailing slash, and every `?lang=`) to the matching `/privacy/` page. The store Support URL (forge-privacy issues) is unchanged.
- **Working tree:** clean. Everything up to `919ce28` is pushed and deployed (24 October 2026).
- **Post-launch audit (24 October 2026):** [`docs/audit/2026-10-24.md`](audit/2026-10-24.md). It covers the owner's eight live-site issues and the full audit (246 pages × 30 languages × Chromium, WebKit and WebKit iPhone × five widths × two themes, axe, links, and real Mobile Safari in the iOS Simulator). There are no critical findings. The high ones are the deploy's missing live-page check (issue 1), store links not opening in a new tab (issue 5), the header wrapping at 320px with Display Zoom (issue 8), and a German FAQ heading that pans at 320px (issue 7). **Stage 2 (24 October 2026) fixed H1, H2, H3, H4, M4 and L1**; see "Audit fixes" below. Issues 2 (Mac badge) and 7 (English pan), and M1 (desktop widths), are resolved: the owner confirmed on their own devices after Stage 2 that they no longer happen or look fine. The 320px layout tests stay as the guard.
- **Launch incident:** the first deploy left out `.well-known/apple-app-site-association` for about 42 minutes (13:13 to 13:55 UTC), because the Pages upload drops files whose names start with a dot. Fixed in `42fb02c` (`include-hidden-files: true`, plus a live check at the end of the deploy job). Whether Apple fetched the file during the gap is unknown.

## What is next, in order

0. **The 24 October end-of-day deploy passed** (run 40092562540, `919ce28`): "Check private vulnerability reporting is on" and "Check the live pages are this build", which now also compares `/.well-known/security.txt`, both passed on their first run. `security.txt` is live as `text/plain`, and `/roadmap/` and `/security/` are live.
1. **Next job, next week: Phase 5**, the support issue forms and the answered-issues pages. The plan is under "Next week" in `docs/PLAN.md`. Plan it in plan mode first. When it ships, add the links to `/support/` and rerun the Phase 6 checks on the changed and new pages.
2. **Audit follow-ups:** all closed except the iOS App Store ID.
   - **Stage 2 is live:** deploy run 40087614665 passed, including "Check Pages deploys from GitHub Actions" and "Check the live pages are this build", which ran there for the first time.
   - **M1, desktop widths:** resolved; the owner confirmed they look fine (24 October 2026). No change.
   - **Issues 2 (Mac badge) and 7 (English pan):** resolved; they no longer happen on the owner's iPhone after Stage 2 (24 October 2026). The 320px layout tests stay as the guard.
   - **L2:** left as it is (owner, 24 October 2026).
   - **The iOS App Store ID** (issue 4): it does not exist yet, so iOS stays "Coming soon".

   **A branch rollback serves the old "Coming soon" placeholder at `/`** (the repo-root `index.html`), with no other pages, until the root files are removed on or after 6 November. Since H1, the deploy also stops unless Pages deploys from GitHub Actions, and fails if the live `/` and `/download/` are not the pages it built.
3. **Step 8, store listing URLs (owner, in progress).**
   - The app repo session is updating `fastlane/metadata/{mac,ios}/en-GB/privacy_url.txt` and `marketing_url.txt`.
   - Partner Center: the owner updates it by hand.
   - App Store Connect: set the same values by hand if the next fastlane upload does not send them. Privacy `https://doughnut-forge.app/privacy/`, Marketing `https://doughnut-forge.app/`, Support unchanged (`https://github.com/Darren-Corbett/forge-privacy/issues`).
4. **When 0.4.44 is live in every store** (Mac App Store, Microsoft Store, App Store for iPhone and iPad): in `src/data/roadmap.ts`, set the identity item's status to `"shipped"`. Its wording stays the same, so nothing needs retranslating; the "Shipped" section then appears and the item loses its "Planned" label. On 24 October 2026 the owner said 0.4.44 was not yet live everywhere.
5. **On or after 6 November 2026: step 6, remove the old root files.** Remove the root copies of `.well-known/`, `CNAME`, `.nojekyll`, the icons, `site.webmanifest` and `index.html`, and make `scripts/check-production-files.mjs` check the built files alone. Until then they are the rollback: switch Pages back to "Deploy from a branch" (`main`, root) **and push any commit**, because a source switch alone does not rebuild. That rollback restores only the apps' `apple-app-site-association`: the site itself becomes the old "Coming soon" placeholder at `/`, with no other pages. While Pages deploys from a branch, every push still starts the Actions deploy, which stops at "Check Pages deploys from GitHub Actions". That failure is expected during a rollback.
6. **Step 9, Google Search Console: done (owner, 24 October 2026).** A Domain property for `doughnut-forge.app`, verified by a DNS TXT record, and `https://doughnut-forge.app/sitemap-index.xml` submitted. Nothing changed on the site: no tag, file or script, and no visitor tracking.
7. **11 December 2026:** iOS launch pricing ends. Pages show no prices; update `src/data/prices.ts` so the record stays true.
8. **When the copywriter's notes arrive:** follow "Post-launch copy review" below.
9. **New blog posts:** no more than one or two a week, each starting as `draft: true` with a claims table in `docs/BLOG-CLAIMS.md`, published only on the owner's say-so.
10. **By 24 September 2027: renew `security.txt`.** Set `Expires` in `public/.well-known/security.txt` to one year from that day, and move this reminder a year on. The build fails from 24 September 2027 (30 days before the 24 October 2027 expiry) until it is renewed.

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
| The deploy's live-page check, against a local server | `npm run test:deploy` |
| The layout checks in real Mobile Safari (iOS Simulator) | `node tests/ios/real-safari.ts <udid>` (setup in the file) |
| Record which English a translation came from (after review only) | `node scripts/stamp-translations.mjs --lang de --keys a,b` |

**The checks** (all run by `npm run build`, in this order):
- `check-production-files.mjs`: the built `apple-app-site-association` and `CNAME` match the live root copies, `.nojekyll` exists, and `security.txt` has its Contact, Policy and Canonical lines and an Expires date between 30 days and a year ahead.
- `check-privacy-wording.mjs`: the privacy policy wording is unchanged from forge-privacy.
- `check-translations.mjs`: every language has every key, and no translation is stale. Stale or unstamped strings are a warning locally and fail `build:deploy` (`--strict`).
- `check-hreflang.mjs`: hreflang and canonical links agree.
- `check-og.mjs`: every `og:image` has a file.
- `check-placeholders.mjs`: lists unfilled values (fails with `--strict`).

**Deploy:** `.github/workflows/deploy.yml` runs on every push to `main` (and by hand). Pages deploys from GitHub Actions. Before deploying, it checks that Pages still deploys from Actions and that private vulnerability reporting is on in forge-privacy. After deploying, it checks that the live `/`, `/download/` and `/.well-known/security.txt` are this build, and that the live `apple-app-site-association` lists both apps. The root `.well-known/`, `CNAME`, `.nojekyll`, icons, `site.webmanifest` and `index.html` stay as the rollback until step 6 (on or after 6 November 2026).

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
