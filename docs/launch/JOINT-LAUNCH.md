# Joint launch: Android 1.0 and the new file format

Branch `release/launch`, pushed to origin after each task (the deploy runs only on `main`). Backed up as `~/Desktop/review/launch-site-<date>.bundle` after each session. The owner picks the day and gives the go.

Sources: `~/Desktop/review/website-handoff/v3/` (decisions, brief, white paper draft) and `~/Desktop/review/android-live/app-answers.md`. `docs/android-release-plan.md` covers the Android changes.

## Owner decisions on record

- Price on Google Play: USD 3.99, no launch price (14 November 2026). Pages show no amounts; `src/data/prices.ts` records it.
- White paper section 7.5 (a signature cannot be taken back) and the "stays protected" change: approved 14 November 2026.
- security.txt: email contact, white paper as a second Policy, English only (decisions 1 to 3).

## Done on the branch (14 November 2026)

- Link tests: one named exception for the Play listing (`PLAY_PUBLISHED`).
- Counter tests for Play taps (no Worker change or redeploy needed).
- security.txt, all but Expires.
- Android: everything except the switch in `src/data/stores.ts`, in every language.
- White paper: English page and PDF, with the leak and freshness checks.
- New file format: English copy on Technical details, Security, FAQ and two posts.

## Waiting

- **Owner:** the privacy policy English (`~/Desktop/review/launch-site/L4-privacy-draft.md`); the country wording; the Google Play badge files; confirmation that sharing encrypted text has shipped on Android.
- **App side:** the final white paper; the app's words for a contact on an older card.
- **Then, on this branch:**
  - The `stores.ts` switch, which makes the Android tests pass.
  - Translations of the new-format copy and the white paper (29 languages, with review).
  - The new strings in `docs/launch/v3-copy.md`.
  - The white paper's other languages and its `translatedPages` entry.
  - A social image for the white paper.

## Launch day, in order

1. Owner's go.
2. Put back the sentences held for launch day (`~/Desktop/review/launch-site/white-paper-held-back.md`), checked against the final paper and translated.
3. In `tests/links/links.spec.ts`, set `PLAY_PUBLISHED` to `true`; `npm run test:links` must pass, including the Play listing.
4. Open the Play link by hand once: `https://play.google.com/store/apps/details?id=com.darrencorbett.doughnutforge.mobile`.
5. Set `Expires` in `public/.well-known/security.txt` to one year from today, and move the renewal reminder in `docs/HANDOVER.md`.
6. Set `updated:` to today on the posts changed for the launch (Cryptomator, VeraCrypt, data breaches, WhatsApp, harvest now, share encrypted files).
7. Merge `release/launch` into `main`, run every check (`build:deploy`, full `test:layout`, `test:links`, `check:reproducible`, Lighthouse), and push with the owner's yes.
8. Live checks:
   - `/.well-known/apple-app-site-association` answers 200 and lists both apps.
   - `/.well-known/security.txt`.
   - The white paper page and one PDF, in English and one other language.
   - The Play badge on `/download/` and `/de/download/`, and `/go/7427ad/en/`.
   - No empty "Coming soon" on Support or the press kit.
   - The counter's `/summary?window=7` answers 200.
