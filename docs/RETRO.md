# Retros

Newest last. Each entry: date, commit range, what went well and wrong in brief, and the changes agreed.

## 25 October 2026 (`b48a193..ed415e3`)

The work: stale iPhone Safari pages (FreshCheck and `/build.json`), the content-hash build ID with reproducible builds, and content blockers on phones (list tests, the store fallback, `/get/` pages, the naming check). Six deploys, all passing their live checks.

**Review** (independent subagent): no Must fix. Should fix: the fallback link's `lang` covers its page-language note; the `/get/` link is below 44px and the page has no `h1`; two stale HANDOVER lines (fixed in this entry's commit); test commit `6bc3ceb` also deleted site code (recorded, not rewritten).

**Went well:** tests came first every time; every deploy was checked against the live site; no push without the owner's yes; the blocker tests used the real public lists (they did not show the cause; see 26 October).

**Went wrong, and why:**
1. Claude called the missing Mac badge a cached Friday page and wrote it into HANDOVER; it was the owner's AdGuard rule. Cause: explained by the last thing fixed, without reproducing it on the live site.
2. A test commit removed `build.json.ts`. Cause: a deletion was already staged and not looked at before committing.
3. Builds were not reproducible, found late. Cause: "the same input gives the same output" was assumed before the build ID depended on it.
4. Tests that type-check only under `astro check` failed after commit. Cause: only the quick checks ran before committing.
5. The first blocker run ran out of memory, and two fallback tests were themselves wrong; both were caught and fixed in the session.

**Agreed (owner):**
- CLAUDE.md: reproduce against the live site before naming a cause.
- CLAUDE.md: `npm run check:commit` (`git diff --cached --stat` and `astro check`) before every commit; never stage ahead. No git hook in this repo.
- `npm run check:reproducible` (`scripts/check-reproducible.mjs`, tested in `tests/checks/`), with a CLAUDE.md rule on when to run it.
- CLAUDE.md commit rule now "Commit freely on main; ask before every push." `.claude/settings.json` allows `git commit` and asks for `git push`.
- The review's Should fix items 1 and 2 and the FreshCheck note are in HANDOVER "What is next" for the owner to decide.

## 22–24 October 2026, the launch work (`ee042f8..b48a193`), written 26 October

The 25 October entry covered only that day. These are the launch days' three main misses, each already fixed at the time; this entry records why they happened and what was added on 26 October.

**Went wrong, and why:**
1. **`apple-app-site-association` was missing for 42 minutes** (23 October, 13:13 to 13:55 UTC). `actions/upload-pages-artifact` leaves out names starting with a dot, so `.well-known/` and `.nojekyll` never reached Pages. Every check read `dist/`, where the file existed. Nothing compared what was uploaded or live with the build until after launch, and the checklist's curl ran after the switch. Fixed in `42fb02c` (hidden files included, plus a live check after the deploy). That check still runs only after the site is live.
2. **Safari-only bugs reached the owner's iPhone first.** Before the 24 October audit, layout tests ran on desktop Chromium and desktop WebKit only. Display Zoom at 320px (H3), the German FAQ pan (H4), stale tabs restored by Safari, and the hidden Mac badge were all phone-Safari behaviour. "Responsive" had been checked as a narrow desktop window, not as a phone. Since then: the `webkit-iphone` project at 320 to 430px, the real Mobile Safari script, and the WebKit iPhone deploy and blocker tests.
3. **`/roadmap/` and `/security/` were missing from `translatedPages`** (`f3a577d`): no hreflang links, and the language menu went to each language's home page. Adding a page needs a hand-written entry in `src/i18n/alternates.ts`, and the hreflang check compared only the links that existed. Caught about 40 minutes later; fixed in `09a141c`, with a guard in `ae161ce`.

**Agreed (owner, 26 October 2026):**
- The deploy checks the uploaded archive before publishing: `scripts/check-artifact.mjs` fails unless it holds every built file, dotfiles included (`be191f9` tests, `28bc8fe` check).
- CLAUDE.md: after any change to how the site is built, uploaded or hosted, check the files the apps depend on at their live URLs before calling it done.
- CLAUDE.md "Before saying a change is done": run the layout tests in WebKit with the iPhone profile, at 320px as well.
- Not taken: re-running real Mobile Safari before layout pushes; deriving `translatedPages` from the built pages (the `ae161ce` guard stays).

## 26 October 2026: the hidden Mac badge, corrected

**Correction:** the 25 October entry (item 1) and HANDOVER called the rule hiding the Mac badge "the owner's AdGuard rule". The owner has confirmed it is AdGuard for Safari's default behaviour, with no user rules. The cause is not identified, and the owner has stopped the search.

**Why the 25 October check missed it, and why the published lists could not find it:**
1. **A guess was accepted without being checked.** Every public list came up empty, and Claude concluded "so it must be a private rule". The owner then deleted a rule, the badge came back, and that was recorded as confirmation, but nobody checked that AdGuard had no user rules at all, or that the badge stayed back. An empty result showed only that Claude's own test could not see the cause; it did not prove the cause was private.
2. **The test did not run AdGuard.** It parsed the lists with Ghostery's engine. AdGuard for Safari does not apply its lists as written: it converts them into Safari content-blocker rules (with limits on rule count and selector syntax, and rewriting of domains and `:has()`), and adds an advanced-protection layer (extended CSS, scriptlets) in its own extension. What actually runs on the iPhone is the converted rule set, which is not published. On 26 October, AdGuard's own filter builds, run through its own extended-CSS engine, and the Mac's compiled Safari rules (from December 2025) still matched nothing.
3. **Lists differ by device and over time.** The phone's lists come from its own last update and its AdGuard version. A test run hours later on another machine is not the phone's rule set.
4. **No real-device check.** No test runs Safari with AdGuard installed: the iOS Simulator cannot install it, and this repo has no other access to the owner's phone.

**Agreed (owner, 26 October 2026):** assume blockers hide store badges in ways no one can predict or reproduce. The site shows a second branded badge, then a text link, whatever the cause. It is tested by simulating every way of hiding a badge in WebKit (iPhone) and Chromium, not by any blocker's rules. The daily public-list check stays as it is, with no AdGuard-specific check. *Later on 26 October 2026 the owner removed the daily public-list check: the blocker tests run by hand only (`npm run test:blockers`), and answered issues are fetched by hand ("Run workflow" on the deploy) or on a push.*

## 26 October 2026, the session (`ccb02f4..HEAD`)

The work: the branded fallback badge (official artwork under a neutral name, then the text link), `/go/` forwarding pages, the accessibility fixes, the uploaded-archive check in the deploy, the launch retro, and the blog topics file and weekly task design.

**Review** (independent subagent): one Must fix, now fixed. Both fallbacks linked to `/get/mac-app-store/…`, so one rule on link addresses (`a[href*="app"]`) hid the badge and both fallbacks, and a visitor saw nothing for the Mac. Should fix, also fixed: transparent or off-page badges counted as drawn; HANDOVER's date, results, iOS line and live AASA check. Notes fixed: the archive check passing on an empty build, and fallbacks coming out of a hidden container in reverse order.

**Went well:** tests came first, and every test commit holds only tests. Every way of hiding was simulated in both engines. The search for the AdGuard rule stopped as soon as the owner said so. The full checks ran before any claim of done.

**Went wrong, and why:**
1. **The fallback address named the store.** Claude neutralised the file name, the alt text and the classes, but kept yesterday's `/get/<store>/` address without looking at it, and the test checked only the attributes Claude had thought of. Fix: the test now checks every attribute.
2. **About 25 minutes spent hunting the AdGuard rule** after 536 lists had already come up empty. Claude did not first ask whether finding the rule would change the fix. It would not have.
3. **The test helper needed two corrections** (it scrolled away from lazy images, then scrolled to a hidden element). Claude wrote it without first checking where the badges sit on each page.
4. **Why yesterday's fix used a plain text link, not a branded badge:** no plan, commit or HANDOVER line gives a reason; the two were never compared. The fix was built on the wrong diagnosis (one private rule, already deleted), so a minimal "some way to the store" looked enough. Nobody asked the owner what a visitor should see in that case.

**Agreed (owner):**
- (A)+(C): neutral `/go/<code>/` addresses; the tests hide links by address and check every attribute of each fallback (`d668ba6` tests, `de1f21e` fix).
- (B): transparent and off-page badges count as hidden (same commits).
- (D): the archive check fails without `apple-app-site-association` (same commits).
- (E): CLAUDE.md: a plan for any fallback or degraded state says what the visitor will see, and asks the owner first if it differs from normal.

## 30 October 2026, the session (`20d49f6..7361389`)

The work: `docs/TECH-SPEC.md` (from the app repo, without its Borderline notes); the Technical details page in 30 languages, then its redesign; a messaging-app FAQ answer; links from the footer, the Security page and two posts; the blog-draft skill change (review notes below the reply line); and the post "Can WhatsApp read my messages? Encryption, trust and what to check". Pushed in two batches.

**Review** (independent subagent, `20d49f6..acb1c54`): no Must fix. Should fix: HANDOVER still said "ready to push" for pushed work (fixed in this entry's commit). Notes: `SupportPage.astro` (high risk) was changed for the FAQ entry without being named in the plan; no test catches library versions coming back; the copy checks run on UK English only.

**Went well:** sources were opened before writing, which caught that "unsubstantiated" was first quoted from WhatsApp, not the agency, and later found the agency's own words in Bloomberg's report. The independent translation reviews caught five real meaning errors (ru "older than", id "if both", fi and vi "works online", a suggested French "propre" meaning "clean"). Each was re-checked by a second reviewer. Measuring every language at 320px found three layout breaks before any test did.

**Went wrong, and why:**
1. **A commit went in while the type check showed 28 errors.** The command ran the check, then committed regardless. Cause: the commit did not depend on the check passing.
2. **A full test run with 1,562 failures nearly read as passed.** Only the end of the log was read, and the exit code was lost in a pipe. Cause: the "failed" count was not checked. (Playwright's WebKit was not installed on this Mac.)
3. **The blog doc mixed review notes into the post.** The owner caught it. Cause: the skill's layout. Fixed in `acb1c54`.
4. **The Security page card first sat flush against the main card.** Astro's scoped style does not reach a class passed to a child component. Caught in a screenshot; fixed before the push.
5. **Smaller:** a title one character over the 70 limit (caught by the build); shell backticks emptied a test line (caught by reading the diff); Prettier reformatted a whole test file; a direct download was tried after a fetch was blocked; a reminder kept firing after the work was done; the plan did not list `SupportPage.astro` as high risk.

**Rules that got in the way:** none.

**Numbers:** appetite a day; actual one session for each batch. Review findings: 0 Must fix, 2 Should fix. Problems after shipping: none known; the live check is still to do (HANDOVER).

**Proposed, not yet agreed:** `tests/layout/layout.spec.ts` attaches its list of layout problems to every failure, not only when `AUDIT_DIR` is set. Problem: two one-off WebKit iPhone failures (27 and 30 October) left no details. We will know it worked when the next one-off failure names its cause.

## 31 October 2026, experiment: the 320px sideways slide in WebKit iPhone

- **Problem:** three one-off failures of `tests/layout/layout.spec.ts` in `webkit-iphone` at 320px (`/ru/download/` 27 October, `/no/features/` 30 October, `/id/download/` 31 October), only in full runs. The 31 October run recorded the details: the page was 320px wide, yet scrolled 15px sideways, with every box at left -15, just after the screen shrank from 430 to 320px. A leftover offset, not a page that is too wide. It did not repeat in 1,500 runs (600 iPhone only, 900 with all three projects), so the WebKit behaviour is unproven. Visitors are not affected.
- **Change:** `5565075`: the test scrolls to the top left after each viewport change; the far-right scroll probe still catches a real pan.
- **When to check:** after the next 5 full `npm run test:layout` runs.
- **Result:** open. Kept if no sideways slide appears in those runs; if one does, the cause is something else, and the change is reverted.

## 1 November 2026, design critique stages 2 and 3 (`bc4fc33..fe7d288`)

The work: Security, Roadmap and Blog index (stage 2); press kit, home, badge space, FAQ gaps, `/go/` dot and DESIGN.md (stage 3); the same fixes on Features, Pricing, Privacy and Legal; Technical details redesigned like Security (decision A). Approved page by page, pushed in one batch.

**Review** (independent subagent): no Must fix. Should fix: a Security test that passed with no rows; DESIGN.md said 34px under dark-mode badges, the test asked for 30; Security and Technical details copied the shared row's grid and colour; two changes missing from the owner's checklist (a Prose first-block margin rule, and the privacy publisher colour changed at every width, not only on phones). All four fixed (`5cdd9b8` tests, `5d4f182` code, `52762bd` DESIGN.md).

**Went well:** page-by-page approval; every new test failed on the old build first; the layout tests in every language caught German headings pushing Security sideways at 768px before the owner saw it; the separate Impeccable review and detector found real problems each round; contrast was computed, not guessed.

**Went wrong, and why:**
1. **German overflow on Security.** The heading went into a narrow column without checking what the fit-the-longest-word rule measures (the section, not the column). Now built into the shared row.
2. **A lost space ("planned.See the roadmap").** Astro drops the space between an expression and a tag on the next line. Caught in a screenshot; now tested.
3. **Removing "Planned" also deleted the next line in 29 files.** A greedy pattern. Caught in the diff before building; redone line by line with a one-line-per-file check.
4. **Two vacuous tests** (one caught, one shipped) and two wrong ones. Loops over `locator.all()` pass on zero matches; computed CSS values were guessed instead of read.
5. **Two changes missing from the owner's checklist.** It was written from intent, not from the diff.
6. **Copied CSS left behind** when the row became shared: no search for other copies.

**Rules that got in the way:** none. The Impeccable passes cost time but found something every round.

**Numbers:** appetite a day, actual one session. Review: 0 Must fix, 4 Should fix. Problems after shipping: none known yet.

**Agreed (owner):**
- Experiment: `each()` in `tests/support/each.ts` fails on zero matches (or the wrong count), and `tests/checks/each.spec.ts` fails on any bare `.all()` in the tests (`f255f8d`). Problem: vacuous loops. When to check: the next retro. Kept if its reviewer finds no vacuous test.
- CLAUDE.md: the owner's review checklist is written from `git diff` and lists every changed file (`8a79a73`).
- The four Should-fix items, as above.

**320px slide experiment (31 October):** 1 of 5 full `test:layout` runs done (2878 passed), no sideways slide.

## 2 November 2026, weekly SEO check (`edf2683..b5cb7ca`)

The work: the outside crawl's findings checked against the live site (3 of 6 were false: the crawler stopped reading a 1 MB sitemap after about 100 KB); the home title names iPad in 30 languages; sitemap `<lastmod>` on blog posts and `/blog/` with a build check; one link to the WhatsApp post; the comparison posts' vendor claims re-checked; the Cryptomator "pay once" line in the owner's words. Pushed and checked live.

**Review** (independent subagent): no Must fix. Should fix: no test for a post with an `updated` date; no test for a post with a wrong lastmod. Notes: the blog index rule differed between `astro.config.mjs` and the check; a wrong count in HANDOVER; a clumsy BLOG-CLAIMS sentence; `reviewedAt` moved for 28 whole languages though only the title was reviewed; the title is 73 characters (search results may cut "iPad"). Fixed: `dd75952` tests, `c834b80` one blog index rule, `2f1bd67` docs and `reviewedAt`.

**Went well:** checking the live site before planning kept the plan to the two real problems; re-reading the vendor sources caught that the Cure53 PDF is named after another company's app (its scope still covers Cryptomator's libraries); tests failed first, and one exposed a fault in the test itself.

**Went wrong, and why:**
1. **The first `review.json` update deleted 28 older findings.** The script replaced entries instead of adding. Caught by the diff size; redone append-only. Cause: the file's history convention was not read before writing.
2. **The Cryptomator line repeated itself** after the owner's wording went in, costing an amend and an 18-minute layout rerun. Cause: the changed sentence was not reread in its paragraph before committing.
3. **About eight wasted calls:** `grep` here is ugrep, which rejects long context patterns, and zsh rejected a shell function. Cause: retrying the same approach instead of switching to Python sooner.
4. **A wrong count and an over-wide `reviewedAt`** in the docs. Cause: written from memory, not from the data.

**Rules that got in the way:** the full layout run (2,882 tests, 15 to 18 minutes) for a one-sentence copy fix.

**Numbers:** appetite a few hours, actual about two hours plus two layout runs. Review: 0 Must fix, 2 Should fix, 8 notes. Problems after shipping: none known.

**Experiments checked:** `each()` (1 November): kept, its reviewer found no vacuous test. The 320px slide: 3 of 5 full runs done, clean.

**Agreed (owner):**
- The two Should-fix tests, one blog index rule, the doc fixes and `reviewedAt` restored, as above.
- Experiment: copy-only fixes run `test:layout` on the changed pages only, with `PAGES` (CLAUDE.md). Problem: a copy fix waited 15 to 18 minutes on pages it did not touch. When to check: after five copy-only fixes. Kept if the next full layout run after a design change finds nothing those copy fixes caused.

## 9 November 2026, the v2 website night on `release/v2-site` (`8d7e052..129eb41`)

The work: Part B items 1 to 8 on the local branch, from the v2 website pack only. FAQ and Support (recovery words, restoring on a new device, a forgotten password); "Files", "Text" and "recovery words" everywhere, including 8 blog posts; the home "New in Doughnut Forge 2" band; Technical details; every v1 screenshot replaced by a v2 one (`scripts/images-from-pack.mjs`); the roadmap with its short changelog; the release-day checklist. 43 strings in 28 languages, by four drafters and four independent reviewers.

**Went well:** using the pack and the v2 screenshots as the only source caught a real problem before it shipped: the iPad Contacts screen's guide says "See who sent it", so it is used nowhere. The independent reviewers caught a "File" menu name the pack never shows in 14 languages, and the wrong Ukrainian Settings tab. The image script makes the same bytes on every run. The final branch passes everything: `build:deploy`, 2,891 layout tests, reproducible builds, Lighthouse 100.

**Went wrong, and why:**
1. **Seven commits fail the type check on their own** (`8d7e052` to `507f88c`). Each added English keys that the other 28 languages only got in `37b8d0a`. `check:commit` printed 28 errors, and the commit went ahead anyway, because the command piped the check through `grep`, which hides its exit code. Cause: batching all translations to the end to save agent runs, and a check that could not stop a commit.
2. **The first night lost Part B.** The list said "as already given in this session", but it never reached the session. Cause: a list that pointed at context instead of containing it.
3. **Image work done twice.** The first widths were too small for the frames at 2× (caught by the image agent), and a per-language iPad set (2.3 MB) was made and then deleted, because the press kit does not use it. Cause: the brief was written before checking the frames' sizes and which images each page takes.
4. **Wrong counts on the review page** (194 and 14 files, really 198 and 22). Cause: written from memory, not from `git diff`, the same cause as 2 November item 4.
5. **Drafters disagreed** on "File menu" against each language's "menu bar". Cause: the brief did not say which source wins when the English and a language's notes differ.

**Rules that got in the way:** "after each item, `build:deploy`" cannot pass while an item's English waits for its translations; it only passed once, at the end.

**Numbers:** appetite one night; actual about four hours. Review: 15 blocking findings (14 menu names, 1 tab name), all fixed and re-checked; 84 review notes and 28 re-check notes (counted from the review files). Problems after shipping: none; nothing is shipped.

**Experiments checked:** scoped layout runs for copy-only fixes: one more fix used it (`share-encrypted-files`, Part A, 9 November), clean.

**Proposed (for the owner's yes), one experiment:**
- Problem: commits that fail the type check, and a commit check that cannot stop a commit.
- Change: English keys and their translations land in the same commit, so every commit passes the type check; and `npm run check:commit` runs as its own step, and a non-zero exit stops the commit (never piped through `grep`).
- How we will know: on the next item with translated copy, every commit passes `npm run check:commit` when checked out on its own. Check at the next retro.
