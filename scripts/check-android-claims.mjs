// Android does not keep the app's files unreadable while the phone is locked
// (docs/android-release-plan.md, "Must not claim for Android"). No block of
// English text (paragraph, list item, heading) that names Android may say so, or
// name iOS "Complete data protection". Other languages are written from the
// English and covered by the translation review. scripts/check-sender-claims.mjs
// splits pages the same way; it is left as it is (owner, 14 November 2026).
import { readdirSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";

const root = new URL("..", import.meta.url).pathname;
const dist = (parseArgs({ options: { dist: { type: "string" } } }).values.dist ?? `${root}dist`).replace(/\/?$/, "/");

const ANDROID = /\bAndroid\b/;
const CLAIM = /unreadable while|while the (?:phone|device) is locked|complete data protection/i;

// Block elements end a block of text; inline ones (links, bold) do not
const BLOCK = /<\/?(?:p|li|h[1-6]|td|th|dt|dd|div|section|article|header|footer|nav|main|aside|blockquote|figcaption|caption|title|summary|ul|ol|table|tr|br|label|button|option)\b[^>]*>/gi;
const blocksOf = (html) =>
  html
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<wbr>/g, "")
    .replace(BLOCK, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#39;|&apos;/g, "'")
    .split("\n")
    .map((b) => b.replace(/\s+/g, " ").trim())
    .filter(Boolean);

const problems = [];
let pages = 0;
for (const file of readdirSync(dist, { recursive: true }).map(String).filter((f) => f.endsWith(".html")).sort()) {
  const html = readFileSync(`${dist}${file}`, "utf8");
  const lang = /<html\b[^>]*\slang="([^"]+)"/i.exec(html)?.[1] ?? "en";
  if (!lang.startsWith("en")) continue;
  pages++;
  for (const block of blocksOf(html)) if (ANDROID.test(block) && CLAIM.test(block)) problems.push(`${file}: "${block.length > 160 ? `${block.slice(0, 157)}...` : block}"`);
}

if (problems.length) {
  console.error(`check-android-claims: Android does not keep the app's files unreadable while locked. Reword these:\n  ${problems.slice(0, 60).join("\n  ")}`);
  process.exit(1);
}
console.log(`check-android-claims: ${pages} English pages, no iPhone-only file protection claimed for Android`);
