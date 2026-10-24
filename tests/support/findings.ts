// Every failed check is a test failure. With AUDIT_DIR set, each one is also
// written as a line of JSON to <AUDIT_DIR>/findings.jsonl, with a screenshot of
// the first case of each kind, so scripts/audit-report.mjs can group them.
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import type { Page, TestInfo } from "@playwright/test";

const dir = process.env.AUDIT_DIR;
if (dir) mkdirSync(`${dir}/shots`, { recursive: true });

export type Finding = {
  check: string;
  page: string;
  lang: string;
  browser: string;
  width: number;
  theme: string;
  detail: unknown;
  /** Same key, same problem: one screenshot per key */
  key: string;
  shot?: string;
};

export async function record(page: Page, info: TestInfo, f: Omit<Finding, "browser" | "shot">, highlight?: string) {
  const browser = info.project.name;
  const finding: Finding = { ...f, browser };
  if (dir) {
    const id = createHash("sha1").update(`${browser}|${f.width}|${f.theme}|${f.key}`).digest("hex").slice(0, 12);
    const file = `${dir}/shots/${id}.png`;
    if (!existsSync(file)) {
      if (highlight) await outline(page, highlight);
      await page.screenshot({ path: file }).catch(() => undefined);
      if (highlight) await page.evaluate(() => document.querySelectorAll("[data-audit]").forEach((e) => e.removeAttribute("data-audit")));
    }
    finding.shot = `${id}.png`;
    appendFileSync(`${dir}/findings.jsonl`, JSON.stringify(finding) + "\n");
  }
  return finding;
}

/** Scroll to the first element matching a text or selector and draw a red outline round it */
async function outline(page: Page, selector: string) {
  await page
    .evaluate((sel) => {
      let e: Element | null = null;
      try {
        e = document.querySelector(sel);
      } catch {}
      if (!e) return;
      const style = document.getElementById("audit-style") ?? document.head.appendChild(Object.assign(document.createElement("style"), { id: "audit-style" }));
      style.textContent = "[data-audit]{outline:3px solid red !important;outline-offset:-3px}";
      e.setAttribute("data-audit", "");
      e.scrollIntoView({ block: "center", inline: "nearest" });
    }, selector)
    .catch(() => undefined);
}
