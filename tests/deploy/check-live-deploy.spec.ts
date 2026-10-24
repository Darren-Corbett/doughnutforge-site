// The deploy's live check (scripts/check-live-deploy.mjs), run against a local
// server: it must pass only when the live pages are the build just deployed, and
// fail on the old "Coming soon" placeholder or any other page. Also checks that
// the deploy job's token can read the Pages settings, which the workflow needs
// to confirm Pages still deploys from GitHub Actions, and that the deploy checks
// security.txt and private vulnerability reporting.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);
// A file the build did not make gets no hash, so the tests that need it fail
const sha = (file: string) => (existsSync(file) ? createHash("sha256").update(readFileSync(file)).digest("hex") : "missing");

const BUILT = {
  "/": `${root}dist/index.html`,
  "/download/": `${root}dist/download/index.html`,
  "/.well-known/security.txt": `${root}dist/.well-known/security.txt`,
};
const PLACEHOLDER = `${root}index.html`;

/** Serves each path from a file, ignoring the query, as GitHub Pages does */
const serve = async (files: Record<string, string>) => {
  const server: Server = createServer((req, res) => {
    const file = files[new URL(req.url!, "http://x").pathname];
    if (!file) return res.writeHead(404).end();
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(readFileSync(file));
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  return { base: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, close: () => new Promise((r) => server.close(r)) };
};

/** Runs the check with short waits; resolves with its exit code and output */
const check = async (base: string, expect: Record<string, string>) => {
  const args = [`${root}scripts/check-live-deploy.mjs`, "--base", base, "--expect", Object.entries(expect).map(([p, h]) => `${p}=${h}`).join(","), "--timeout", "2", "--interval", "0.5"];
  try {
    const { stdout, stderr } = await run(process.execPath, args);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};

const expected = Object.fromEntries(Object.entries(BUILT).map(([path, file]) => [path, sha(file)]));

test("passes when the live pages are the build just deployed", async () => {
  const server = await serve(BUILT);
  try {
    const result = await check(server.base, expected);
    expect(result.output).toContain("match");
    expect(result.code).toBe(0);
  } finally {
    await server.close();
  }
});

test('fails when "/" is the old "Coming soon" placeholder', async () => {
  const server = await serve({ "/": PLACEHOLDER, "/download/": BUILT["/download/"] });
  try {
    const result = await check(server.base, expected);
    expect(result.code).not.toBe(0);
    expect(result.output).toMatch(/placeholder|Coming soon/i);
  } finally {
    await server.close();
  }
});

test("fails when a live page is not the build just deployed", async () => {
  const server = await serve(BUILT);
  try {
    const result = await check(server.base, { ...expected, "/download/": "0".repeat(64) });
    expect(result.code).not.toBe(0);
    expect(result.output).toContain("/download/");
  } finally {
    await server.close();
  }
});

test("fails when security.txt is missing", async () => {
  const server = await serve({ "/": BUILT["/"], "/download/": BUILT["/download/"] });
  try {
    const result = await check(server.base, expected);
    expect(result.code).not.toBe(0);
    expect(result.output).toContain("/.well-known/security.txt");
  } finally {
    await server.close();
  }
});

test("fails when a page is missing", async () => {
  const server = await serve({ "/": BUILT["/"] });
  try {
    expect((await check(server.base, expected)).code).not.toBe(0);
  } finally {
    await server.close();
  }
});

test("the deploy job's token may read the Pages settings", () => {
  // `gh api repos/<repo>/pages` needs pages: read or write, granted at the top
  // level of the workflow or on the deploy job itself
  const workflow = readFileSync(`${root}.github/workflows/deploy.yml`, "utf8");
  const grants = (block: string) => /^\s+pages:\s*(read|write)\s*$/m.test(block);
  const topLevel = workflow.match(/^permissions:\n((?:[ \t]+.*\n)+)/m)?.[1] ?? "";
  const deployJob = workflow.match(/^ {2}deploy:\n((?:(?: {4,}.*)?\n)+)/m)?.[1] ?? "";
  const jobPermissions = deployJob.match(/^ {4}permissions:\n((?: {6,}.*\n)+)/m)?.[1];
  // A job's own permissions replace the top-level ones entirely
  expect(jobPermissions !== undefined ? grants(jobPermissions) : grants(topLevel), "pages: read or write for the deploy job").toBe(true);
  expect(workflow, "the workflow checks that Pages deploys from GitHub Actions").toMatch(/gh api repos\/\$\{\{ github\.repository \}\}\/pages --jq \.build_type/);
  expect(workflow, "the workflow runs the live-page check").toContain("scripts/check-live-deploy.mjs");
  expect(workflow, "the live-page check includes security.txt").toMatch(/--expect "[^"]*\/\.well-known\/security\.txt=\$\{\{ needs\.build\.outputs\.security \}\}/);
  // The security page must never be live while its report link leads nowhere
  expect(workflow, "the workflow checks private vulnerability reporting is on").toContain(
    "gh api repos/Darren-Corbett/forge-privacy/private-vulnerability-reporting --jq .enabled",
  );
});

test("the deploy runs daily and by hand, fetching the answered issues first, with no token", () => {
  const workflow = readFileSync(`${root}.github/workflows/deploy.yml`, "utf8");
  const on = workflow.match(/^on:\n((?:[ \t]+.*\n)+)/m)?.[1] ?? "";
  expect(on, "a daily schedule").toMatch(/schedule:\n\s+- cron: "\d+ \d+ \* \* \*"/);
  expect(on, "a manual run button").toContain("workflow_dispatch");
  // The fetch step comes before the build, and has no token of any kind
  const fetchStep = workflow.match(/- name: Fetch answered issues\n((?: {8,}.*\n)+)/)?.[0] ?? "";
  expect(fetchStep, "a Fetch answered issues step").toContain("node scripts/fetch-issues.mjs");
  expect(fetchStep).not.toMatch(/token|secrets\./i);
  expect(workflow.indexOf("node scripts/fetch-issues.mjs")).toBeLessThan(workflow.indexOf("npm run build:deploy"));
});
