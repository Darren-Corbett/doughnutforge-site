# Joint launch: Android 1.0 and the new file format

Branch `release/launch`, pushed to origin after each task (the deploy runs only on `main`). Backed up as `~/Desktop/review/launch-site-<date>.bundle` after each session. The owner picks the day and gives the go.

Sources: `~/Desktop/review/website-handoff/v3/` (decisions, brief, white paper draft) and `~/Desktop/review/android-live/app-answers.md`. `docs/android-release-plan.md` covers the Android changes.

## Owner decisions on record

- Price on Google Play: USD 3.99, no launch price (14 November 2026). Pages show no amounts; `src/data/prices.ts` records it.
- White paper section 7.5 (a signature cannot be taken back) and the "stays protected" change: approved 14 November 2026.
- security.txt: email contact, white paper as a second Policy, English only (decisions 1 to 3).
- Country wording (16 November 2026): the site names no countries anywhere. "Availability depends on your country or region." stays for every store, Android included.

## Done on the branch (14 November 2026)

- Link tests: one named exception for the Play listing (`PLAY_PUBLISHED`).
- Counter tests for Play taps (no Worker change or redeploy needed).
- security.txt, all but Expires.
- Android: everything except the switch in `src/data/stores.ts`, in every language.
- White paper: English page and PDF, with the leak and freshness checks.
- New file format: English copy on Technical details, Security, FAQ and two posts.

## Waiting

- **Owner:** the privacy policy English (`~/Desktop/review/launch-site/L4-privacy-draft.md`); confirmation that sharing encrypted text has shipped on Android.
- **Deferred (owner, 16 November 2026):** the Google Play badge files, until the Android app is submitted to the store.
- **App side:** the final white paper; the exact "Old card: ask for a new one" string; the final unknown-sender warning; confirmation that Android recovery words restore the identity but not the contact list (mailbox Q5). Only then add the owner-approved Android restore line to `faq.restore.a` in 30 languages: "On Android, a new phone starts empty: your recovery words bring back your identity, but not the contacts you added in Doughnut Forge. Ask them to share their cards again."
- **Then, on this branch:**
  - Translations of the new-format copy and the white paper (29 languages, with review).
  - The new strings in `docs/launch/v3-copy.md`.
  - The white paper's other languages and its `translatedPages` entry.
  - A social image for the white paper.

## Launch, one stage at a time (owner, 18 November 2026)

The stores release 3.0 one by one. The site moves through three stages, set by `src/data/release.json` and worked out in `src/data/stages.ts`. Until a stage is reached, its strings keep their current text (`src/i18n/before/`, from `main`), its new lines are left out (`src/i18n/gated.ts`), and posts use `<Stage from|until>` (`src/components/blog/Stage.astro`). `tests/layout/release-stages.spec.ts` checks the built site against the data. Each stage is the owner's go, then: change the data, run every check (`build:deploy`, full `test:layout`, `test:links`, `check:reproducible`, Lighthouse), merge `release/launch` into `main`, push with the owner's yes, then the live checks.

**Stage 1, Android is on sale** (`androidOnSale: true`, and `"android"` in `storesWith3`, since Android launches with 3.0, which also reaches stage 2):
1. The Google Play badge files in `src/assets/badges/google-play/` (from the owner); the build fails without them.
2. In `tests/links/links.spec.ts`, set `PLAY_PUBLISHED` to `true`; `npm run test:links` must pass, including the Play listing. Open the Play link once by hand: `https://play.google.com/store/apps/details?id=com.darrencorbett.doughnutforge.mobile`.
3. Set `updated:` to today on the posts that change (Cryptomator, VeraCrypt, data breaches, WhatsApp, harvest now, share encrypted files).
4. Live: the Play badge on `/download/` and `/de/download/`, `/go/7427ad/en/`, no empty "Coming soon" on Support or the press kit.

**Stage 2, the first store sells 3.0** (its platform in `storesWith3`): the contact-code and older-apps FAQs and the old-card lines appear. Live: `/support/` in English and one other language.

**Stage 3, every store on sale sells 3.0** (every platform in `storesWith3`):
1. The white paper texts, final and reviewed, from `~/Desktop/review/launch-site/v3-held/white-paper/texts/` into `src/content/white-paper/`, with the release-day [PENDING] lines filled in; the per-language route; `security/white-paper/` in `translatedPages` (`src/i18n/alternates.ts`, high risk); a social image.
1b. In `src/content.config.ts`, give the white paper's glob loader `generateId: ({ entry }) => entry.replace(/\.md$/, "")`, so `es-MX`, `pt-BR`, `zh-CN`, `zh-TW` and `en-US` keep their case (Astro lowercases ids by default and the pages would not build).
2. The PDFs: `npm run build`, then `node scripts/make-white-paper-pdf.mjs --lang <code>` per language, then build again. Never in GitHub Actions.
3. Put back the sentences held for launch day, checked against the final paper and translated.
4. Delete the stage machinery: `src/data/release.json`, `src/data/stages.ts`, `src/i18n/gated.ts`, `src/i18n/before/`, the `<Stage>` tags (keep their "from" words), and the stage branches in the views and tests.
5. Add `Policy: https://doughnut-forge.app/security/white-paper/` back to `public/.well-known/security.txt` (the build fails without it once the paper is built, and with it before), and set `Expires` to one year from today, and move the renewal reminder in `docs/HANDOVER.md`.
6. Live: `/.well-known/apple-app-site-association` answers 200 and lists both apps; `/.well-known/security.txt`; the white paper page and one PDF in English and one other language; the counter's `/summary?window=7` answers 200.
