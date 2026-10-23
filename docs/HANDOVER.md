# Handover

Where the site work stands, and what comes next. Read this at the start of every session. Update it at the end of every phase.

- **Last updated:** 23 October 2026
- **Branch:** `main` (trunk-based, no other branches)
- **Full plan:** [`docs/PLAN.md`](PLAN.md), a copy of the saved master plan. Each phase also had its own detailed plan, approved before it was built.
- **Rules:** [`CLAUDE.md`](../CLAUDE.md). Two rules matter most: never commit without the owner's yes on the files, diff and message, and never publish anything without approval.

---

## Phase status

| Phase | What | Status | Commits |
|---|---|---|---|
| 1 | Astro setup, design system, layout, English home page | Done | `f512825` set up and home page, `b62a608` home page redesign, `4809639` dark header on every page |
| 2 | The other English pages: features, pricing, download, privacy, support/FAQ, press, legal, blog layout, 404, sitemap, robots.txt, social images | Done | `c0d0d83` |
| 3 | All 30 languages, hreflang, language switcher | Done | `71b71f0` translations, `121d53c` first batch marked reviewed |
| 4 | The four launch blog posts in English, as drafts | **Next**: plan being written, not yet approved | none |
| 5 | Support issue forms and the "answered issues" Action | **Deferred to next week**, not part of launch | none |
| 6 | SEO, Lighthouse and accessibility checks, launch checklist | After Phase 4 | none |

### Why Phase 5 is deferred
The owner moved it out of launch on 23 October 2026, to cut what launch depends on. Support at launch is what the site already has: `/support/` links to GitHub issues on forge-privacy and shows the bold never-attach warning in every language. No page links to "Answered questions" or "Known issues", and none may until Phase 5 ships. Phase 6 must not depend on anything from Phase 5. The full Phase 5 plan is under "Next week" in `docs/PLAN.md`, unchanged and ready to pick up.

Known gap until then: CLAUDE.md asks for GitHub issue forms that each carry the bold warning. Those forms do not exist yet, so the "New issue" link opens GitHub's plain new-issue page. The warning is on the site but not on GitHub.

---

## What is next, step by step

1. **Phase 4 plan, for approval.** For each of the four posts: the main search phrase, title, meta description, outline, and the screenshots or illustrations it uses. Every factual claim gets its source in the app repo or the store listings. Research is done (see "Facts found for Phase 4" below). No post is written until the plan is approved.
2. **Phase 4 build.** Each post goes into `src/content/blog/en/<slug>.md` with `draft: true`. RSS (`@astrojs/rss`) is added. Drafts show only in `npm run dev` or a `DRAFTS=1` build. Separate commits, each shown first.
3. **Phase 4 review.** The owner reads the four drafts in a preview, with a facts checklist for each post. Posts are published (`draft: false`) only on the owner's say-so.
4. **Phase 6.** Run the checks and prepare the launch items. These include the forge-privacy redirect page, the Pages source switch, and removing the root production files only after the switch.
5. **Fill the open items below.** The deploy build fails until they are filled.
6. **Next week: Phase 5.**

### Facts found for Phase 4 (23 October 2026, app version 0.4.42)
These change what the posts can say:
- **No clean Mac or Windows screenshots exist.** The store shots and the in-app help images (`src/assets/{set-up,directory,contact-identity}`) show ".DS_Store", "MILITARY-GRADE ENCRYPTION" or the old interface (`did:forge:` IDs, "HARDWARE SECURITY ACTIVE"). Only the iPhone and iPad screenshots are clean.
- **Files can only be encrypted for identities** (yourself or contacts). There is no option to protect a file with a password. The password only unlocks the app.
- **Contacts are added only by importing a `.vltc2` contact card.** There is no QR code and no paste-an-ID field. Each card can be checked with a 16-character contact code, compared in person or on a call.
- **The desktop app has no share button for encrypted files.** On the Mac, the `.vlt2` file is saved next to the original. Only iOS opens the share sheet after encrypting. Folder vaults made on desktop cannot be opened on iPhone or iPad.
- **No drag and drop** for files in the app.
- **No network code found** in the app. But the macOS entitlements turn on `network.client` "for APIs or updates", so a post must not say the app cannot reach the internet. It can say the app works entirely on the device, needs no account, and uploads nothing. Those claims are already in the store listings.
- **Post-quantum:** the store listings say "Uses post-quantum encryption". The app's encryption-type label reads "Hybrid Post-Quantum". No user-facing app text says "quantum-safe".
- **Not open source.** `Cargo.toml` says `license = "Proprietary"`. The app is not audited.

---

## Open items blocking launch

Each one is a placeholder in `src/data/`. Local builds warn about them, and `npm run build:deploy` fails while any remain (`scripts/check-placeholders.mjs --strict`).

| Item | Where |
|---|---|
| Registered company name | `src/data/company.ts` `name` |
| Company number | `src/data/company.ts` `number` |
| Registered jurisdiction: England and Wales, Scotland or Northern Ireland | `src/data/company.ts` `registeredIn` |
| Registered office address | `src/data/company.ts` `registeredOffice` |
| Company contact method | `src/data/company.ts` `contact` |
| Mac App Store ID | `src/data/stores.ts`, the `mac` entry's `storeId` |
| Press contact (email address or form link) | `src/data/press.ts` `contact` |
| First release date | `src/data/press.ts` `firstRelease` |

Also needed before Phase 4 is published: the blog author's name and bio.

**Site copy to fix (found 23 October 2026, not yet changed):** the FAQ answer `faq.backup.a` in `src/i18n/ui/en.ts` says "export them from Contacts if you want a copy". In the app, the Contacts export button sits behind a feature flag that is off by default (`enableDayTwoFunctionality`), and the export does not work yet. The sentence should come out until export ships. That change needs the owner's approval, and every language then needs the same change.

---

## Language review status

From `src/i18n/review.json`. Only the owner marks a language `reviewed`. Reviews are done by a subagent independent of the drafter, and their findings are recorded in the same file. A draft language is built, but it is `noindex` and left out of hreflang and the sitemap.

- **Reviewed (6):** English (source), French, German, Spanish, Japanese, Portuguese (Brazil). All five translations were approved on 23 October 2026.
- **Drafts (24):** Italian, Dutch, Swedish, Danish, Finnish, Norwegian, Polish, Czech, Hungarian, Romanian, Russian, Greek, Ukrainian, English (US), Spanish (Mexico), Turkish, Chinese (Simplified), Chinese (Traditional), Korean, Hindi, Indonesian, Malay, Thai, Vietnamese.

Review sheets for the owner: `node scripts/review-sheet.mjs <out dir> --langs it,nl` (or `--langs all`).

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

**The checks** (all run by `npm run build`, in this order):
- `check-production-files.mjs`: the built `apple-app-site-association` and `CNAME` match the live root copies, and `.nojekyll` exists.
- `check-privacy-wording.mjs`: the privacy policy wording is unchanged from forge-privacy.
- `check-translations.mjs`: every language has every key.
- `check-hreflang.mjs`: hreflang and canonical links agree.
- `check-og.mjs`: every `og:image` has a file.
- `check-placeholders.mjs`: lists unfilled values (fails with `--strict`).

**Deploy:** `.github/workflows/` holds the deploy workflow. It runs only by hand (`workflow_dispatch`) until the owner switches GitHub Pages to "GitHub Actions". Until then the live site is served from the repo root, so the root `.well-known/`, `CNAME`, `.nojekyll`, icons, `site.webmanifest` and `index.html` must stay. The shipped apps rely on the root `apple-app-site-association` for password-manager linking.

Before saying a change is done (CLAUDE.md): build with no warnings; check each changed page at 360, 768 and 1280px; check one left-to-right language (no right-to-left language is supported yet); run Lighthouse on the home page and report the scores.

---

## Backlog for the app repo (not this site)

These belong in `~/git/doughnut-forge`. This repo never edits it.

1. **"MILITARY-GRADE ENCRYPTION" label.** `src/locales/en/secure-directory.json` `sealModal.subtitle` is "Military-Grade Encryption", which breaks the copy rules. It also shows in the Mac and Windows store screenshots.
2. **The unprotected backup PDF.** "Export Backup PDF" saves the 24 words in a PDF with no password. The site FAQ warns about this. The app could protect the PDF or warn when saving it.
3. **An in-app "Forgot password? Restore with your backup phrase" flow.** The password cannot be reset, and the app does not point people to restoring from the backup phrase when they forget it.
4. **Clean Mac and Windows screenshots** without ".DS_Store", "MILITARY-GRADE" or the old interface. The site and the blog need them; until then they use the iPhone and iPad screenshots only.
5. **Store subtitle mismatch.** 14 store locales use "Encryption without subscription" as the subtitle and the rest use "Pay once". Separately, `tauri.conf.json` `shortDescription` is "Offline Document Reader and Privacy Vault", which matches neither.
6. **Update the restore FAQ once contacts import ships.** `faq.restore.a` (and `faq.backup.a`) say contacts do not come back with a restore. When contacts export and import work in the app, the site FAQ must change in every language.
