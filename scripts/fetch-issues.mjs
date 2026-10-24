// Reads the public forge-privacy issues the owner has labelled for the site and
// writes src/data/issues.json, which the Answered questions and Known issues
// pages are built from. Run by the deploy before each build, and by hand
// (`npm run fetch:issues`) to refresh the committed copy.
//
//   - site-faq → Answered questions, site-known-issue → Known issues (open or closed)
//   - the answer is the owner's latest comment; an issue the owner has not
//     answered is left out
//   - only the title, the question and the answer are kept, as plain text
//     (GitHub's own plain-text rendering), with every @handle replaced: no
//     usernames, avatars or anyone else's comments
//   - a question filed through an issue form (docs/forge-privacy/) reads as
//     written: short fields on one line ("Platform: Mac"), empty fields and the
//     "Your question" heading left out, longer fields under their headings
//   - no token of any kind is sent: the repo is public
//   - on any failure the file is not written, so the last committed data stays
//
// FORGE_API and ISSUES_OUT point it elsewhere, for the tests.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { parse } from "yaml";

const SITE = new URL("..", import.meta.url).pathname;
const API = process.env.FORGE_API ?? "https://api.github.com";
const OUT = process.env.ISSUES_OUT ?? `${SITE}src/data/issues.json`;
const REPO = "/repos/Darren-Corbett/forge-privacy";
// Kept in step with site.owner (src/data/site.ts)
const OWNER = "Darren-Corbett";
const LABELS = { answered: "site-faq", known: "site-known-issue" };
// Plain-text bodies (body_text). Deliberately no Authorization header.
const HEADERS = { Accept: "application/vnd.github.full+json", "User-Agent": "doughnut-forge-site", "X-GitHub-Api-Version": "2022-11-28" };

/** Every page of a list from the API, following its Link headers */
const getAll = async (path) => {
  const items = [];
  let url = `${API}${path}`;
  while (url) {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${url.replace(API, "")}`);
    const page = await res.json();
    if (!Array.isArray(page)) throw new Error(`not a list from ${url.replace(API, "")}`);
    items.push(...page);
    url = /<([^>]+)>;\s*rel="next"/.exec(res.headers.get("link") ?? "")?.[1] ?? null;
  }
  return items;
};

// The issue forms' field labels: short fields (dropdowns and one-line inputs)
// fold onto one line with their answer; these headings are left out altogether
const FORMS = `${SITE}docs/forge-privacy/.github/ISSUE_TEMPLATE/`;
const fields = readdirSync(FORMS)
  .filter((f) => f !== "config.yml")
  .flatMap((f) => parse(readFileSync(`${FORMS}${f}`, "utf8")).body.filter((b) => b.type !== "markdown"));
const SHORT = new Set(fields.filter((b) => ["dropdown", "input"].includes(b.type)).map((b) => b.attributes.label));
const DROP = new Set(["Your question"]);
const FIELD_LABELS = new Set(fields.map((b) => b.attributes.label));
const EMPTY = /^_?No response_?$/;

/** Plain text with no usernames, empty form answers or runs of blank lines */
const clean = (text) => {
  const paras = (text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/(^|[^\w/.])@[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})/g, "$1a GitHub user")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out = [];
  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    const next = paras[i + 1];
    const answered = next !== undefined && !EMPTY.test(next) && !FIELD_LABELS.has(next);
    // A form field: fold, drop or keep its heading; an empty one goes with its label
    if (FIELD_LABELS.has(p)) {
      if (!answered) {
        if (next !== undefined && EMPTY.test(next)) i++;
        continue;
      }
      if (SHORT.has(p)) {
        out.push(`${p}: ${next}`);
        i++;
        continue;
      }
      if (DROP.has(p)) continue;
    }
    if (!EMPTY.test(p)) out.push(p);
  }
  return out.join("\n\n");
};

const slug = (number, title) => {
  const words = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return words ? `${number}-${words}` : String(number);
};

const list = async (label) => {
  const issues = (await getAll(`${REPO}/issues?labels=${label}&state=all&per_page=100`)).filter((i) => !i.pull_request);
  const items = [];
  for (const issue of issues.sort((a, b) => a.number - b.number)) {
    const comments = await getAll(`${REPO}/issues/${issue.number}/comments?per_page=100`);
    const answer = comments.filter((c) => c.user?.login === OWNER).sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)).at(-1);
    if (!answer) continue;
    items.push({
      number: issue.number,
      slug: slug(issue.number, issue.title),
      title: clean(issue.title),
      question: clean(issue.body_text),
      answer: clean(answer.body_text),
      url: issue.html_url,
    });
  }
  return items;
};

try {
  const data = { answered: await list(LABELS.answered), known: await list(LABELS.known) };
  writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`fetch-issues: ${data.answered.length} answered question(s), ${data.known.length} known issue(s)`);
} catch (e) {
  const message = `fetch-issues: ${e.message}; keeping the committed data`;
  console.log(process.env.GITHUB_ACTIONS ? `::warning::${message}` : message);
}
