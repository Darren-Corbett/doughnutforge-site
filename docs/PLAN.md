# Doughnut Forge website: phased plan

## Context
doughnut-forge.app is currently a one-line placeholder (`index.html`, favicons, `CNAME`, `.nojekyll`, `.well-known/apple-app-site-association`) on GitHub Pages. It needs to become the full marketing and support site described in `CLAUDE.md`. The site has two goals:
- **Launch:** a fast static site that explains the app and sends people to the stores, with privacy, support, press, legal pages and 3 or more blog posts.
- **Organic search:** strong technical SEO in 30 languages, with a structure that scales to many posts and languages without a redesign.

Each phase below says how it serves both goals. Only Phase 1 is up for approval now. Nothing gets committed without showing you the files, the diff and the message first, and everything stays on `main`.

---

## 1. Framework: Astro (static output), styled with Tailwind v4

**Why Astro:**
- **Built-in i18n routing.** `i18n.locales` and `i18n.routing` give `/de/`, `/fr/` and so on, plus helpers like `getRelativeLocaleUrl` for hreflang and the language switcher. 30 locales is routine for it.
- **No JavaScript by default.** Pages ship as plain HTML and CSS, which makes a mobile Lighthouse score of 95+ realistic. There are no third-party requests, so nothing tracks visitors.
- **Content collections with a schema.** Blog posts live in Markdown with typed frontmatter (`title`, `description`, `keyphrase`, `author`, `date`, `draft: true`, `lang`). The build fails if a field is missing, and drafts are left out of production builds automatically. This scales to hundreds of posts across languages.
- **Built-in image optimisation** (`astro:assets` with sharp). It produces responsive AVIF/WebP at the right sizes, at build time, self-hosted.
- **First-party sitemap integration** with i18n alternates. GitHub Pages deploys through the official `withastro/action`.
- **Same toolchain as the app.** The app uses TypeScript, Vite and Tailwind v4, so the app's `@theme` tokens can be copied across almost unchanged and utility class names match.

**Rejected alternatives:**
- **Hugo:** excellent i18n, but Go templates and a separate styling story make it harder to reuse the app's Tailwind tokens.
- **Eleventy:** i18n has to be assembled by hand.
- **Next.js static export:** ships a JavaScript runtime the site does not need.

**GitHub Pages notes:**
- `CNAME`, `.nojekyll` and `.well-known/` move into `public/` so they are copied to the output unchanged.
- Pages "Source" must switch from "Deploy from a branch" to "GitHub Actions". You change that setting.
- The `forge-privacy` repo is a separate project site, so its URL is not affected by this repo.

---

## 2. What the site reuses from `~/git/doughnut-forge` (read-only)

### Languages: `src/locales/`, 30 locales
cs, da, de, el, en, en-US, es, es-MX, fi, fr, hi, hu, id, it, ja, ko, ms, nl, no, pl, pt-BR, ro, ru, sv, th, tr, uk, vi, zh-CN, zh-TW.

- **Native names, flags and regions:** `src/constants/languages.ts` (`ALL_SUPPORTED_LANGUAGES`) and `src/constants/language-regions.ts`.
- **Right-to-left:** ar, fa and he exist in `languages.ts` but are disabled and have no locale folders. **No RTL language is supported today.** The layout will still use logical CSS properties (`margin-inline`, `padding-inline`, `text-align: start`) and set `dir` on `<html>`, so RTL can be added later without a redesign.
- **App strings:** 15 namespaces per locale, `src/locales/<lang>/*.json`. Candidates for reuse:
  - `app.json` → `navigation.tabs` (Secure File, Secure Directory, Secure Text, Identity, Contacts…)
  - `secure-file.json` → `encryptButton`, `decryptModal.decryptButton`
  - `secure-text.json` → `encryptNote`, `decryptNote`
  - `common.json` → `restore.title`, `shell.init.generate.*`
- **Store copy per locale** (subtitle, promo, description, keywords): `fastlane/metadata/{mac,ios}/<loc>/*.txt`. These are 33 store locales that map onto the 30 site locales (de-DE→de, fr-FR→fr, es-ES→es, nl-NL→nl, zh-Hans→zh-CN, zh-Hant→zh-TW, en-GB→en). The en-GB subtitle "Encrypt and share. Pay once." and the description's feature headings give home-page copy that is already translated and already in the app's voice.

### Colours: `src/index.css`
**`@theme` tokens (lines 4–47):**

| Token | Light | Dark |
|---|---|---|
| `forge-blue` | `#1da1f2` | `#1a8cd8` |
| `forge-bg` | `#f5f8fa` | `#15202b` |
| `forge-surface` | `#ffffff` | `#1e2732` |
| `forge-border` | `#e1e8ed` (overridden to `#cbd5e1` in `:root`, ~lines 89–92) | `#38444d` |
| `forge-text` | `#14171a` | `#ffffff` |
| `forge-text-secondary` | `#657786` | `#8899a6` |
| `forge-silver` | `#aab8c2` | `#8899a6` |

**Accent colours** (used inline across `src/`):

| Colour | Hex | Role |
|---|---|---|
| Blue | `#1DA1F2` | primary |
| Green | `#00BA7C` | encrypt, success |
| Pink | `#F91880` | danger |
| Violet | `#794BC4` | |
| Orange | `#FF7A00` | warning |

**Readable "ink" text colours** (`src/index.css` ~lines 116–145, rationale in `readable-colours.md`). Each passes 4.5:1 or better on every background, which is what WCAG AA needs:

| Ink | Light | Dark |
|---|---|---|
| green | `#00704a` | `#00c785` |
| violet | `#6e3ebc` | `#ad91db` |
| blue | `#09649c` | `#4cb5f5` |
| orange | `#9c4a00` | `#ff8e26` |
| pink | `#b00554` | `#fb6bae` |

The app's rule carries over: ink is for text, brand hex is for borders, tints and rings. Buttons sit on 20% tints.

**Dark mode** is `.dark` on `<html>`, following the system setting (`src/layouts/desktop/index.tsx` lines 25–39). The site will follow `prefers-color-scheme` with CSS only, so it needs no JavaScript and no stored preference.

**Glow shadow:** `shadow-glow` = `0 4px 14px rgba(29,161,242,0.3)` (`src/index.css` ~line 148).

**⚠ Mismatch:** this repo's `site.webmanifest` and `index.html` use theme colour `#0D98FE`, which does not appear in the app. The app's brand blue is `#1da1f2`, and the app icon's light gradient is about `#0088FF` (`src-tauri/icons/AppIcon.icon/icon.json`). See decisions.

### Fonts
There are no bundled text fonts. The app uses the system stack `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif` (`src/index.css` lines 36–38). The site uses the same stack:
- It matches the app exactly.
- It needs no font downloads, which fits the no-external-fonts rule and helps speed.
- It has good CJK, Thai and Devanagari coverage from each operating system.

**Type style:** `font-extrabold` headings with `tracking-tight`, small uppercase labels with `tracking-widest`, `font-mono` for file names.

### Spacing, radii, shadows
- **Tailwind v4, CSS-first config.** `--spacing: 4px`.
- **Radius tokens:** `forge-pill` 9999px, `forge-xl` 16px, `forge-lg` 12px, `forge-md` 8px. Cards commonly use `rounded-[24px]` (the old privacy page card matches this with a 24px radius and 2px border).
- **Common padding:** `p-4`, `p-5`, `p-6`.
- **Shadows:** coloured glows at 0.15–0.3 opacity.

### Icons and images
- **Interface icons:** `lucide-react` (ISC licence) is what the app uses; `@heroicons/react` is installed but unused. The site will inline the same Lucide icons as static SVG (via `@lucide/astro` or copied SVGs). The icons in use include `Cpu`, `Fingerprint`, `KeyRound` and `ShieldCheck`.
- **Logo:**
  - `src-tauri/app-icon.png` (1254², master)
  - `src-tauri/icons/AppIcon.icon/Assets/app-icon-ios{,-dark,-mono}.png`
  - The favicons already in this repo
- **Screenshots** for the home page, features page, blog and press kit:
  - `fastlane/screenshots/ios/en-GB/*`: 6 screens each for iPhone and iPad
  - `.app_store/{light,dark}/*-1..5.png`: Mac, 2880×1800
  - `.app_store/windows/…` including `store-promo.png`
  - `src/assets/{set-up,directory,contact-identity}/*.png`
- **Not reused:** `public/favicon.svg` is the Vite default, not the brand.

### Tone
The app repo's `CLAUDE.md` matches this repo: plain language, no "we", no contractions, no internal security detail, no hyphenated line breaks.

### Store facts found
- **Microsoft Store ID:** `9P25BS9L8LNB` (`.app_store/final_ready_for_upload.csv`).
- **Bundle IDs:** `com.darrencorbett.doughnutforge` and `com.darrencorbett.doughnutforge.mobile`.
- **No App Store numeric ID** exists anywhere in the repo. See decisions.

### How reuse works without editing the app repo
`scripts/sync-from-app.mjs` runs locally only and reads `~/git/doughnut-forge`. It copies:
- the chosen locale keys into `src/i18n/app/<lang>.json`
- the store copy into `src/i18n/store/<lang>.json`
- the selected screenshots into `src/assets/app/`

It also writes a header comment noting the source file and app version (0.4.42). The output is committed, so CI never needs the app repo. The `@theme` tokens are copied into `src/styles/tokens.css` with a comment naming the source.

---

## 3. forge-privacy `index.html` → new privacy and support pages

### What the old page is
A single card page: max width 42rem, white card with a 24px radius on `#F5F8FA`, the same system font stack. It has:
- A `<select>` language picker grouped by region, with the same 30 locales.
- An inline script that swaps `data-i18n` strings in the browser. The language comes from `?lang=`, then the browser language, then English.

All 30 languages have full translations:
- en/en-US share one set of strings, and es/es-MX share another.
- Section 5 is merged in from a separate `SEC5` table.
- Links are tokens (`[[gh]]`, `[[tally]]`, `[[ico]]`, `[[ghp]]`) resolved at runtime.

### Content and where it goes

| Old section | New home |
|---|---|
| Title, "Effective Date: October 2026", hero ("zero-knowledge, local-first…") | `/privacy/` header |
| 1. Data Storage & Deletion (keys, `.vltc2`/`.vlt2` stay on device) | `/privacy/` |
| 2. Analytics and Telemetry (no trackers; Apple/Microsoft aggregate stats) | `/privacy/` |
| 3. Support & Contact (GitHub Issues link; Tally "Privacy Contact Form") | `/privacy/` **and** quoted verbatim in the contact section of `/support/` |
| 4. Changes to this Policy | `/privacy/` |
| 5. Your Rights and Legal Disclosures (legitimate interest, retention, UK ICO, under-13s, GitHub Pages hosting and IP logs, DNT) | `/privacy/` |
| "Published by Darren Corbett." | `/privacy/` footer line; company details also go in the site footer and on `/legal/` |

### How the move works
- **Extraction:** a script extracts every language's strings into `src/content/legal/privacy/<lang>.json`, keeping the keys exactly. It is a one-off and its output gets reviewed.
- **Static rendering:** each `/<lang>/privacy/` page is rendered statically with the link tokens resolved at build time. There is no client JavaScript.
- **Wording check:** a check script compares the rendered text against the original strings, so the wording is provably unchanged.
- **Support page:** the old page has no separate support page, so `/support/` is mostly **new copy**, which needs your approval:
  - how to get help
  - links to the three issue forms
  - "issues are public and need a GitHub account"
  - the bold never-attach warning
  - no links to Answered questions or Known issues until Phase 5 ships (next week). Until then the page offers only the GitHub issues link and the bold never-attach warning.

### Conflicts to flag for you (wording kept as is; changes proposed separately later)
1. The policy uses "we"/"our" throughout, which breaks the copy rule. The legal rule (keep wording exactly) wins for now.
2. "Published by Darren Corbett." is not the UK Ltd company details that CLAUDE.md requires.
3. The Tally form is a third-party form that collects personal data. It is not on this site, but the claim "collect no personal data" has to stay true. The policy already scopes this exception, and the site will only link out to the form.
4. Section 2 names only the App Store and Microsoft Store. Google Play will need adding when Android ships.
5. Section 5 says "This page is hosted on GitHub Pages". After the move it should say "site", and it stays true.
6. "zero-knowledge" is jargon under the copy rules.

### Redirect (planned in Phase 6, done only after you approve)
Replace forge-privacy's `index.html` with a short page that has:
- `<meta http-equiv="refresh" content="0; url=https://doughnut-forge.app/privacy/">`
- `<link rel="canonical">` pointing at the new page
- a visible link
- a tiny inline script that maps `?lang=de` to `/de/privacy/`

The store Support URL (the forge-privacy issues page) is unaffected.

---

## 4. Phases

### Phase 1: setup, design system, layout, English home page (mobile first) — **for approval now**

**Scaffold:**
- Astro (pinned versions), TypeScript strict, Tailwind v4 through `@tailwindcss/vite`.
- Move `CNAME`, `.nojekyll`, `.well-known/`, favicons and `site.webmanifest` into `public/`.

**i18n configuration:**
- Set up for all 30 locales from day one in `astro.config.mjs`. The default `en` sits at `/`, the rest at `/<lang>/` with lowercase paths (e.g. `/pt-br/`).
- Only English pages are generated in this phase, so URLs never change later.

**Design system** in `src/styles/tokens.css`:
- The app `@theme` tokens, ink colours, radii, glow and system font stack.
- Light and dark mode through `prefers-color-scheme`.
- Global no-hyphenation rules: `hyphens: manual`, `overflow-wrap: normal`, `text-wrap: balance` on headings, `word-break: keep-all` for ko, `auto-phrase` for ja/zh where supported.
- Visible focus rings in forge-blue, and `prefers-reduced-motion` respected.

**Base layout** `src/layouts/Base.astro`:
- `<head>` with title, meta description, canonical, Open Graph and Twitter tags (default OG image), the favicon set, theme colour, `lang` and `dir`.
- Header: logo and nav. On mobile it opens with `<details>`, so it needs no JavaScript.
- Footer: nav, company line, links to privacy and legal.
- Skip link.
- A `SEO.astro` component, so hreflang can be added in Phase 3 without touching pages.

**Components:**
- `Button`
- `Card`
- `Section`
- `FeatureItem` (Lucide icon + text)
- `StoreBadges`: official badges, self-hosted, with region-honest wording and no EU availability promise
- `Screenshot` (responsive `<Picture>`)

**Data:**
- `src/data/prices.ts` is reference only and never rendered (see decisions).
- `src/data/stores.ts` holds the store URLs and IDs, with placeholders guarded.
- `src/data/company.ts` holds the company details, with placeholders guarded.
- `scripts/check-placeholders.mjs` fails the deploy if any placeholder remains.

**Home page** (`src/pages/index.astro`, English):
- A hero built from the app's store subtitle and promo.
- Features summary, using the store description's headings.
- "Pay once" pricing teaser, read from the price data.
- Platform/download block.
- Real app screenshots.
- `SoftwareApplication` JSON-LD.

**Tooling:**
- `scripts/sync-from-app.mjs` (English and screenshots for now).
- A GitHub Actions deploy workflow, **not enabled until you approve the switch of the Pages source**.

**Review deliverable:**
- `npm run build` with zero warnings.
- A local preview, with screenshots of the home page at 360, 768 and 1280px in light and dark.
- A Lighthouse mobile report for the home page.
- The diff and a proposed commit message.

**Goals served:** launch gets the foundation and the page most visitors land on. SEO gets fast static HTML, semantic structure, i18n-ready URLs and structured data from day one.

### Phase 2: remaining pages in English
**Pages:**
- `/features/`: one section per feature, with screenshots and app feature names.
- `/pricing/`: one-time price from the data file, no subscription, and a store-pricing note.
- `/download/`: per-platform store links:
  - Mac, iPhone/iPad and Windows are live.
  - Linux gets an honest status.
  - Android says "coming", with no fake link.
  - The page carries `SoftwareApplication` JSON-LD.
- `/privacy/`: the verbatim English policy.
- `/support/`: new copy plus the FAQ with `FAQPage` JSON-LD. The FAQ answers are new copy for approval.
- `/press/`: logo pack, icon, screenshots zip, fact sheet and boilerplate.
- `/legal/`: imprint with UK Ltd details.
- A blog index and post layout (empty until Phase 4).
- 404 page.

**Site files:**
- `sitemap.xml` (`@astrojs/sitemap`)
- `robots.txt`
- OG images generated per page at build time with satori and resvg, which are local and self-hosted.
- A wording-check script for privacy.

**Review deliverable:** every page at the 3 widths, Lighthouse on home, the privacy wording diff showing no changes, and the new support/FAQ copy marked for approval.

**Goals served:** completes the launch page set. Each page targets its own intent ("download encryption app Mac", "offline encryption app price").

### Phase 3: all languages, hreflang, language switcher
**Translation sources:**
- **String files:** `src/i18n/ui/<lang>.json` for site UI and page copy. A type-checked key set makes the build fail on any missing key.
- **App wording:** reused through the sync script for feature names and button labels.
- **Store copy:** reused for the hero and feature blurbs.
- **New strings:** these need translation. I would draft them in the app's voice per language and flag them for your review; nothing is bulk-dumped.
- **Privacy:** verbatim from the forge-privacy strings for all 30.

**hreflang:**
- Every page carries `<link rel="alternate" hreflang>` for all 30 plus `x-default` → `/`.
- The sitemap carries `xhtml:link` alternates.
- `en` and `en-US` are handled as decided below.

**Language switcher:**
- A static menu with native names grouped by region (from the app's `languages.ts`).
- Each entry links to the same page in that language.
- It works without JavaScript.
- There is no automatic redirect by browser language, which helps both SEO and user control.

**Layout checks:**
- Check long German, Finnish and Hungarian words at 360px.
- Check Thai, Japanese, Chinese and Korean line breaking.
- Fix with layout, never hyphenation.

**Review deliverable:** all pages in all languages building; screenshots of en, de, ja, th and hi at 360px; a hreflang validation report.

**Goals served:** launch gets core pages in every language. SEO gets 30 indexable locale trees, correctly cross-linked.

### Phase 4: launch blog posts as drafts
**The four posts from CLAUDE.md**, written in English with `draft: true`. Each has:
- one main search phrase
- title and meta description
- author and date
- `Article` JSON-LD
- real screenshots or simple SVG illustrations, with alt text
- internal links to features and download where they fit

**Build behaviour:**
- Drafts render in `npm run dev` and in a `DRAFTS=1` preview build.
- Drafts are excluded from production, from the sitemap and from feeds.
- An RSS feed is added (`@astrojs/rss`).

**Review deliverable:** the 4 drafts rendered in a preview, plus a facts checklist per post (each claim checkable today).

**Goals served:** launch needs 3 or more posts. SEO gets the first targeted, useful content.

### Phase 6: SEO checks, Lighthouse, accessibility, launch checklist
**Launch scope:** nothing in this phase needs Phase 5. The checks cover the launch pages only. `/support/answered/`, `/support/known-issues/`, per-issue pages, the issue forms, `scripts/fetch-issues.mjs` and the scheduled workflow do not exist at launch. Nothing checks for them or requires them.

**Checks:**
- Lighthouse mobile and desktop on representative pages in several languages, aiming for 95+ on all four.
- axe or pa11y run across all pages for WCAG 2.2 AA; manual keyboard pass; contrast audit against the ink tokens.
- Link checker (internal plus store links).
- HTML validation; one `h1` per page; canonical and hreflang consistency; structured data checked with the schema validator.
- Image sizes and alt text in every language.
- Link checker and HTML checks also confirm that no page links to `/support/answered/` or `/support/known-issues/`.

**Launch items:**
- Test `.well-known/apple-app-site-association` (content type, no redirect).
- Prepare the forge-privacy redirect page for approval.
- Pages source switch, HTTPS enforced, DNS check.
- Only after the switch, and after a deploy has served identical files: remove the root copies of `.well-known/`, `CNAME`, `.nojekyll`, the icons, `site.webmanifest` and `index.html`. Until then the live branch deploy depends on them, including the apple-app-site-association file that password managers in the shipped apps rely on.
- A `launch-checklist.md` covering:
  - store listing URL updates, which you do
  - the iOS price end-date reminder (11 Dec 2026)
  - the EU availability wording
  - Phase 5 (issue forms and answered issues) is scheduled for the week after launch and is not a launch blocker.

**Review deliverable:** a report of all checks with scores, and the redirect page diff.

**Goals served:** a safe launch that does not break the old URLs, and a technical SEO baseline to grow from.

## Next week: not part of launch
Phase 5 is planned in full below and keeps its number. It ships after launch. It adds two things to `/support/`: links to the three issue forms, and links to Answered questions and Known issues. It also adds new URLs to the sitemap. Phase 6's checks are rerun on the changed and new pages when it ships.

### Phase 5: support issue forms + scheduled "answered issues" Action
**In `forge-privacy`, prepared as files for you to review, never pushed without approval:**
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `question.yml`, `feature_idea.yml`.
- `config.yml`, with `blank_issues_enabled: false` and contact links.
- Every form opens with the bold warning: never attach vault files, identity files, recovery words, passphrases or screenshots that show them.
- No form field asks for personal data.

**In this repo:**
- A build-time script `scripts/fetch-issues.mjs` reads **public** issues through the GitHub REST API:
  - labels `site-faq` and `site-known-issue`
  - unauthenticated, with no token of any kind (forge-privacy is public)
- It writes `src/data/issues.json`. Pages are generated statically: `/support/answered/`, `/support/known-issues/`, and one page per issue.
- Only the labelled issue and your answer are shown (the comments decided below); usernames are left out.
- A scheduled workflow (daily cron, plus manual dispatch) rebuilds and deploys.
- If the API call fails, the build keeps the last committed data rather than publishing empty pages.

**Review deliverable:** the forms in a preview, and the generated pages from real or test issues.

**Goals served:** support stays on the URL the store listings link to. Answered questions become indexable long-tail content.

---

## Post-launch copy review
- After launch, all site copy and the blog posts are reviewed by an external copywriter. Their notes will be supplied later.
- Process when notes arrive: the owner pastes them in; Claude plans the changes in plan mode for the owner's approval; applies them to the English strings and posts; then retranslates only the changed strings, runs the independent reviewer on them, and republishes.
- The privacy policy is excluded unless the owner approves a specific wording change, since it stays word for word with forge-privacy.
- Pre-launch review is limited to facts and automated checks. For blog posts the owner approves each post's claims table, not the full text.

---

## 5. Decisions — answered (Phase 1 approved only)

| # | Decision | How Phase 1 applies it |
|---|---|---|
| 1 | Use `#1da1f2` everywhere. | Replace `#0D98FE` in `site.webmanifest` (`theme_color`, `background_color`) and `<meta name="theme-color">`. |
| 2 | Company details not yet given. | `src/data/company.ts` holds clearly marked placeholders (`[[PLACEHOLDER: company name]]` and so on). `scripts/check-placeholders.mjs` runs in the deploy workflow and **fails the deploy** if any placeholder appears in `dist/`. Local builds warn loudly. |
| 3 | Store links. | `src/data/stores.ts`: Mac and iOS Apple IDs are placeholders, guarded the same way. Microsoft Store `9P25BS9L8LNB` is confirmed. Linux is free, "coming November 2026", shown with no link. Android is "coming". |
| 3a | Not sold in the EU yet. | Download copy says availability varies by country and never names the EU as available. Badges link to the store, which shows availability itself. |
| 4 | No price amounts on pages. | Pages say "one-time purchase, never a subscription", and the store badges handle local prices. `src/data/prices.ts` is kept for reference only and is not rendered: Mac $4.99, Windows $4.99, iOS $2.99 until 2026-12-11 then $3.99, Linux free. |
| 5 | Pages source. | You switch Pages to GitHub Actions when ready. The deploy workflow is added in Phase 1 but only runs on `workflow_dispatch` until you say go. |
| 6 | Locales. | Keep all 30 locales, with hreflang `en-GB`/`en-US` and `es-ES`/`es-MX`. |
| 7 | Translations. | Drafting translations for core pages is fine, flagged in the review. |
| 8 | Issue fetching. | forge-privacy is public, so the Phase 5 fetch uses the unauthenticated public API with no token at all. A daily cron is well within rate limits. |

**Still open, needed later:**
- Which comment counts as "the answer", and the label names (Phase 5, next week).
- Blog author name and bio (Phase 4).
- Policy wording proposals (after Phase 2).

## 5b. Original decision list (for reference)
**Needed for Phase 1:**
1. **Brand/theme colour.** Should the site use the app's `#1da1f2`, replacing `#0D98FE` in `site.webmanifest` and `theme-color`? Or is `#0D98FE` intentional for the web?
2. **Company details for the footer and `/legal/`:** registered company name, number, registered office address, and contact method. CLAUDE.md requires these and they are not in either repo. Placeholders are used until you supply them.
3. **Store links:**
   - the App Store app URL or ID (not found in the app repo)
   - confirmation that Microsoft Store `9P25BS9L8LNB` is the public product ID
   - the Linux distribution plan (store? direct download? "coming"?)
   - the countries where it is on sale, for the EU wording
4. **Prices** for the data file: current Mac, iOS and Windows prices, and the iOS price after 11 December 2026.
5. **Pages source switch.** Are you happy for deploys to move to GitHub Actions? You flip the setting.

**Needed later:**
6. **English variants.** Keep `en` (UK) at `/` and `en-US` at `/en-us/`, and `es` vs `es-MX` as separate pages, or merge? I recommend keeping all 30 to match the app, with hreflang `en-GB`/`en-US`.
7. **New translated copy.** Who reviews non-English text before publishing? Is it acceptable for me to draft translations per language, flagged for review?
8. **Issue labels and answers:** the label names (`site-faq`, `site-known-issue`), and which comment counts as "the answer" (e.g. your latest comment, or one with a `site-answer` marker).
9. **Blog author name and bio**, and whether posts show a byline photo.
10. **Policy changes.** Do you want me to propose wording fixes for the six conflicts in section 3 now, or after launch?

---

## Verification (applies to every phase)
- `npm run build`: zero warnings. `astro check`: zero errors.
- `npm run preview`, then screenshots of every changed page at 360, 768 and 1280px in light and dark, with no horizontal scroll at 360px.
- One left-to-right language checked (and an RTL check once an RTL language exists; none today).
- Lighthouse (mobile) on the home page, with scores reported.
- Diff, file list and commit message shown, then wait for your yes before committing.
