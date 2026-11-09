# Brand search check, 9 November 2026

Checked against the live site (which matches `main`) and the source. Nothing visitors see was changed. The plan "Google brand search plan: Doughnut Forge" was not found in the repo or the owner's artifacts, so this follows the three checks in the night-mode list.

## 1. Home title and summary

| What | Now | Leads with "Doughnut Forge"? | Has "offline file encryption"? |
|---|---|---|---|
| `<title>` (`meta.home.title`) | Doughnut Forge: offline file encryption for Mac, Windows, iPhone and iPad | Yes | Yes |
| Meta description (`meta.home.description`, the search snippet) | Encrypt files and text on iPhone, iPad, Mac and PC. On a computer, encrypt folders too. No account, no servers, no subscription. A one-time purchase on each platform. | No | No |
| `h1` (store headline) | Keep private files private. | No | No |
| Summary line (`home.summary`) | Offline file encryption for Mac, iPhone, iPad and Windows. | No | Yes |
| Lead (`home.lead`) | Doughnut Forge locks your files and text on your iPhone, iPad or computer and lets you share them with the people you trust. | Yes | No |

Findings:
- The title is right.
- The meta description, which Google often shows under the title, has neither the name nor the phrase, and is 166 characters, so search results cut its end.
- The title and the summary list the platforms in different orders.

## 2. Structured data

- **SoftwareApplication** (home and download pages): present. `name` Doughnut Forge, `url`, `image`, `applicationCategory` SecurityApplication, `operatingSystem` "iOS, iPadOS, macOS, Windows" (from the store data), `inLanguage`. No `offers`, on purpose (`src/data/jsonld.ts`: pages show no prices because each store shows the local one). Correct.
- **Organization** (home page): present. `name`, `url`, `logo` (icon-512). `sameAs`: the two App Store listings and the Microsoft Store listing, all pages Doughnut Forge controls. The Microsoft Store address carries `?hl=en-GB`, a language parameter that does not belong in an identity link.
- **Article** (every post): `author` and `publisher` are the Organization "Doughnut Forge", as CLAUDE.md asks (no person's name).
- The three are not linked: none has an `@id`, so search engines must guess that the app, the company and the posts' author are the same entity.

## 3. Blog posts use the full name

All 9 posts write "Doughnut Forge" in full every time (between 2 and 14 times each), and none uses "Doughnut" or "Forge" alone. Four posts (WhatsApp, harvest now decrypt later, offline encryption, quantum-safe) name it only after the main help (by design: help first, the app only where it fits). No change.

## Proposed changes (none made)

1. **Meta description** (seen in search results, so it needs the owner's yes and retranslation in 28 languages): "Doughnut Forge: offline file encryption for iPhone, iPad, Mac and PC. Encrypt files and text for the people you choose. No account, no servers, no subscription." (160 characters.)
2. **Link the structured data into one entity** (invisible to visitors): give the Organization `"@id": "https://doughnut-forge.app/#organization"`, and point SoftwareApplication `publisher` and Article `author` and `publisher` at that `@id`. A test in `tests/layout/seo-head.spec.ts` would pin it.
3. **`sameAs`** (invisible): drop `?hl=en-GB` from the Microsoft Store address, and add the Medium profile `https://medium.com/@doughnut_forge`, which Doughnut Forge controls. Do not add the GitHub repository: it sits under a personal account name, and the site is deliberately anonymous.
4. **Platform order** (visible, small): use one order in the title and the summary. The site's own order (mobile first, `src/data/stores.ts`) is iPhone and iPad, Mac, Windows.
