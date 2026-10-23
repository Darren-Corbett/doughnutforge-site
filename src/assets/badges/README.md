# Store badges

Official badges only, self-hosted and unaltered: no recolouring, no cropping, and no edits to the SVG.

## File layout

`<store>/<site language code>.svg`, for example:
- `app-store/de.svg`
- `microsoft-store/pt-BR.svg`
- `google-play/zh-TW.svg`

The site language codes are the `code` values in `src/i18n/languages.json`.

When a language has no file, the page shows `en.svg`. Run `npm run badges` to list which languages have their own badge and which fall back.

When a store offers two variants of one language, save the right one under each site code:
- Spanish: the Spain badge goes in `es.svg` and the Latin America badge in `es-MX.svg`.
- Portuguese: the Brazil badge goes in `pt-BR.svg`.
- Chinese: the Simplified badge goes in `zh-CN.svg` and the Traditional badge in `zh-TW.svg`.
- English: the US/UK badge serves both `en` and `en-US`.

## Sources

The localised badges are downloaded by `node scripts/fetch-badges.mjs`, run on a developer machine only. The files are committed. No build and no deploy runs it or calls a store's site. `sources.json` records the address each file came from, and the date.

| Store | Where the files come from | Variant used |
|---|---|---|
| App Store and Mac App Store | Apple Marketing Tools, https://toolbox.marketingtools.apple.com/app-store/ (its badge service, `api/v2/badges/<badge>/black/<locale>`). The guidelines are at https://developer.apple.com/app-store/marketing/guidelines/ | Black |
| Microsoft Store | Microsoft's badge service, `https://get.microsoft.com/images/<locale> dark.svg` (the badge generator at https://apps.microsoft.com/badge) | Dark |
| Google Play | https://play.google.com/intl/en_us/badges/, which has a download of all languages | Default |

The English Apple badges (`en.svg`) came from:
- https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg
- https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-mac-app-store.svg

The English Microsoft badge came from https://get.microsoft.com/images/en-us%20dark.svg.

**Alt text.** `alt.json` holds the wording on each badge, copied from the artwork. It is used as the badge's alt text, so a screen reader says what the badge says. Add a line there whenever you add a badge.

**Gaps (October 2026), which fall back to English, marked `lang="en"`:**
- App Store: Hindi.
- Mac App Store: Czech, Greek, Hindi, Hungarian, Polish, Romanian and Chinese (Traditional).
- Microsoft Store: Norwegian.

**Exceptions:**
- Microsoft offers one Spanish badge, so `microsoft-store/es-MX.svg` is the same file as `es.svg`.
- Microsoft's Portuguese (Brazil) "dark" badge is drawn light (white with a border). It is used as Microsoft supplies it.

## Size and clear space

Every badge renders at 48px tall. That is above Apple's 40px minimum on screen. All badges on a page share one height, as Apple asks when its badge sits next to others.

Clear space around each badge is at least a quarter of its height (12px).

Check each brand's current guidelines when adding a store:
- https://developer.apple.com/app-store/marketing/guidelines/
- https://learn.microsoft.com/windows/apps/publish/promote-your-app-with-badge
- https://partnermarketinghub.withgoogle.com/brands/google-play/visual-identity/badge-guidelines/
