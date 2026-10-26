# Blog topics

The weekly blog draft, `/blog-draft` (`.claude/skills/blog-draft/SKILL.md`), run by the owner, reads this file to choose its topic. It reads this repo and the web, never the app repo. Each draft is a Claude Doc; drafting writes nothing to the repo. The owner approves the backlog. Nothing is published without the owner's yes.

## How a topic is chosen
1. **News first.** Search the past week's news for a privacy or security story: data breaches, cloud leaks, privacy law changes, NCSC or NIST guidance, quantum computing news. If one fits honestly, explain it plainly, then show a genuine use case where Doughnut Forge helps, tied to one key point: offline, no servers, no account, a one-time purchase on each platform, post-quantum encryption, or private sharing.
2. **Otherwise, the backlog:** the next topic below marked **approved** and not yet taken.
3. **If none is left,** propose three researched topics for the owner to pick from, instead of drafting.
4. **Later:** searches from Search Console are added to the backlog (owner).

## Never
- Repeat a news story.
- Write about the same feature two weeks running.
- Reuse a main search phrase.
- Choose without first checking the existing posts, the log below, **and every earlier draft doc**. A topic drafted but not yet published or binned is taken, even though this file does not show it yet.

## Topical posts
- Use reputable sources only, each linked and checked live.
- No fear-mongering, and never exploit victims.
- Never claim the app would have prevented an incident unless that is plainly true.
- No political stances.
- Date-stamp every topical post.

All the launch-post rules apply too: true, checkable claims only (`docs/BLOG-CLAIMS.md`, `src/i18n/`); no security internals; no "we" and no contractions; no claim that the sender of a file is verified, and no claim of an outside audit. Prices come only from `src/data/prices.ts`, and are never "pay once" site-wide: the purchase is one-time on each platform. iPhone and iPad stay "coming soon" until the owner says the App Store listing is live. If nothing can be written truthfully, skip the week and tell the owner.

## Log
Every post and every binned draft, newest last. Drafting does not write here: **when the owner publishes or bins a draft, the `/blog-draft` run or session that does it updates this file**, adding the row, and marking the backlog topic taken (published) or returning it to **approved** (binned, if the owner wants it tried again).

| Date | Title | News story | Feature | Use case | Main search phrase | Status |
|---|---|---|---|---|---|---|
| 23 October 2026 | How to encrypt files on a Mac without using the cloud | – | offline | encrypting files on a Mac | encrypt files on Mac without cloud | published |
| 23 October 2026 | Why offline encryption keeps your files private | – | offline, no servers | understanding offline encryption | offline encryption | published |
| 23 October 2026 | What quantum-safe encryption means, in plain language | – | post-quantum | understanding quantum-safe encryption | quantum-safe encryption | published |
| 23 October 2026 | How to share encrypted files with someone you trust | – | private sharing | sharing files with a trusted person | share encrypted files | published |

## Backlog
Status: **proposed** (waiting for the owner), **approved**, or **taken** (with the date drafted). Each topic's "Limits" are the facts that rule out the easy, untrue version of the post.

| # | Topic | Feature | Use case | Possible main search phrase | Limits | Status |
|---|---|---|---|---|---|---|
| 1 | Sharing medical records with family, privately | private sharing | a parent's test results shared with a sibling | share medical records securely with family | The recipient needs the app and the sender's contact card first (`.vltc2`; checked by the 16-character contact code). The desktop app has no share button: the encrypted file is saved next to the original and sent by any means. No medical or legal advice. | approved (owner, 26 October 2026) |
| 2 | Travelling with a laptop: keeping files safe if it is lost or stolen | offline | a work laptop on a trip | protect files on laptop when travelling | No legal advice on border searches. The app protects files it has encrypted, not the whole computer. Mention full-disk encryption (FileVault, BitLocker) as the first step. | approved (owner, 26 October 2026) |
| 3 | How journalists can keep source documents private | offline, no account | a reporter holding a leaked document | how journalists protect source documents | No claims about anonymity, metadata or file names. Not audited. Point to established press-freedom guidance for the wider picture. | approved (owner, 26 October 2026) |
| 4 | Encrypt files before they go into cloud backup | offline, private backups | keeping a backup in iCloud, OneDrive or Dropbox that the provider cannot read | encrypt files before uploading to cloud | True only for files encrypted in the app before upload. The backup phrase, not the cloud, is the way back. Folder vaults made on desktop cannot be opened on iPhone or iPad. | approved (owner, 26 October 2026) |
| 5 | Sharing a will or financial documents with an executor | private sharing | handing documents to a trusted person ahead of time | share will securely with executor | Not legal advice. Contacts are added by contact card only. Say plainly what happens if the backup phrase is lost. | approved (owner, 26 October 2026) |
| 6 | How to encrypt files on Windows without the cloud | offline, Windows | the Windows version of the Mac post | encrypt files on Windows without cloud | Built-in options differ by Windows edition (BitLocker and EFS are not in every edition): check Microsoft's own pages live. No Windows screenshots exist that are clean (HANDOVER backlog item 4). | approved (owner, 26 October 2026) |
| 7 | Sending client documents securely as a freelancer or small business | private sharing, no account | an accountant receiving a client's tax papers | send client documents securely | Both sides need the app and each other's contact cards. No compliance claims (GDPR, HIPAA and the like). | approved (owner, 26 October 2026) |
| 8 | What "no account" means for your privacy | no account, no servers | choosing an app that never asks for an email address | encryption app without account | The app works on the device and uploads nothing (store listings). Never say it cannot connect to the internet (the Mac app has the network permission; HANDOVER backlog item 7). | approved (owner, 26 October 2026) |
| 9 | Encryption without a subscription | one-time purchase on each platform | someone tired of yearly fees for a file vault | encryption software without subscription | Never "pay once" site-wide: one purchase for each platform. No prices in the text unless from `src/data/prices.ts` and still true on the publish date (iOS launch pricing ends 11 December 2026). | approved (owner, 26 October 2026) |
| 10 | "Harvest now, decrypt later", explained | post-quantum | why files kept for years need protection today | harvest now decrypt later | No algorithm names; NIST's 2024 post-quantum standards may be mentioned in general. Must not repeat the quantum-safe post: link to it, and focus on the threat and the timing. | approved (owner, 26 October 2026) |
