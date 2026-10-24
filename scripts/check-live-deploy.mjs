// After a deploy: the live pages must be the build just deployed. Run by the
// deploy job with the sha256 of each page from that job's own build, so a
// deploy that left the old "Coming soon" placeholder (or any other page) live
// fails instead of passing unnoticed.
//
//   node scripts/check-live-deploy.mjs --base https://doughnut-forge.app \
//     --expect /=<sha256>,/download/=<sha256> [--timeout 300] [--interval 15]
//
// Each page is fetched with a query naming this check, so the CDN serves a fresh
// copy (GitHub Pages ignores the query). Retries until every page matches or the
// timeout (seconds) runs out.
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    base: { type: "string" },
    expect: { type: "string" },
    timeout: { type: "string", default: "300" },
    interval: { type: "string", default: "15" },
  },
});
if (!values.base || !values.expect) {
  console.error("check-live-deploy: give --base <url> and --expect /=<sha256>,/download/=<sha256>");
  process.exit(2);
}

const expected = Object.fromEntries(values.expect.split(",").map((pair) => pair.split("=")));
const deadline = Date.now() + Number(values.timeout) * 1000;
const tag = process.env.GITHUB_RUN_ID ?? String(Date.now());
// The old placeholder's only sentence (repo-root index.html)
const PLACEHOLDER = "Coming soon.</p>";

const look = async (path) => {
  try {
    const res = await fetch(`${values.base}${path}?deploy=${tag}`, { cache: "no-store" });
    const body = Buffer.from(await res.arrayBuffer());
    const sha = createHash("sha256").update(body).digest("hex");
    if (!res.ok) return `${path}: HTTP ${res.status}`;
    if (body.includes(PLACEHOLDER)) return `${path}: the old "Coming soon" placeholder is live`;
    if (sha !== expected[path]) return `${path}: live page ${sha.slice(0, 12)} is not the build just deployed (${expected[path].slice(0, 12)})`;
    return null;
  } catch (e) {
    return `${path}: ${e.message}`;
  }
};

for (;;) {
  const problems = (await Promise.all(Object.keys(expected).map(look))).filter(Boolean);
  if (!problems.length) {
    console.log(`check-live-deploy: ${Object.keys(expected).join(", ")} match the build just deployed`);
    break;
  }
  if (Date.now() >= deadline) {
    console.error(`check-live-deploy:\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, Number(values.interval) * 1000));
}
