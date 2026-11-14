# New file format: site copy still waiting

New UI strings for the joint launch that are not in the site yet, in English. The white paper links, the contact code FAQ entry and the roadmap's "Shipped" entry went in on 14 November 2026 (owner's yes to translate them before the paper is final).

## FAQ entry on older apps (decision 7)

Waits for the app's own words for a contact on an older card (the brief says "Needs new card", the paper's draft says "Old card: ask for a new one").

| Key (new) | English |
|---|---|
| `faq.older.q` | Why can someone not open a file I sent? |
| `faq.older.a` | Files and contact cards made with the latest version of Doughnut Forge do not open in older versions. Ask them to update the app. Files made with any earlier version still open in the latest one. |

It goes in `SupportPage.astro`'s `ids`, after `code`.

## Held back until launch day (describe today's format by contrast)

Not on the branch: `~/Desktop/review/website-handoff/v3/white-paper-held-back.md`.
