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

| Store | Where to download | Variant used |
|---|---|---|
| App Store and Mac App Store | Apple Marketing Tools, https://tools.applemarketingtools.com. Pick a badge, then a language. The full set is also linked from https://developer.apple.com/app-store/marketing/guidelines/ | Black |
| Microsoft Store | Microsoft Store badge generator, https://apps.microsoft.com/badge. Pick a language and "Dark". | Dark |
| Google Play | https://play.google.com/intl/en_us/badges/, which has a download of all languages | Default |

The English Apple badges here came from:
- https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg
- https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-mac-app-store.svg

The English Microsoft badge came from https://get.microsoft.com/images/en-us%20dark.svg.

## Size and clear space

Every badge renders at 48px tall. That is above Apple's 40px minimum on screen. All badges on a page share one height, as Apple asks when its badge sits next to others.

Clear space around each badge is at least a quarter of its height (12px).

Check each brand's current guidelines when adding a store:
- https://developer.apple.com/app-store/marketing/guidelines/
- https://learn.microsoft.com/windows/apps/publish/promote-your-app-with-badge
- https://partnermarketinghub.withgoogle.com/brands/google-play/visual-identity/badge-guidelines/
