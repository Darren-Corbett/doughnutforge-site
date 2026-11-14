# Joint launch: Android 1.0 and the new file format

Branch `release/launch`, local only, never pushed before launch day. Backed up as `~/Desktop/review/launch-site-<date>.bundle` after each session. The owner picks the day and gives the go.

Sources: `~/Desktop/review/website-handoff/v3/` (decisions, brief, white paper draft) and `~/Desktop/review/android-live/app-answers.md`. `docs/android-release-plan.md` covers the Android changes.

## Owner decisions on record

- Price on Google Play: USD 3.99, no launch price (14 November 2026). Pages show no amounts; `src/data/prices.ts` records it.
- White paper section 7.5 wording and the privacy policy opening: see `docs/HANDOVER.md`.

## Waiting on the owner

- Country wording for the stores, after the owner checks the country lists in all three consoles.
- The final white paper.
- Google Play badge files.
- Confirmation that sharing encrypted text has shipped on Android.

## Launch day, in order

1. Owner's go.
2. In `tests/links/links.spec.ts`, set `PLAY_PUBLISHED` to `true`; `npm run test:links` must pass, including the Play listing.
3. Open the Play link by hand once: `https://play.google.com/store/apps/details?id=com.darrencorbett.doughnutforge.mobile`.
4. Set `Expires` in `public/.well-known/security.txt` to one year from today, and move the renewal reminder in `docs/HANDOVER.md`.
5. Merge `release/launch` into `main`, run every check, and push with the owner's yes.
6. Live checks:
   - `/.well-known/apple-app-site-association` answers 200 and lists both apps.
   - `/.well-known/security.txt`.
   - The white paper page and one PDF, in English and one other language.
   - The Play badge on `/download/` and `/de/download/`, and `/go/7427ad/en/`.
   - No empty "Coming soon" on Support or the press kit.
   - The counter's `/summary?window=7` answers 200.
