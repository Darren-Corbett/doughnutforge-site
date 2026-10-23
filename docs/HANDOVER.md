# Handover

Where the site work stands, and what comes next. Read this at the start of every session. Update it at the end of every phase.

- **Last updated:** 23 October 2026
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
| 4 | The four launch blog posts in English, as drafts | **Drafts written**, awaiting the owner's approval of each post's claims table. Plan: `~/.claude/plans/phase-4-launch-blog-posts.md` | see `git log` (setup, then one commit per post) |
| 5 | Support issue forms and the "answered issues" Action | **Deferred to next week**, not part of launch | none |
| 6 | SEO, Lighthouse and accessibility checks, launch checklist | After Phase 4 | none |

### Why Phase 5 is deferred
The owner moved it out of launch on 23 October 2026, to cut what launch depends on. Support at launch is what the site already has: `/support/` links to GitHub issues on forge-privacy and shows the bold never-attach warning in every language. No page links to "Answered questions" or "Known issues", and none may until Phase 5 ships. Phase 6 must not depend on anything from Phase 5. The full Phase 5 plan is under "Next week" in `docs/PLAN.md`, unchanged and ready to pick up.

Known gap until then: CLAUDE.md asks for GitHub issue forms that each carry the bold warning. Those forms do not exist yet, so the "New issue" link opens GitHub's plain new-issue page. The warning is on the site but not on GitHub.

---

## What is next, step by step

1. **Phase 4: drafts built.** The four posts are in `src/content/blog/en/*.mdx` with `draft: true`, on the MDX, RSS, figure-component and organisation-author setup. Decisions from the owner (23 October 2026):
   - External facts are allowed, each sourced to an official page and checked against the live page before writing.
   - No algorithm names. NIST's 2024 post-quantum standards may be mentioned in general.
   - No personal byline. The page shows no author name or bio, and the `Article` structured data names Doughnut Forge as an `Organization`.
   - MDX is fine.
   - **Still open:** how to open a file's menu in the current Mac build (the ⋮ button, right-click, or both). Until answered, the Mac post says "open the file's menu".
2. **Phase 4 review.** The owner approves each post's claims table in [`docs/BLOG-CLAIMS.md`](BLOG-CLAIMS.md), not its text. An independent fact-checker found one blocking problem (a "Delete Original File" toggle that users cannot see), which is now fixed and gone from post 1; its other notes were applied. Keep the claims tables in step with the posts: any later copy change must not add a claim without a row. Posts are published (`draft: false`) only on the owner's say-so.
3. **Stale-translation detection: plan awaiting approval** (`~/.claude/plans/stale-translation-detection.md`). Not built yet.
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
- **Post-quantum:** the store listings say "Uses post-quantum encryption". The app has an encryption-type label "Hybrid Post-Quantum", but users cannot reach it (backlog item 9). No user-facing app text says "quantum-safe".
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

**Site copy to fix (found 23 October 2026, not yet changed):** the FAQ answer `faq.backup.a` in `src/i18n/ui/en.ts` says "export them from Contacts if you want a copy". In the app, the Contacts export button sits behind a feature flag that is off by default (`enableDayTwoFunctionality`), and the export does not work yet. The sentence should come out until export ships. That change needs the owner's approval, and every language then needs the same change.

---

## Language review status

From `src/i18n/review.json`. A subagent independent of the drafter reviews every translation and records its findings, each with a severity, in the same file. A `draft` language is built, but it is `noindex` and left out of hreflang and the sitemap.

**Rule (owner, 23 October 2026):** a language is marked `reviewed` once the independent reviewer has no blocking findings, meaning every finding is a `note`. Claude may set the status under this rule, recording `approvedAt` and `approvedUnder`. The change still goes in a commit shown for approval. Before this rule, only the owner set the status.

- **Reviewed by the owner (6):** English (source), French, German, Spanish, Japanese, Portuguese (Brazil), on 23 October 2026.
- **Reviewed under the no-blocking-findings rule (24):** Italian, Dutch, Swedish, Danish, Finnish, Norwegian, Polish, Czech, Hungarian, Romanian, Russian, Greek, Ukrainian, English (US), Spanish (Mexico), Turkish, Chinese (Simplified), Chinese (Traditional), Korean, Hindi, Indonesian, Malay, Thai, Vietnamese. All 79 of their findings are notes.
- **Drafts:** none.
- The notes stay in `review.json` for the post-launch copy review.

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
7. **Remove the unused network permission from the Mac app.** `src-tauri/Entitlements.macOS.plist` turns on `com.apple.security.network.client` ("for APIs or updates"), but the app has no network code. Removing it makes "works entirely on your computer" provable from the app's own settings. The site and blog never claim the app cannot connect until it is removed.
8. **Fix the help text that claims a "shows who sent it" feature.** `src/locales/en/mobile-views.json:30` ("…and shows who it came from.") and `:166` ("When you unlock something, the app shows which contact it came from.") describe something the app does not do. Decrypting returns no sender (`src-tauri/src/types.rs:141-144`); the only sender signal is the "Unknown Sender Detected" warning. The blog does not claim this feature.
9. **The "Hybrid Post-Quantum" label cannot be reached.** `src/components/header-inspector/index.tsx:144-148` shows the encryption type in a file-details panel, but nothing calls `openInspector` (`src/hooks/use-header-inspector.ts`), so users never see it. Either wire it up or remove it. The blog does not mention it.

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
- Once stale-translation detection is built, the translation check lists every language whose English source changed. That makes step 4 checkable.
