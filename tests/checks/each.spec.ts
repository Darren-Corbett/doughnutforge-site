// Tests check each element through tests/support/each.ts, never a bare
// `locator.all()`, which passes on an empty page (retro, 1 November 2026).
import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";

const tests = new URL("../", import.meta.url).pathname;
const files = (readdirSync(tests, { recursive: true }) as string[]).filter((f) => f.endsWith(".ts") && !["support/each.ts", "checks/each.spec.ts"].includes(f));

test("no test loops over a bare locator.all()", () => {
  const bare = files.flatMap((f) =>
    readFileSync(`${tests}${f}`, "utf8")
      .split("\n")
      .flatMap((line, i) => (/\.all\(\)/.test(line) ? [`${f}:${i + 1}: ${line.trim()}`] : [])),
  );
  expect(bare, "use each() from tests/support/each.ts").toEqual([]);
});
