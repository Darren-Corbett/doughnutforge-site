# Android release plan (website)

Findings only, 12 November 2026; corrected the same day with the owner's answers. Nothing on the site was changed. The changes themselves are made on a local release branch (as `release/v2-site` was for v2), merged to `main` on release day, and pushed only with the owner's yes.

How it serves both goals: on launch day, Android visitors get a working Google Play badge in every language, and nothing promises the app where it is not sold. For search, the home, download and structured data name Android, which is what Android searchers type ("offline encryption app Android").

Sources:
- **App facts: only `~/website-pack-android/app-answers.md`** (12 November 2026, read from `feature/android-live`, the branch Android ships from). The app repo is not read for this work (owner). Its "still changing" items and its country list are **unconfirmed until the owner says so**.
- This repo at `8f08058`.
- Google's badge rules (partnermarketinghub.withgoogle.com, Google Play lockups, icons and badges page) and Android's Credential Manager prerequisites (developer.android.com/identity/credential-manager/prerequisites).

## Owner's answers (12 November 2026)

- **Package name:** `com.darrencorbett.doughnutforge.mobile`. Stays.
- **Copy says "Android"**, not "Android phones and tablets".
- **Download card:** show "Needs Android 10 or later." (minimum Android 10, from `app-answers.md` §4).
- **Restore FAQ:** add Android backups. The identity is not in Android backups, so the recovery words are the only way back.
- **Unlock:** mention fingerprint or face unlock wherever unlock is described.
- **Text-sharing lines stay blocked** until the owner confirms sharing encrypted text has shipped on Android (see 1c).
- Price, release date, Play listing, signing fingerprint, screenshots, badge files and the country list: waiting.

## Must not claim for Android

From `app-answers.md` §5, followed exactly:
- Never say Android files are "unreadable while the phone is locked".
- Never use "Complete data protection" for Android.
- Never copy the wording of `technical.unlock.ios.text` to the Android line.

Guard: a build check (in an existing `scripts/check-*.mjs`, high risk, needs the owner's yes) that fails if a string or post that names Android also contains "unreadable while", "while the phone is locked" or "Complete data protection", in English. Translations are covered by the review, since they are written from the English.

---

## 0. Three findings that change the plan

1. **`assetlinks.json` is not needed on release day, if autofill is off.** `app-answers.md` says password saving and filling is being turned off on Android (approved 12 November), and Credential Manager is a later decision. That is in its "still changing" list, so it is **unconfirmed**. If it holds, `/.well-known/assetlinks.json` would do nothing at launch, and publishing it early only adds a file the deploy must guard. Recommendation: leave it out of the release branch; add it in its own item if Android autofill ever ships. Section 2.1 says exactly what goes in it.
2. **The store sentences break in English with Google Play.** Three strings put "the" before the store name: `go.open` ("Open the {store}"), `go.tap` ("Tap below to open the {store}.") and `pricing.oneTime` ("One-time purchase from the {store}"). With Google Play they read "Open the Google Play" and "from the Google Play". Other languages may have the same problem with articles and gender. Fix: the store name with its article per store, or separate strings per store, in all 30 languages, through the usual translation review.
3. **No Google Play badge files exist yet.** `src/assets/badges/google-play/` does not exist, and `alt.json` has only the English wording. `badgeArt()` throws when a file is missing, so flipping Android to "available" today fails the build. That is a good guard. `scripts/fetch-badges.mjs` only knows Apple and Microsoft sources, and the site only loads `.svg` badges; if Google's download has PNG only, the badge code needs a change (see 2.2).

---

## 1. Every place that mentions Android or "coming soon"

### 1a. Driven by data: change one line, the rest follows

The switch is in `src/data/stores.ts` (high risk):

```ts
{ id: "android", status: "coming" },
// becomes
{ id: "android", status: "available", store: "google-play", storeId: "com.darrencorbett.doughnutforge.mobile" },
```

Android then moves to second place (after iPhone and iPad) by itself. What follows from it, in all 30 languages:

| Place | Today | When Android is live |
|---|---|---|
| Download and pricing cards (`PlatformCards.astro`) | Android card, "Coming soon", no link | Google Play badge (with its two fallbacks); on pricing "One-time purchase from Google Play" (after the string fix in 0.2); on download "Needs Android 10 or later." (owner, see 2.3) |
| Store badge rows (`StoreLinks.astro`) | "Coming soon: Android." plus "Availability depends on your country or region." | Only the availability sentence. `download.coming` is then unused; keep it for the next platform (Linux) |
| Support FAQ "Which devices?" (`faq.which.a`) | "Available for iPhone and iPad, Mac and Windows. Coming soon: Android." | **Breaks**: with nothing coming, `SupportPage.astro` fills `{coming}` with an empty list and prints "Coming soon: ." Needs a version of the answer without the second sentence |
| Press fact sheet (`PressPage.astro`) | "Coming soon: Android" row | **Same problem**: an empty "Coming soon" row. Hide the row when nothing is coming |
| Structured data (`src/data/jsonld.ts`) | `operatingSystem`: "iOS, iPadOS, macOS, Windows" | "iOS, iPadOS, Android, macOS, Windows"; the Play listing joins `sameAs` in `Organization` |
| `/go/` pages (`src/pages/go/[code]/[lang].astro`) | 3 stores × 30 languages | 30 more pages under `/go/7427ad/<lang>/` (the code is the first 6 hex of SHA-256 of `google-play`). See 2.3 |
| Safari App Store banner (`Base.astro`, `appBanner`) | iOS only | No change. Android has no equivalent that fits the rules (Chrome's install prompt needs `related_applications` in the manifest; not proposed) |

### 1b. Strings that name Android as coming (30 languages each)

| Key | English today | When live |
|---|---|---|
| `meta.download.description` | "…the Mac App Store or the Microsoft Store. A version for Android is coming soon." | Name Google Play for Android; drop the last sentence |
| `meta.roadmap.description` | "What is planned next for Doughnut Forge, including Android and an independent security audit." | Drop Android ("…including an independent security audit") |
| `roadmap.android.title` (in `src/data/roadmap.ts`, status `next`) | "Doughnut Forge for Android" under Next | Move to `shipped`. Wording stays the same (roadmap rule) |
| `status.comingSoon`, `press.facts.coming`, `download.coming` | "Coming soon" | Unused while nothing is coming; keep for Linux |
| `legal.trademarks.other` | "Android is a trademark of Google LLC. Linux is…" | Add "Google Play and the Google Play logo are trademarks of Google LLC." Google's badge page does not ask for it, but Apple and Microsoft get the same line, and Google's brand terms expect it |

### 1c. Strings that list the platforms without Android (30 languages each)

These are true today and become incomplete. Each gets "Android" added (owner: just "Android", not "Android phones and tablets").

| Key | English today | Status |
|---|---|---|
| `meta.home.title` | "…offline file encryption for iPhone, iPad, Mac and Windows" (also `og:title`) | Ready |
| `meta.home.description` | "…for iPhone, iPad, Mac and PC. Encrypt files and text for the people you choose…" | **Blocked**: says text can be shared |
| `home.summary` | "Offline file encryption for iPhone, iPad, Mac and Windows." | Ready |
| `home.lead`, `features.lead` | "…locks your files and text on your iPhone, iPad or computer and lets you share them…" (`features.lead` adds "However you send them, only they can open them.") | **Blocked**: says text can be shared |
| `meta.features.description`, `blog.cta.text` | "Encrypt files and text on your own iPhone, iPad or computer, share them…" / "Encrypt files on your own iPhone, iPad or computer and share them…" | **Blocked** (`blog.cta.text` names only files, but is kept with its pair; release it on the owner's word if wanted sooner) |
| `home.what.text` | "…for Mac, iPhone, iPad and Windows. It locks your files and text on your own device, and you share them…" | **Blocked**: says text can be shared |
| `press.about.shortText` | "…for Mac, iPhone, iPad and Windows." | Ready |
| `meta.download.title` | "Download Doughnut Forge for iPhone, iPad, Mac and Windows" | Ready |
| `pricing.where.text` | "Buying on iPhone and iPad does not include Mac or Windows…" | Ready |
| `faq.platforms.a` | Lists the three stores; add "Google Play for Android" and say Android is a separate purchase too | Ready |

**Blocked** means: sharing encrypted text through Android's share sheet is not merged yet (`app-answers.md` §5, "still changing"). Until the owner confirms it has shipped, these lines keep their current wording, without Android, even on release day. That leaves them incomplete but true. On the owner's word they get Android added like the rest. No line may say "share it however you like" for Android before then.

Strings that name iPhone and iPad **on purpose** and stay as they are: `features.ios.*` (iOS-only extras), `technical.unlock.ios.label` and `.text`, `technical.limits.passcode.text` (see below), `press.shots.text` (the screenshots are of the iPhone and iPad app), `home.phones.alt*`, `home.phones.text` and `v2.notes.*` (what was new in v2; Android did not exist then), `v2.notes.backups` (part of the v2 notes).

**Restore FAQ (`faq.restore.a`, owner's yes).** Today: "Backups of your iPhone, iPad or Mac do not include your identity, so restoring a device backup does not bring it back. … If you first restore a backup of your iPhone, iPad or Mac and then enter your recovery words, your contacts come back too."
- Add Android backups to the first sentence, for example "Backups of your iPhone, iPad or Mac, and Android backups, do not include your identity…". Source: `app-answers.md` §5, "No Android backup".
- **Do not** add Android to the last sentence. The app's data is never in an Android backup, so on Android a backup brings back neither the identity nor the contacts. A short Android line may say so: "On Android, a new phone starts empty: your recovery words bring back your identity, but not your contacts." (wording for the owner's yes).
- Do not add Android to "It works across platforms, for example from a Mac to a Windows PC." `app-answers.md` does not say restoring across to or from Android was tested.

**Unlock (owner's yes): fingerprint or face unlock where unlock is described.** The places:
- Technical details, "Unlocking on each device" (`TechnicalPage.astro` line 34, `items("technical.unlock", ["mac", "windows", "ios"])`): add `android`, with new keys `technical.unlock.android.label` "Android:" and `technical.unlock.android.text` "password, or fingerprint or face unlock if you turn it on." Source: `app-answers.md` §5 (the setting is "Unlock with fingerprint or face"; the password still works). Nothing about where the password is kept or when files can be read: the file gives no such fact for Android, and the iOS line's wording must not be copied (see "Must not claim").
- `docs/TECH-SPEC.md` gets the same row first, because the Technical details page states nothing that is not in it. That file is normally copied from the app repo; this row is sourced from `app-answers.md` instead, and the owner keeps the app repo's copy in step.
- **Open:** `technical.limits.passcode.text` says iOS accepts the device passcode in place of Face ID or Touch ID. Whether Android accepts the phone's PIN in place of fingerprint or face is not in `app-answers.md`. Until it is, that limit stays iPhone and iPad only.
- No other page describes unlocking: the FAQ and v2 notes only mention "Trouble unlocking?", which is the same on every platform.

`technical.network.apple` ("On Mac, iPhone and iPad, the operating system may contact the Doughnut Forge website so that password managers can…") stays Apple-only while Android autofill is off. If autofill ever ships, it needs an Android sentence, because Google's services would then fetch `assetlinks.json`. It must come from `docs/TECH-SPEC.md` first.

### 1d. Blog posts (English only)

| Post | Line | Today | When live |
|---|---|---|---|
| `doughnut-forge-vs-cryptomator.mdx` | 52 | "available for iPhone and iPad, Mac and Windows, and Android is coming" | "available for iPhone and iPad, Android, Mac and Windows" |
| `doughnut-forge-vs-veracrypt.mdx` | 52 | same | same |
| `harvest-now-decrypt-later.mdx` | 104 | "available for iPhone and iPad, Mac and Windows" | add Android |
| `can-whatsapp-read-my-messages.mdx` | 83 | "for iPhone and iPad, Mac or Windows" | add Android |
| `protect-personal-files-from-data-breaches.mdx` | 45, 72 | "on your iPhone, iPad, Mac or Windows PC"; "for iPhone and iPad, Mac or Windows" | add Android |
| `doughnut-forge-vs-cryptomator.mdx`, `-vs-veracrypt.mdx` | 72, 70 | "Folders can be encrypted only on a computer, not on iPhone or iPad." | "not on iPhone, iPad or Android". Android cannot encrypt folders (`app-answers.md` §3) |
| `share-encrypted-files.mdx` | 106 | "cannot be opened on iPhone or iPad, so send single files to someone who uses a phone" | "cannot be opened on iPhone, iPad or Android". Android cannot open a folder made on Mac or Windows (§3) |

The Cryptomator and VeraCrypt lines 52 also say "On iPhone and iPad it encrypts files and text." Android encrypts files and text too (§3), so it can join that sentence; it says nothing about sharing, so it is not blocked.

Each change updates its row in `docs/BLOG-CLAIMS.md` and the post's `updated` date (which feeds the sitemap `lastmod`). No change: `should-i-delete-apps-for-privacy.mdx` (general Android advice), Cryptomator line 45 and 64 (about Cryptomator's own Android app), `does-encryption-protect-against-hackers.mdx` (draft; names no platform). The Medium copies are the owner's.

### 1e. Tests, checks and tools that pin Android as coming

- `tests/layout/stores.spec.ts`: `COMING = ["android"]` (line 51), "download description contains Android" (73), the press fact "Coming soon" equals "Android" (87). Change to Android on sale, nothing coming, and add: no empty "Coming soon" anywhere.
- Also mention Android or coming: `tests/layout/pages.spec.ts`, `inner-pages.spec.ts`, `tests/blockers/go-pages.spec.ts`, `tests/links/links.spec.ts`, `tests/README.md` (to read on the branch; the go-pages and links specs will need Google Play cases).
- `.claude/skills/blog-draft/SKILL.md` line 85: the rule says iPhone and iPad are "coming soon" unless `stores.ts` marks iOS available. Change it to the same rule for Android.
- `docs/HANDOVER.md` and `DESIGN.md` ("the home Android line in Secondary").

---

## 2. What the site needs that iOS did not

### 2.1 `/.well-known/assetlinks.json` (not on release day; see 0.1)

When the app's autofill item ships, the file is:

```json
[
  {
    "relation": ["delegate_permission/common.get_login_creds"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.darrencorbett.doughnutforge.mobile",
      "sha256_cert_fingerprints": ["AB:CD:…:EF"]
    }
  }
]
```

Where each value comes from:
- `relation`: only `get_login_creds` (share saved passwords between the app and the site). Not `handle_all_urls`: that would make the app open the site's links (App Links), which nobody asked for.
- `package_name`: `com.darrencorbett.doughnutforge.mobile` (`app-answers.md` §1; the owner confirmed it stays). Not `com.darrencorbett.doughnutforge`, which is the Mac and Windows ID.
- `sha256_cert_fingerprints`: Play Console → the app → Test and release → **App integrity** → App signing → **App signing key certificate** → SHA-256. Not the upload key: with Play App Signing, Google re-signs the app, and phones see Google's key. A debug key fingerprint may be added for testing and removed before release.

What the site must do with it:
- Put it at `public/.well-known/assetlinks.json` (served as `https://doughnut-forge.app/.well-known/assetlinks.json`). Google requires HTTP 200, `Content-Type: application/json` and **no redirect**. GitHub Pages serves `.json` as `application/json`; check the live header once.
- `robots.txt` already allows everything (`Allow: /`), so nothing to change there.
- The app side declares `asset_statements` in its manifest, pointing at that URL. That is the app repo's job.
- Guards, all high risk (each needs the owner's yes): add the file to `scripts/check-production-files.mjs` (valid JSON, lists the package and fingerprint), to `REQUIRED` in `scripts/check-artifact.mjs` (the upload drops dotfiles, as on launch day), and a live check after the deploy in `.github/workflows/deploy.yml`, beside "Check apple-app-site-association is live". No new job and no extra minutes: one more `curl` in an existing step.
- Privacy: a new way the site is contacted, by Google's services rather than by the app. The privacy policy wording is high risk; `technical.network.apple` needs the Android sentence (1c). The owner decides both.

### 2.2 Google Play badge rules

From Google's Play badge page (Partner Marketing Hub, checked 12 November 2026):
- Use **"Get it on Google Play"** (download). Not "Pre-register" unless pre-registration is open.
- Use the localised badge that matches the page's language; fall back to English, marked `lang="en"`, as for the other stores.
- At least **28px tall** on screen. When shown with other store badges it must be **the same size or larger** than them.
- Clear space of at least a quarter of the badge's height on all sides (the site already gives 12px around 48px badges).
- No changes: no recolouring, no rearranging, no rescaling of the parts, no low-resolution or outdated artwork. Download the current set from the Partner Marketing Hub.
- Only on solid backgrounds or simple images with enough contrast (the white cards and the dark `/go/` card both qualify).

What that means here:
- **Size.** Google's badges have historically included transparent padding inside the artwork. If the new files do too, a 48px Google badge would look smaller than the Apple and Microsoft badges and break "same size or larger". Then the Google badge must render taller so its visible badge is at least as tall as the others. The "store badges line up" test needs to allow for it.
- **Format.** The site loads `.svg` only (`badges.ts`, the `/s/<hash>.svg` copy). If Google's download includes SVG, no code change. If PNG only, `badges.ts`, `src/pages/s/[name].svg.ts` and the duplicate-file check need a PNG path. That is high risk and needs the owner's yes.
- **Files.** Download once on the Mac, commit to `src/assets/badges/google-play/<code>.svg`, record each address and date in `sources.json`, the wording in `alt.json`, add Google to `scripts/fetch-badges.mjs` (or note it is downloaded by hand), list gaps in the badge README, and run `npm run badges`.
- **Reproducible builds.** Two identical badge files break reproducible builds (25 October). Remove any regional file identical to its language's, as was done for Apple and Microsoft.

### 2.3 `/go/` pages and the platform cards with Android

- **Cards:** Android becomes the second card, with the badge at the bottom like the others. On pricing: "One-time purchase from Google Play" (after the 0.2 fix). On download: **"Needs Android 10 or later."** (owner's yes; new key `download.requires.android` in 30 languages, added to `REQUIRES` in `PlatformCards.astro`; source `app-answers.md` §4, minimum Android 10, API 29). The iPhone and iPad card still has no line (design critique #6); that stays as it is.
- **`/go/7427ad/<lang>/`:** built automatically for all 30 languages. It forwards to `https://play.google.com/store/apps/details?id=com.darrencorbett.doughnutforge.mobile&hl=<lang>` (`storeUrl()` already handles `google-play`). Needs the 0.2 string fix ("Open Google Play", "Tap below to open Google Play."). Google Play has no app that a web link always opens: on Android, Chrome usually hands `play.google.com` links to the Play Store app, so the "come back" state matters as it does on iPhone.
- **Tests:** `tests/blockers/go-pages.spec.ts` already runs on an Android profile; add Google Play to its store list and to `tests/layout/go-pages.spec.ts` (now 120 pages).
- **Links check:** `npm run test:links` checks each Apple ID against Apple's lookup. Add the same for Play: the listing URL answers 200 with the package name. Play answers 404 for an unpublished app, so this catches a wrong ID or a too-early switch. Local check only, no CI.

---

## 3. Nothing implies the app is sold in the EU or other excluded countries

`app-answers.md` §2 says the plan is to exclude **the EU, Russia and Belarus**, but the Play country list is not set yet. **Unconfirmed until the owner says so.** The site names no countries, so its wording does not depend on the final list. Apple and Microsoft listings are not sold in the EU either. What was checked:

- **Store links never name a country.** Apple links have no country code; Microsoft and Play links carry only `hl=<language>`, which sets the language, not the storefront. Each store shows a visitor what is available where they are. A German visitor to `/de/` reaches a Play page that says the app is not available in their country. That is the same as Apple and Microsoft today.
- **"Availability depends on your country or region."** (`download.availability`) is on download and pricing in every language. Keep it.
- **No country claims anywhere:** no "worldwide", "everywhere", "any country" or "available in the EU" in the strings, posts or structured data. `SoftwareApplication` has no `offers` and no `areaServed`. The only "GDPR" is inside a UK ICO link (the UK is not in the EU).
- **Language pages are not availability claims.** `/de/`, `/fr/`, `/ru/` and so on exist because the app is translated. The switcher's "Europe" heading groups languages, as in the app.
- **One thing to watch:** a new Android sentence must never say "available in" a place, or "for everyone on Android". "Available for Android" (a platform) is fine.

No problem found. Nothing to change for this point.

---

## 4. What is needed from the owner

**Settled (12 November 2026):**

| # | What | Answer | Source |
|---|---|---|---|
| 1 | Package name | `com.darrencorbett.doughnutforge.mobile`, stays | `app-answers.md` §1, owner |
| 7 | "Android" or "Android phones and tablets" | "Android" | Owner |
| 8 | Folders on Android | Cannot encrypt folders, and cannot open a folder made on Mac or Windows | `app-answers.md` §3 |
| 9 | Requirements line | Yes: "Needs Android 10 or later." | `app-answers.md` §4, owner |
| 12 | Android differences to state | The restore FAQ (Android backups) and fingerprint or face unlock where unlock is described (1c). Nothing else for now | `app-answers.md` §5, owner |

**Still open (the owner answers later):**

| # | What | What is known already | Needed for |
|---|---|---|---|
| 2 | **Play listing URL** live (production, not internal testing) | Expected `https://play.google.com/store/apps/details?id=com.darrencorbett.doughnutforge.mobile` (`app-answers.md` §1). The links test checks it answers 200 | Switching to "available" |
| 3 | **SHA-256 of the app signing key**, Play Console → App integrity → App signing → *App signing key certificate* (not the upload key) | Only needed if Android autofill ships; autofill off is unconfirmed | `assetlinks.json`, later |
| 4 | **Price** | Not in `app-answers.md`. (An earlier draft said USD 3.99, from the app repo; dropped as unsourced.) Any launch price, and until when? | `src/data/prices.ts` (record only; pages show no amounts) |
| 5 | **Release date** | None | When to merge the release branch and push |
| 6 | **Excluded countries**, confirmed against the Play Console | Planned: EU, Russia, Belarus (`app-answers.md` §2); not set yet | Section 3 (no site wording depends on it) |
| 10 | **Android screenshots** for the press kit or features page, or keep iPhone and iPad only? | None exist on the site | Press, Features (optional) |
| 11 | **Google Play badge files**: the Partner Marketing Hub download (it may need a sign-in), and whether it has SVG | Not in the repo | 2.2 |
| 13 | **Sharing encrypted text** on Android shipped? | Not merged yet (`app-answers.md` §5, still changing) | Unblocks the lines marked Blocked in 1c |
| 14 | **Password autofill** off on Android, confirmed? | Being turned off (`app-answers.md` §5, still changing) | Whether `assetlinks.json` stays out (0.1, 2.1) |
| 15 | Does Android accept the phone's **PIN in place of fingerprint or face**? | Not in `app-answers.md` | Whether `technical.limits.passcode.text` names Android (1c) |
| 16 | The Android line on restore: "a new phone starts empty: your recovery words bring back your identity, but not your contacts" | Follows from §5 "No Android backup" | `faq.restore.a` wording (1c) |

---

## 5. Order on the release branch

1. Strings: fix `go.open`, `go.tap`, `pricing.oneTime` (0.2); handle the empty "Coming soon" in the FAQ and press facts. These are safe to land before release; they change nothing while Android is coming.
2. Badge files, alt text, sources, size rules (2.2).
3. Copy in 1b and 1c in English (the Ready lines, the restore FAQ, the Android unlock row and `download.requires.android`; not the Blocked lines), with the "must not claim" check, then all 29 other languages, with independent review, then stamped. `docs/TECH-SPEC.md` gets the Android unlock row first.
4. Blog lines and `docs/BLOG-CLAIMS.md` (1d).
5. Tests first (1e, 2.3), then the one-line switch in `stores.ts`, `prices.ts`, the roadmap status.
6. Checks: `check:commit`, `build:deploy` with no warnings, full `test:layout` (WebKit iPhone and 320px), `test:blockers`, `test:links` (needs the live Play listing), `check:reproducible`, Lighthouse on the home page, three widths on Download, Pricing, Home, Support and a `/go/` page in English and one other language (no right-to-left languages on the site).
7. Release day: merge to `main`, push with the owner's yes, then check live: the Play badge on `/download/` and `/de/download/`, a `/go/7427ad/en/` page, the press fact sheet and the FAQ (no empty "Coming soon"), and that `apple-app-site-association` still answers 200.
8. On the owner's word that text sharing has shipped: the Blocked lines in 1c, in all 30 languages, with review. May come after release day.
9. Later, its own item: `assetlinks.json` and its guards (2.1), only if Android autofill ships.

Out of scope: the app repo, Play Console, the Medium copies, outreach drafts, a Chrome install prompt, App Links.
