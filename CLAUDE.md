Type: marketing site
Ethos: the general rules and "Marketing websites: move faster" in ~/.claude/CLAUDE.md apply here. Where this file is stricter, it wins.
Lean: a one-person business, free and local first. No new paid services, GitHub Actions, CI minutes or dependencies without asking first.
High risk here (stop and ask before changing):
- Files the apps depend on: `public/.well-known/apple-app-site-association` and its root copy `.well-known/apple-app-site-association`, `public/.well-known/security.txt`, `public/.nojekyll`
- Store links and badges: `src/data/stores.ts`, `src/data/badges.ts`, `src/assets/badges/`, `src/components/StoreBadge.astro`, `StoreFallback.astro`, `StoreLinks.astro`, `src/pages/go/` (these replaced `/get/`)
- Prices: `src/data/prices.ts`
- Privacy, support, legal and security pages: `src/content/legal/privacy/`, `src/data/privacy.ts`, `src/views/PrivacyPage.astro`, `SupportPage.astro`, `LegalPage.astro`, `SecurityPage.astro`, the support and report links in `src/data/site.ts`, the issue forms in `docs/forge-privacy/.github/ISSUE_TEMPLATE/`
- Answered issues on the site: `scripts/fetch-issues.mjs`, `src/data/issues.json`
- Build ID and the open-tab reload check: `scripts/build-id.mjs`, `src/data/build.ts`, `src/components/FreshCheck.astro`, `/build.json`
- Translated pages and languages: `translatedPages` in `src/i18n/alternates.ts`, `src/i18n/languages.json`
- Domain, DNS, hosting and redirects: `CNAME` and `public/CNAME`, the root rollback files (until step 6 in HANDOVER), GitHub Pages settings, DNS records, the forge-privacy redirect (other repo, `site.legacyPrivacyUrl`)
- Deploy and build: `.github/workflows/` (no job runs on a schedule today; adding one needs a yes, see below), `package.json` scripts, `astro.config.mjs`, `scripts/check-*.mjs`
Claims: every claim must have a source, as in `docs/BLOG-CLAIMS.md`, and follow the Copy rules below: no "we", no contractions, no "military-grade", "unbreakable" or "audited", never say a file's sender is verified, never "pay once" for the whole site (one-time purchase on each platform).
Silent-breakage checks: `npm run build` (type check, plus checks for the files the apps need, privacy wording, translations, hreflang, social images, blocker names, issues and placeholders), `npm run build:deploy` (the same, strict), `npm run test:links` (internal links, live links, store links and the forge-privacy redirects; needs the network), `npm run test:layout`, `npm run check:reproducible`. The deploy also checks the uploaded archive and the live files.

# Doughnut Forge website

CI is lean. Never add a GitHub Action, scheduled job or new CI step without saying what it costs (runs and minutes per month) and why a local check is not enough, and getting my yes first.

Marketing and support site for Doughnut Forge, an offline-first encryption app for Mac, Windows, Linux, iPhone and iPad (Android coming). Hosted on GitHub Pages at doughnut-forge.app.

The app repo is at ~/git/doughnut-forge. Read it for style, copy and languages. Never edit it from this repo.

At the start of each session, read docs/HANDOVER.md; at the end of each phase, update it.

## Goals

Every plan must say how it serves both goals.

### Immediate: launch
- A fast, static, responsive site that explains the app and sends people to the stores.
- Pages: home, features, pricing (one-time purchase, never a subscription), download (store links per platform), privacy policy, support/FAQ, press kit, blog.
- At least 3 blog posts live at launch (see Blog).
- `/.well-known/apple-app-site-association` for Apple password-manager linking. Add `.nojekyll` so GitHub Pages serves `.well-known`.

### Long-term: organic search
- Rank for searches like "offline encryption app", "encrypt files without the cloud", "quantum-safe encryption app".
- Grow through useful, accurate content and strong technical SEO, not volume.
- The structure must scale to many blog posts and languages without redesign.

## Hard rules
- Mobile first and fully responsive. Design and test at 360px wide first, then tablet, then desktop. No horizontal scrolling.
- Match the app's look: take colours, fonts, spacing, icons and tone from the app repo's styles and assets. Never invent a new brand.
- No tracking: no analytics scripts, no third-party cookies, no external fonts, CDNs or embeds. Self-host every asset. The site must live up to an app that has no servers.
- No forms that collect personal data.
- No web storage, with one exception (owner, 25 October 2026): the page check that keeps open tabs on the live build (`src/components/FreshCheck.astro`) may keep the build ID in `sessionStorage`. It holds only the build ID and clears when the tab closes. This exception is for the website only: the app's no-web-storage rule still applies to the app and must never be relaxed there.
- Commit freely on main; ask before every push. A push deploys the site. Work trunk-based on main. Never create branches.
- After a push, say it is pushed and stop: never watch or poll GitHub runs. GitHub emails the owner if a run fails. Check a run only when the owner asks, or once, when it should be done, if the push changed a workflow.
- Before every commit, run `npm run check:commit`: it shows what is staged (`git diff --cached --stat`) and type-checks with `astro check`, which covers the tests too. Never stage ahead; a test commit holds only tests and test config.
- After changing `astro.config.mjs`, `package.json`, `scripts/` or `src/assets/`, run `npm run check:reproducible`: two builds of the same commit must be the same, or every deploy gets a new build ID.
- Before naming a cause for something the owner sees on the live site, reproduce it against the live site in a clean browser (for example a fresh WebKit iPhone context). Never explain it by the last thing fixed.
- After any change to how the site is built, uploaded or hosted (the deploy workflow, Pages settings, the upload step), check every file the apps depend on (`/.well-known/apple-app-site-association`) at its live URL before calling the change done.
- A plan for any fallback or degraded state (a blocker, an error, a missing file) says what the visitor will see, and asks the owner first if it differs from the normal experience.
- Nothing is published without approval. New blog posts start as drafts (`draft: true`).

## Languages
- The site supports every language the app supports. Get the list from the app repo's `src/locales/`.
- Reuse the app's existing translations (feature names, button labels) wherever they fit, so wording matches the app.
- Each language has its own URL (`/de/`, `/fr/` ...), `hreflang` tags for all languages plus `x-default`, and a language switcher.
- Support right-to-left languages properly if any are in the list.
- Core pages are translated into every language at launch. Blog posts launch in English first; translations are added only after review, never machine-dumped in bulk.
- Text must never break or hyphenate words across lines in any language; fix with layout instead.

## Copy
- Plain language, not too technical, never talks down to the reader.
- No "we" and no contractions.
- Only make claims that are true and checkable today. No "military-grade", "unbreakable" or "audited" until it is true.
- Do not explain internal security design beyond what a user needs to understand the benefit.
- Prices change (iOS launch pricing ends 11 December 2026), so keep prices in one data file, never hard-coded in pages.
- Use official App Store, Microsoft Store and Google Play badges as their guidelines require.

## Blog
- Each post answers a real question people search for, gives genuinely useful help, and links to the app only where it fits.
- Launch posts (drafts for approval):
  1. How to encrypt files on a Mac without using the cloud
  2. Why offline encryption keeps your files private
  3. What quantum-safe encryption means, in plain language
  4. How to share encrypted files with someone you trust
- Every post has: a clear title and meta description, one main search phrase, real app screenshots or simple illustrations, author and date.
- Quality over quantity: no more than one or two new posts a week.

## Technical SEO
- Static output, fast: aim for Lighthouse 95+ on mobile for performance, accessibility, best practices and SEO.
- Semantic HTML, one `h1` per page, descriptive URLs, `sitemap.xml`, `robots.txt`, canonical tags.
- Structured data: `SoftwareApplication` on home and download pages, `Article` on posts, `FAQPage` on the FAQ.
- Open Graph and social preview images for every page.
- Compressed, correctly sized images with alt text in every language.
- Accessibility: WCAG 2.2 AA, keyboard navigation, visible focus, sufficient contrast, respects reduced motion.

## Support
- Support stays in GitHub issues at github.com/Darren-Corbett/forge-privacy/issues. That URL is in the store listings and must keep working.
- The site has no server and holds no GitHub token, ever. Never put a token in site code.
- Support page: explains how to get help, links to "New issue" using GitHub issue forms (templates for bug report, question, feature idea) in the forge-privacy repo, and says plainly that issues are public and need a GitHub account.
- Every issue form warns, in bold: never attach vault files, identity files, recovery words, passphrases or screenshots that show them.
- Answered issues appear on the site through the deploy, which reads public issues at build time and generates static pages (for example "Known issues" and "Answered questions"). The deploy runs on pushes and by hand ("Run workflow" after labelling an issue), never on a schedule. Visitors' browsers never call the GitHub API.
- Only show issues I have labelled for the site (for example `site-faq`), so spam and unanswered issues never appear.

## Legal
- The privacy policy and support page already exist in the forge-privacy repo (github.com/Darren-Corbett/forge-privacy, a single index.html on GitHub Pages). Its URL is the Privacy and Support URL in the store listings, so it must keep working.
- Bring that content into this site as the privacy and support pages. Keep the wording exactly as it is; propose any changes separately for approval. Translate it into every site language.
- Never break the old URL. When the new pages are live, plan a redirect page in forge-privacy (meta refresh plus a canonical link to the new page, with a visible link). Store listings are updated by me, not by Claude.
- The policy must state plainly that the app and site collect no personal data, and must stay true as the site changes.
- No company details on the site. The footer carries only the copyright line "© {year} Doughnut Forge", and the legal page carries only the trademark notices.
- The apps are not sold in the EU yet, but the site is visible there; store links must not promise availability that does not exist.

## Before saying a change is done
- Build passes with no warnings.
- Check every changed page at 360px, 768px and 1280px.
- Run the layout tests in WebKit with the iPhone profile, at 320px as well (`npm run test:layout` does both). Desktop Chromium alone misses Safari-only bugs.
- Check one left-to-right and (if supported) one right-to-left language.
- Run Lighthouse on the home page and report the scores.
- Copy-only fixes: npm run build and the layout tests (including WebKit iPhone) are enough. Three widths, the RTL check and Lighthouse stay for design and layout changes.
