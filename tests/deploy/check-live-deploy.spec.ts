// The deploy's live check (scripts/check-live-deploy.mjs), run against a local
// server: it must pass only when the live pages are the build just deployed, and
// fail on the old "Coming soon" placeholder or any other page. Also checks that
// the deploy job's token can read the Pages settings, which the workflow needs
// to confirm Pages still deploys from GitHub Actions, and that the deploy checks
// security.txt and private vulnerability reporting.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);
// A file the build did not make gets no hash, so the tests that need it fail
const sha = (file: string) => (existsSync(file) ? createHash("sha256").update(readFileSync(file)).digest("hex") : "missing");

const BUILT = {
  "/": `${root}dist/index.html`,
  "/download/": `${root}dist/download/index.html`,
  "/.well-known/security.txt": `${root}dist/.well-known/security.txt`,
  "/build.json": `${root}dist/build.json`,
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

test("passes after a rebuild that changed nothing, so the build ID is the same", async () => {
  // The daily rebuild of an unchanged site: the build ID is a hash of the content
  // (scripts/build-id.mjs), so the second build's files, build.json included, are
  // byte for byte the ones already live, and the check must pass at once
  const rebuilt = mkdtempSync(join(tmpdir(), "rebuild-"));
  const second = Object.fromEntries(
    Object.entries(BUILT).map(([path, file], i) => {
      const copy = join(rebuilt, String(i));
      copyFileSync(file, copy);
      return [path, copy];
    }),
  );
  expect(readFileSync(second["/build.json"], "utf8")).toBe(readFileSync(BUILT["/build.json"], "utf8"));
  const server = await serve(BUILT);
  try {
    const result = await check(server.base, Object.fromEntries(Object.entries(second).map(([path, file]) => [path, sha(file)])));
    expect(result.output).toContain("match");
    expect(result.code).toBe(0);
  } finally {
    await server.close();
  }
});

test("fails when the live build.json is an older build", async () => {
  const older = join(mkdtempSync(join(tmpdir(), "older-")), "build.json");
  writeFileSync(older, '{"id":"0000000000000000"}');
  const server = await serve({ ...BUILT, "/build.json": older });
  try {
    const result = await check(server.base, expected);
    expect(result.code).not.toBe(0);
    expect(result.output).toContain("/build.json");
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
  // So the deploy proves the live build ID is this build's (src/components/FreshCheck.astro)
  expect(workflow, "the live-page check includes build.json").toMatch(/--expect "[^"]*\/build\.json=\$\{\{ needs\.build\.outputs\.build \}\}/);
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
  // The steps themselves, not the header comment, which names the build too
  expect(workflow.indexOf("run: node scripts/fetch-issues.mjs")).toBeLessThan(workflow.indexOf("run: npm run build:deploy"));
});

test("the font install has a time limit, so a stuck download fails the run instead of hanging it", () => {
  // On 26 October 2026 apt-get hung in this step for over ten minutes (run 40295571635);
  // without a limit, GitHub waits six hours before ending the job
  const workflow = readFileSync(`${root}.github/workflows/deploy.yml`, "utf8");
  const fontStep = workflow.match(/- name: Install Noto fonts\n((?: {8,}.*\n)+)/)?.[0] ?? "";
  expect(fontStep, "an Install Noto fonts step").toContain("apt-get install");
  const limit = Number(fontStep.match(/^ {8}timeout-minutes:\s*(\d+)\s*$/m)?.[1]);
  expect(limit, "timeout-minutes on the step").toBeGreaterThan(0);
  expect(limit, "at most ten minutes").toBeLessThanOrEqual(10);
});
