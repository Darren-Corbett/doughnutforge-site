---
name: blog-draft
description: The weekly Doughnut Forge blog draft, run by the owner. First handles any "publish", "bin" or "changes" replies on earlier draft docs, then researches one new draft (the week's news first, then the approved backlog in docs/BLOG-TOPICS.md) and writes it as a Claude Doc the owner can read and comment on from their phone. Never publishes without the owner's yes.
disable-model-invocation: true
---

# Weekly blog draft

The owner runs `/blog-draft` in this repo, about once a week (never more than one or two new posts a week; CLAUDE.md). It does two things, in this order:
1. Acts on the owner's replies to earlier drafts.
2. Writes one new draft as a Claude Doc, or proposes topics, or skips the week and says why.

**Hard limits**
- Never read or reference `~/git/doughnut-forge` (the app repo). App facts come only from this repo: `src/i18n/`, `src/data/`, `docs/BLOG-CLAIMS.md` and `docs/HANDOVER.md`.
- Nothing is published without the owner's explicit yes, given in this session. Every push needs its own yes (CLAUDE.md).
- Drafting writes nothing to the repo: the draft lives in the doc. Only step 1 ("publish" or "bin") changes repo files, and it commits under the usual CLAUDE.md rules (`npm run check:commit` first, never stage ahead).
- Before any Claude Docs call, load the docs skill (`anthropic-skills:docs`), or call the docs `guide` tool, as the Claude Docs instructions say.

## Read first

- `CLAUDE.md`: Hard rules, Copy, Blog, Languages and Technical SEO.
- `docs/BLOG-TOPICS.md`: the rulebook. How a topic is chosen, the "Never" list, the guardrails for topical posts, the log and the backlog.
- `docs/BLOG-CLAIMS.md` and the posts in `src/content/blog/en/`: house style, and the claims already sourced.
- `src/i18n/` and `src/data/` (`stores.ts`, `prices.ts`, `roadmap.ts`).
- `docs/HANDOVER.md`: "Facts found for Phase 4", "Decisions on record" and "Backlog for the app repo" (what the app does not do).
- Every earlier doc titled "Blog draft:" or "Blog topics:" (list them with the Claude Docs tools), with their comments.

## Step 1: act on replies to earlier drafts

For each earlier draft doc, read its comments, newest first. Act on the owner's latest instruction, reply to that comment in the doc saying what was done, and report it in this session.

- **"publish"**:
  1. Copy the post into `src/content/blog/en/<slug>.mdx` with `draft: true`, matching the front matter of the existing posts: title, description, `keyphrase`, date, and image and alt text.
  2. Add the post's claims table to `docs/BLOG-CLAIMS.md`. Re-check every external source live first; drop or fix any claim that no longer holds, and tell the owner.
  3. Images: use real app screenshots or simple illustrations only, compressed and correctly sized, with alt text.
  4. Run `npm run build` (no warnings), the layout tests for the new page (`PAGES=<slug> npm run test:layout`), and check the page at 360, 768 and 1280px.
  5. Commit the post with `draft: true`.
  6. Show the owner the claims table (not the full text; this is the pre-launch review scope in HANDOVER), and ask: "Publish this post?"
  7. Only on a yes, set `draft: false`, then run `node scripts/make-og.mjs` to make the post's social preview image (`public/og/blog/<slug>.png`; the script skips drafts), and commit the image with the post. Without it, `npm run build:deploy` fails on the missing image.
  8. Update the log in `docs/BLOG-TOPICS.md`: add the row, and mark the backlog topic **taken**, with the date.
  9. Ask before the push. After the push, check the deploy and the live page.
- **"bin"**: write nothing to `src/`. In `docs/BLOG-TOPICS.md`, add a log row marked **binned**. If it came from the backlog, return the topic to **approved**. A binned news story counts as used: never draft it again. Commit. Retitle the doc "Blog draft (binned): …" so it is not taken for a live draft.
- **"changes: …"**: revise the draft in the doc as asked, keeping every writing rule. Update its claims table and re-check any new source live. Add a dated line to the digest saying what changed. Publish nothing. It waits for the owner's next reply.
- **No reply yet**: leave the doc as it is, but count its topic, news story, feature and main search phrase as taken in step 2.

## Step 2: choose this week's topic

In this order (as `docs/BLOG-TOPICS.md` says):
1. **The week's news.** Search the past 7 days for a privacy or security story: data breaches, cloud leaks, privacy law changes, NCSC or NIST guidance, quantum computing news. Use reputable sources only, opened and read, not just search snippets. Take a story only if it fits honestly and a genuine Doughnut Forge use case follows from it, tied to one key point:
   - offline;
   - no servers;
   - no account;
   - a one-time purchase on each platform;
   - post-quantum encryption;
   - private sharing.
2. **Otherwise, the backlog:** the first topic marked **approved**, never **proposed** or **taken**.
3. **Otherwise, propose instead:** a doc titled "Blog topics: <date>" with three researched topics. Give each its feature, use case, main search phrase, why people search for it, and the facts that limit it. Stop there; the owner picks one, and you add it to the backlog as **approved** in the next run.

**Repeat checks**, against the log, every earlier draft doc (binned ones included) and the published posts. Record each check and its result in the digest.
- No news story already used.
- Not the same feature as the newest log row or the newest draft.
- No main search phrase already used.

## Step 3: write the draft

**Writing rules (all mandatory):**
- Claims must be true and checkable today, each with a source:
  - an app fact from `src/i18n/`, `src/data/`, `docs/BLOG-CLAIMS.md` or HANDOVER;
  - an external fact from an official or reputable page, opened and checked today.
- **Never claim:**
  - that the sender of a file is verified, or that there has been an outside audit;
  - "military-grade", "unbreakable" or "audited";
  - that the app cannot connect to the internet;
  - a feature the app lacks (HANDOVER):
    - no password-protected files;
    - contacts only by `.vltc2` contact card;
    - no share button on the desktop;
    - no drag and drop;
    - no contacts export;
    - folder vaults made on the desktop do not open on iPhone or iPad.
- **Purchase and prices:**
  - Never "pay once" site-wide: it is a one-time purchase on each platform.
  - No prices unless they come from `src/data/prices.ts` and will still be true on the publish date.
  - iPhone and iPad are "coming soon" unless `src/data/stores.ts` marks iOS available.
- **Content:** no security internals and no algorithm names. NIST's 2024 post-quantum standards may be mentioned in general.
- **Style:** plain language that never talks down. No "we", no contractions, British English.
- **Topical posts:**
  - put the date at the top;
  - no fear-mongering, and never exploit victims;
  - never claim the app would have prevented an incident unless that is plainly true;
  - no political stances.
- **Helpfulness:** the post must help readers even if they never buy the app. Link to the app only where it fits.
- If nothing can be written truthfully, **skip the week**: no doc, and tell the owner why.

**The doc** is titled "Blog draft: <post title>". In order:
1. **Weekly note (digest):**
   - why this topic;
   - the news story (link and date) or the backlog row number;
   - the feature and the use case;
   - the main search phrase;
   - every repeat check and its result;
   - one dated line for each later revision.
2. Title, meta description (under 160 characters), main search phrase, suggested slug, and date stamp.
3. The post, about 800 to 1,400 words, with headings.
4. **Claims table:** claim | exact source (repo file and key, or URL) | date checked live.
5. **Image notes:** which real screenshots or illustrations, with alt text. Clean Mac and Windows screenshots do not exist yet (HANDOVER backlog item 4).
6. **Footer:** "Reply by commenting on this doc: **publish** (the next /blog-draft copies it into the site as a draft, runs every check, shows you the claims table and asks for your yes before anything goes live), **bin** (drop it; a backlog topic goes back to the backlog), or **changes: …** (the next /blog-draft revises this doc for you to review again). You can also say any of these in a Claude Code session."

Open the doc for the owner (Artifact `open`) once it is created.

## Step 4: report

End with the weekly summary, which is also sent as a push notification when one is available:
- **"Blog draft ready: <title>"**, with the doc link and one line: the news story or backlog item, and the main search phrase;
- or **"Blog topics to pick"**, with the doc link;
- or **"Blog draft skipped"**, with the reason;

plus what step 1 did ("published …", "binned …", "revised …", or "no replies").
