# New file format: site copy waiting for translations

New UI strings for the joint launch, in English. They are not wired in yet: the translation check fails the build when any language lacks a key, and translations wait for the final white paper (owner, 14 November 2026). Changes to existing strings are already made in `src/i18n/ui/en.ts` on this branch. Facts come from the white paper draft (`src/content/white-paper/en.md`); check each one against the final paper before translating.

## White paper links

| Key (new) | English | Where |
|---|---|---|
| `footer.whitePaper` | White paper | `src/components/Footer.astro`, beside Security and Technical details |
| `security.whitePaper.title` | Security white paper | `SecurityPage.astro`, a card beside the Technical details card |
| `security.whitePaper.text` | The design in full: how files, keys and identities are protected, in plain words first and in full technical detail after. | same |
| `security.whitePaper.link` | Read the white paper | same |
| `technical.whitePaper` | The white paper explains the design in full. | `TechnicalPage.astro`, under the lead, linked |

## New FAQ entries (decision 7)

| Key (new) | English |
|---|---|
| `faq.code.q` | Why did my contact code change? |
| `faq.code.a` | With this update, everyone's contact card carries new keys, so everyone's contact code changed once. It still has 16 characters in four groups. Share your contact card again with the people you write to, and compare codes again when a contact sends you their new card. |
| `faq.older.q` | Why can someone not open a file I sent? |
| `faq.older.a` | Files and contact cards made with the latest version of Doughnut Forge do not open in older versions. Ask them to update the app. Files made with any earlier version still open in the latest one. |

Both go in `SupportPage.astro`'s `ids`, after `share`. The app's own words for a contact on an older card are still to be confirmed (the brief says "Needs new card", the paper's draft says "Old card: ask for a new one").

## Roadmap "Shipped" entry (decision 11)

| Key (new) | English |
|---|---|
| `roadmap.format.title` | A new file format, with post-quantum signatures |
| `roadmap.format.text` | Every new file is signed by its sender with a classical and a post-quantum method. The app names a contact as the sender only when the file is signed with the keys on that contact's new card. Files made with earlier versions still open. |

In `src/data/roadmap.ts`, first in Shipped. The roadmap test (`tests/layout/pages.spec.ts`) lists Shipped in order.

## Held back until launch day (describe today's format by contrast)

Not on the branch: see the morning list of 14 November 2026.
