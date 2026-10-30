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
