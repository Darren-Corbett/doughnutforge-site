// Builds the site with the page counter switched on, for the counting tests.
// The real build leaves the counter's address empty (src/data/counter.ts), so
// these tests build their own copy with a fake counter address, which the
// tests answer themselves: nothing ever reaches the real counter.
import { test as setup } from "@playwright/test";
import { execFile } from "node:child_process";
import { rmSync } from "node:fs";
import { promisify } from "node:util";
import { COUNTER, SITE_DIR } from "./site";

const root = new URL("../../", import.meta.url).pathname;

setup("build the site with the counter on", async () => {
  setup.setTimeout(5 * 60_000);
  rmSync(SITE_DIR, { recursive: true, force: true });
  await promisify(execFile)("npx", ["astro", "build", "--outDir", SITE_DIR], {
    cwd: root,
    env: { ...process.env, COUNTER_URL_FOR_TESTS: COUNTER },
    maxBuffer: 64 * 1024 * 1024,
  });
});
