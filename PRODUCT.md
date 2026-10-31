# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Everyday people who are not technical. They want to keep their files and text private without handing them to a cloud service, and they want to share them only with people they trust. Most arrive from a search or from an app store listing, on a phone first.

Technical, privacy-minded readers are a second audience. They check the claims before they believe them, and the Security page and Technical details page (`/security/technical-details/`) are there for them.

Existing users are a third audience: they come to the support pages for answers.

## Product Purpose

doughnut-forge.app is the marketing and support site for Doughnut Forge, an offline file encryption app. The app locks files and text on the person's own device, and they share them only with the people they choose.

The site succeeds when a visitor:

- understands what the app does and goes to the right store for their device;
- trusts the claims, because each one is plain and can be checked;
- finds the site through search (the blog and core pages);
- finds help on the support pages without having to open an issue.

There are no analytics, so these guide judgement; they are not measured.

## Positioning

The app works entirely on the person's device: no account, no servers, no subscription, no tracking, and it works without the internet. It uses post-quantum encryption. It is a one-time purchase on each platform, from that platform's store.

The site lives up to the same promise: it has no trackers, no third-party requests and no forms that collect personal data.

## Operating Context

- Static Astro site on GitHub Pages, in 30 languages, each at its own URL. No right-to-left language today.
- Visitors read on phones first, then tablets and desktops.
- Store links go through `/go/` pages and official store badges. A branded fallback badge appears when a content blocker hides an official badge.
- Support happens in public GitHub issues in the forge-privacy repo. Answered issues the owner labels are built into static pages at deploy time.

## Capabilities and Constraints

- On sale today: Mac, Windows, iPhone and iPad. Android is planned (see `src/data/roadmap.ts`). The app is not sold in the EU yet, so the site must not promise availability there.
- Pages never show prices. They say "one-time purchase, never a subscription", and the store shows the local price. The amounts are recorded in `src/data/prices.ts` only.
- High-risk files and every copy rule are listed in `CLAUDE.md`; it is the authority for what needs the owner's yes.

## Brand Commitments

- Name: Doughnut Forge.
- The site matches the app's look: colours, fonts, spacing, icons and tone come from the app repo (`~/git/doughnut-forge`). Never invent a new brand.
- Voice: plain language, not too technical, never talks down to the reader. No "we", no contractions.
- Never say "military-grade", "unbreakable" or "audited". Never say a file's sender is verified. Never say "pay once" for the whole product: it is a one-time purchase on each platform.
- Self-hosted assets only: no external fonts, CDNs or embeds.

## Evidence on Hand

The proof is plain, checkable facts: no account, no servers, no subscription, and post-quantum encryption, with the Technical details page as backing for anyone who wants to check. Blog claims and their sources are tracked in `docs/BLOG-CLAIMS.md`; technical facts come from `docs/TECH-SPEC.md`.

Real assets:

- App screenshots: `src/assets/app/` (iPhone and iPad).
- Press kit icons and screenshots: `src/assets/press/`; the app icon: `src/assets/brand/app-icon.png`.
- Official store badges: `src/assets/badges/`.

There are no reviews, testimonials, ratings, user counts, press coverage, audit claims or "trusted by" badges. None exist yet, and design work must never invent them. The app has not had an independent security audit; the site says so, and says one is planned.

## Product Principles

1. Every claim is true and checkable today; plain facts are the proof.
2. The site keeps the app's promise: nothing on it tracks visitors or sends their data anywhere.
3. Explain the benefit in plain words; leave the internals to the Technical details page.
4. Every page works in every language, on the smallest phone first.
5. Send people to the right store honestly, without promising what does not exist.

## Accessibility & Inclusion

WCAG 2.2 AA: keyboard navigation, visible focus, sufficient contrast, and respect for reduced motion. Alt text in every language. Words never break or hyphenate across lines in any language. Pages work at 320px wide with no horizontal scrolling.
