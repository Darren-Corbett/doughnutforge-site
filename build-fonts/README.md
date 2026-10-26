# Build fonts

The Noto fonts that draw the social preview images (`scripts/make-og.mjs`, through `scripts/og-fonts.mjs`). They are **build tools only**: the site never serves a font, and nothing here is copied into `public/` or `dist/`. `tests/checks/og-fonts.spec.ts` checks that no font file is anywhere the site serves.

They are used on every machine, the deploy and a Mac alike, so the images look the same everywhere and the deploy downloads nothing. `fonts.conf` tells fontconfig to use this folder and no other. `make-og.mjs` checks every title against these fonts before drawing, and stops if a character is missing.

| File | Draws | Source |
|---|---|---|
| `NotoSans-ExtraBold.ttf` | "Doughnut Forge" on every image | notofonts/latin-greek-cyrillic, release NotoSans-v2.015, `hinted/ttf` |
| `NotoSans-Black.ttf` | Titles in Latin, Greek and Cyrillic scripts (including Vietnamese), and Latin words in other titles | the same release |
| `NotoSansCJK-Black.ttc` | Japanese, Simplified Chinese, Traditional Chinese and Korean titles | notofonts/noto-cjk, tag Sans2.004, `Sans/OTC` |
| `NotoSansThai-Black.ttf` | Thai titles | notofonts/thai, release NotoSansThai-v2.002, `hinted/ttf` |
| `NotoSansDevanagari-Black.ttf` | Hindi titles | notofonts/devanagari, release NotoSansDevanagari-v2.007, `hinted/ttf` |

All are licensed under the SIL Open Font License 1.1. Each source's licence file is kept here as published: `OFL-NotoSans.txt`, `OFL-NotoSansCJK.txt`, `OFL-NotoSansThai.txt` and `OFL-NotoSansDevanagari.txt`.

To add a language whose script none of these cover, add its Noto font and licence here, and its family to `FAMILIES` in `scripts/og-fonts.mjs`.
