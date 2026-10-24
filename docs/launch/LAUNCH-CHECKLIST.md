# Launch checklist

Launch scope: Phases 1–4 and 6. Phase 5 (issue forms and answered issues) is scheduled for the week after launch and is not a launch blocker.

## Checked before launch (23 October 2026)

| Check | Result |
|---|---|
| Deploy build (`npm run build:deploy`) | passes: 0 errors, 0 warnings, no placeholders, no stale translations |
| Pages | 245 indexable (8 pages × 30 languages, the blog index, 4 posts) plus the 404 page |
| hreflang and sitemap | every reviewed language cross-linked; the sitemap matches each page's hreflang; English-only blog pages have none |
| Lighthouse, mobile and desktop | 100 / 100 / 100 / 100 on /, /de/, /ja/features/, /th/support/, /press/, /blog/ and a post |
| Accessibility (axe-core 4.14, WCAG 2.0–2.2 A and AA) | 0 violations on every page at 360px in light mode, and on a set of pages in dark mode |
| Layout | every page in every language at 360, 768 and 1280px: no horizontal scroll, no word split across lines, one h1 |
| HTML (html-validate 11.16.2) | valid; the only messages are heading IDs that start with a number in one post (allowed in HTML5) |
| Internal links and images | no broken link, no missing image, every image has alt text (empty only for the decorative logo) and a size |
| Structured data | SoftwareApplication (home, download), FAQPage (support), Article with an Organization author (posts) parse and carry their main fields. SoftwareApplication has no `offers`, because pages never show prices; this means no price rich result, by design |
| External links | all 41 resolve. The Microsoft Store refuses fast repeated requests (403); checked slowly, each listing loads |
| Store links | Mac `https://apps.apple.com/app/id6812778888` → "Doughnut Forge Desktop" by Darren Corbett. Windows `https://apps.microsoft.com/detail/9P25BS9L8LNB?hl=<language>` → "Doughnut Forge" by Darren Corbett. No country code in either; each store picks the visitor's country |
| Links to Phase 5 pages | none |
| Company details | none on the site; footer shows "© 2026 Doughnut Forge" only |
| apple-app-site-association | the built file is byte for byte the live root copy. The live file is served with `content-type: application/octet-stream` from GitHub Pages today, and the deploy keeps the same host, so nothing changes for the apps |

## Steps, one at a time

| Step | Status (23 October 2026) |
|---|---|
| 1. Push `main` | done |
| 2. Pages source to GitHub Actions | done |
| 3. Run the deploy | done: the first run left out `.well-known/` (hidden files), rolled back; fixed in `42fb02c`, rerun green |
| 4. Check the live site | done: every page, feed, sitemap, robots.txt; apple-app-site-association byte for byte |
| 5. Deploy on every push | done (`d9d61e7`) |
| 6. Remove the old root files | deferred: kept as the rollback until on or after 6 November 2026 |
| 7. Redirect the old privacy page | done (forge-privacy `a9ed0d8`) |
| 8. Store listing URLs | in progress (owner) |
| 9. Google Search Console | done (owner, 24 October 2026): Domain property verified by DNS, sitemap submitted |

### 1. Push `main`
`git push origin main`

The live site is still served from the repo root ("Deploy from a branch"), so it keeps showing the old one-line page. The new files under `src/` and `docs/` become readable as plain files at the site's address until step 2, which is harmless.

### 2. Switch GitHub Pages to GitHub Actions
GitHub → Darren-Corbett/doughnutforge-site → Settings → Pages → Build and deployment → Source: **GitHub Actions**.

Leave the custom domain (doughnut-forge.app) as it is, and keep **Enforce HTTPS** ticked. Go straight on to step 3.

### 3. Run the deploy
GitHub → Actions → **Deploy site** → Run workflow → branch `main` → Run workflow. It takes a few minutes. Both jobs (build, deploy) must finish green.

### 4. Check the live site
- https://doughnut-forge.app/ shows the new home page; /de/, /ja/ and /blog/ load.
- `curl -s https://doughnut-forge.app/.well-known/apple-app-site-association` prints the same JSON as the repo's root copy, with HTTP 200 and no redirect.
- https://doughnut-forge.app/sitemap-index.xml, /robots.txt and /rss.xml load.

**If anything is wrong:** switch Source back to "Deploy from a branch" (`main`, `/ (root)`). The root files are still there, so the old site returns at once.

### 5. Deploy on every push (commit, shown first)
Add `push: branches: [main]` to `.github/workflows/deploy.yml`, so each push to `main` deploys.

### 6. Remove the old root files (commit, shown first)
Only after step 4 passes: remove the root copies of `.well-known/`, `CNAME`, `.nojekyll`, the icons, `site.webmanifest` and `index.html`. The deployed site serves them from `public/`. Update `scripts/check-production-files.mjs`, which compares the built files with the root copies, to check the built files alone.

### 7. Redirect the old privacy page (forge-privacy repo)
Replace forge-privacy's `index.html` with `docs/launch/forge-privacy-index.html`. It sends `?lang=de` to `/de/privacy/` and every language likewise, has a canonical link and a visible link, and keeps a link to GitHub issues. The issues page itself (the store Support URL) is not touched.

Check https://darren-corbett.github.io/forge-privacy/ and `…/forge-privacy/?lang=ja` once it is live.

### 8. Store listings (you)
- Privacy URL: `https://doughnut-forge.app/privacy/` (the old URL keeps working through the redirect).
- Marketing URL: `https://doughnut-forge.app/`.
- Support URL: unchanged (`https://github.com/Darren-Corbett/forge-privacy/issues`).

### 9. Optional: Google Search Console
Verify the domain through a DNS record (no script on the site) and submit `https://doughnut-forge.app/sitemap-index.xml`. It adds nothing to the site and tracks no visitors.

## After launch
- **11 December 2026:** iOS launch pricing ends. Pages never show prices, but update `src/data/prices.ts` so the record stays true.
- **EU:** the apps are not sold in the EU. The site promises no availability ("Availability depends on your country or region") and store links carry no country.
- **Next week:** Phase 5 (see `docs/PLAN.md`).
- **Post-launch copy review:** see `docs/HANDOVER.md`.
