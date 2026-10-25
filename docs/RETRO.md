# Retros

Newest last. Each entry: date, commit range, what went well and wrong in brief, and the changes agreed.

## 25 October 2026 (`b48a193..ed415e3`)

The work: stale iPhone Safari pages (FreshCheck and `/build.json`), the content-hash build ID with reproducible builds, and content blockers on phones (list tests, the store fallback, `/get/` pages, the naming check). Six deploys, all passing their live checks.

**Review** (independent subagent): no Must fix. Should fix: the fallback link's `lang` covers its page-language note; the `/get/` link is below 44px and the page has no `h1`; two stale HANDOVER lines (fixed in this entry's commit); test commit `6bc3ceb` also deleted site code (recorded, not rewritten).

**Went well:** tests came first every time; every deploy was checked against the live site; no push without the owner's yes; the blocker tests used the real public lists, which showed the cause had to be a private rule.

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
