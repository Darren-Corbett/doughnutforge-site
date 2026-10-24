// scripts/fetch-issues.mjs, run against a local stand-in for the GitHub API: it
// keeps only labelled issues the owner has answered, shows the owner's latest
// comment as the answer, leaves out every username and everyone else's
// comments, sends no token, and on any failure leaves the committed data as it is.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type IncomingHttpHeaders, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);
const REPO = "/repos/Darren-Corbett/forge-privacy";
const OWNER = "Darren-Corbett";

const user = (login: string) => ({ login, avatar_url: `https://avatars.example/${login}`, html_url: `https://github.com/${login}` });
const issue = (number: number, title: string, body_text: string, extra = {}) => ({
  number,
  title,
  body_text,
  html_url: `https://github.com/Darren-Corbett/forge-privacy/issues/${number}`,
  user: user("asker"),
  ...extra,
});
const comment = (login: string, body_text: string, created_at: string) => ({ user: user(login), body_text, created_at });

// What the stand-in API serves, by path and query
const API: Record<string, { body: unknown; link?: string }> = {
  [`${REPO}/issues?labels=site-faq&state=all&per_page=100`]: {
    body: [
      issue(1, "How do I restore my identity?", "Platform\n\nMac\n\nApp version\n\nNo response\n\nYour question\n\nI lost my Mac. @friend said to ask here. How do I get my identity back?"),
      issue(2, "Nobody has answered this yet", "Is there a Linux version?"),
      issue(3, "A pull request with the label", "Not an issue", { pull_request: { url: "x" } }),
    ],
  },
  [`${REPO}/issues?labels=site-known-issue&state=all&per_page=100`]: {
    body: [
      issue(
        4,
        "Face ID asks twice after locking",
        "Platform\n\niPhone\n\nApp version\n\n0.4.44\n\nWhat happened?\n\nOn iPhone, Face ID asks twice.\n\nWhat did you expect to happen?\n\nOnce.",
      ),
    ],
  },
  [`${REPO}/issues/1/comments?per_page=100`]: {
    body: [
      comment("friend", "Try your backup phrase?", "2026-10-25T09:00:00Z"),
      comment(OWNER, "An older answer from the owner.", "2026-10-25T10:00:00Z"),
      comment(OWNER, "Use Restore Identity with your backup phrase. Thanks @friend for the tip.", "2026-10-25T11:00:00Z"),
      comment("friend", "That worked, thank you!", "2026-10-25T12:00:00Z"),
    ],
  },
  [`${REPO}/issues/2/comments?per_page=100`]: { body: [comment("friend", "Me too", "2026-10-25T09:00:00Z")] },
  // The owner's latest answer on issue 4 is on the second page of comments
  [`${REPO}/issues/4/comments?per_page=100`]: {
    body: [comment(OWNER, "Known issue, being looked at.", "2026-10-25T09:00:00Z")],
    link: `<BASE${REPO}/issues/4/comments?per_page=100&page=2>; rel="next"`,
  },
  [`${REPO}/issues/4/comments?per_page=100&page=2`]: {
    body: [comment(OWNER, "Fixed in the next update. Lock the app, then tap to unlock.", "2026-10-26T09:00:00Z")],
  },
};

type Mode = "ok" | "500" | "rate-limit" | "bad-json";
const serve = async (mode: Mode) => {
  const seen: IncomingHttpHeaders[] = [];
  const server: Server = createServer((req, res) => {
    seen.push(req.headers);
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    if (mode === "500") return res.writeHead(500).end("{}");
    if (mode === "rate-limit") return res.writeHead(403, { "x-ratelimit-remaining": "0" }).end('{"message":"API rate limit exceeded"}');
    if (mode === "bad-json") return res.writeHead(200, { "Content-Type": "application/json" }).end("not json");
    const hit = API[req.url!];
    if (!hit) return res.writeHead(404).end("{}");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (hit.link) headers.Link = hit.link.replace("BASE", base);
    res.writeHead(200, headers).end(JSON.stringify(hit.body));
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  return { base: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, seen, close: () => new Promise((r) => server.close(r)) };
};

/** Runs the script into a fresh file that already holds `before`; returns its exit code, output and the file */
const fetchInto = async (base: string, before: string) => {
  const out = join(mkdtempSync(join(tmpdir(), "issues-")), "issues.json");
  writeFileSync(out, before);
  const env = { ...process.env, FORGE_API: base, ISSUES_OUT: out, GITHUB_TOKEN: "must-not-be-sent", GH_TOKEN: "must-not-be-sent" };
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/fetch-issues.mjs`], { env });
    return { code: 0, output: stdout + stderr, file: readFileSync(out, "utf8") };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}`, file: readFileSync(out, "utf8") };
  }
};

const COMMITTED = `${JSON.stringify({ answered: [{ number: 9, slug: "9-kept", title: "Kept", question: "Q", answer: "A", url: "u" }], known: [] }, null, 2)}\n`;

test("keeps only answered, labelled issues, with the owner's latest comment as the answer", async () => {
  const api = await serve("ok");
  try {
    const result = await fetchInto(api.base, COMMITTED);
    expect(result.code, result.output).toBe(0);
    const data = JSON.parse(result.file);
    expect(Object.keys(data).sort()).toEqual(["answered", "known"]);
    // Issue 2 has no answer from the owner, and 3 is a pull request
    expect(data.answered.map((i: { number: number }) => i.number)).toEqual([1]);
    expect(data.known.map((i: { number: number }) => i.number)).toEqual([4]);

    const [faq] = data.answered;
    expect(Object.keys(faq).sort()).toEqual(["answer", "number", "question", "slug", "title", "url"]);
    expect(faq.slug).toBe("1-how-do-i-restore-my-identity");
    expect(faq.title).toBe("How do I restore my identity?");
    expect(faq.url).toBe("https://github.com/Darren-Corbett/forge-privacy/issues/1");
    // The owner's latest comment, not a later one by someone else or an older one
    expect(faq.answer).toBe("Use Restore Identity with your backup phrase. Thanks a GitHub user for the tip.");
    // The question as written: short form fields on one line, no empty answers,
    // no "Your question" heading, and no username
    expect(faq.question).toBe("Platform: Mac\n\nI lost my Mac. a GitHub user said to ask here. How do I get my identity back?");
    // A bug report keeps its longer fields' headings
    expect(data.known[0].question).toBe(
      "Platform: iPhone\n\nApp version: 0.4.44\n\nWhat happened?\n\nOn iPhone, Face ID asks twice.\n\nWhat did you expect to happen?\n\nOnce.",
    );
    // The newest owner comment, found on the second page
    expect(data.known[0].answer).toBe("Fixed in the next update. Lock the app, then tap to unlock.");

    // Nothing about any person, anywhere in the file
    expect(result.file).not.toMatch(/asker|friend|Darren-Corbett\/?"|avatar|login|"user"|@\w/);
    // No token is ever sent, even when one is in the environment
    expect(api.seen.length).toBeGreaterThan(0);
    for (const h of api.seen) expect(h.authorization, "no Authorization header").toBeUndefined();
  } finally {
    await api.close();
  }
});

for (const mode of ["500", "rate-limit", "bad-json"] as const) {
  test(`keeps the committed data when the API fails (${mode})`, async () => {
    const api = await serve(mode);
    try {
      const result = await fetchInto(api.base, COMMITTED);
      expect(result.code, "a failed fetch does not stop the build").toBe(0);
      expect(result.output).toMatch(/keeping the committed data/i);
      expect(result.file, "the committed file is unchanged, byte for byte").toBe(COMMITTED);
    } finally {
      await api.close();
    }
  });
}
