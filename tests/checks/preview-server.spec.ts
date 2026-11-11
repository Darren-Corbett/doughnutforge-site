// The layout and link tests start `astro preview` from playwright.config.ts. When an
// AI agent runs it, Astro 7 starts the server in the background and returns at once,
// so Playwright stops with "Process from config.webServer exited early". The command
// must keep the server in the foreground, for agents and people alike.
import { expect, test } from "@playwright/test";
import { execFile, spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import config from "../../playwright.config";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);
const port = 4339;

test("the preview server stays in the foreground when an agent starts it", async () => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  writeFileSync(join(dist, "index.html"), "<!doctype html><title>Preview</title>");
  const { command } = config.webServer as { command: string };
  const child = spawn(`${command.replace(/--port \d+/, `--port ${port}`)} --outDir ${dist}`, {
    shell: true,
    cwd: root,
    detached: true,
    stdio: "ignore",
    // Claude Code sets this; Astro reads it to decide that an agent is running it
    env: { ...process.env, CLAUDECODE: "1" },
  });
  try {
    await expect
      .poll(async () => (await fetch(`http://localhost:${port}/`).catch(() => null))?.status, { timeout: 30_000 })
      .toBe(200);
    // A backgrounded start returns just after the server answers
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    expect(child.exitCode, "the command returned and left the server in the background").toBeNull();
  } finally {
    if (child.exitCode === null) process.kill(-child.pid!);
    else await run("npx", ["astro", "preview", "stop"], { cwd: root }).catch(() => {});
  }
});
