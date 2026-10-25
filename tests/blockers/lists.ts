// The public content-blocking lists that phone browsers use, and which browsers
// use each. Downloaded fresh for each run (cached for 12 hours in
// test-results/blocker-lists/), because the lists change daily. Private lists
// (1Blocker, Wipr) cannot be fetched; the naming check
// (scripts/check-blocker-names.mjs) and the fallback link
// (src/components/StoreBadge.astro) cover them instead.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { FiltersEngine } from "@ghostery/adblocker";

export type List = { name: string; url: string; browsers: string };

const UBO = "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters";
const BRAVE = "https://raw.githubusercontent.com/brave/adblock-lists/master";

/** Lists with a fixed address */
const FIXED: List[] = [
  // Brave (built in), Opera, Vivaldi, Ghostery, Adblock Plus, uBlock Origin, Samsung Internet plug-ins
  { name: "EasyList", url: "https://easylist.to/easylist/easylist.txt", browsers: "Brave, Opera, Vivaldi, Ghostery, Adblock Plus, uBlock Origin" },
  { name: "EasyPrivacy", url: "https://easylist.to/easylist/easyprivacy.txt", browsers: "Brave, Ghostery, Adblock Plus, uBlock Origin" },
  { name: "Fanboy's Annoyance", url: "https://secure.fanboy.co.nz/fanboy-annoyance.txt", browsers: "Brave, Adblock Plus, uBlock Origin (opt-in)" },
  { name: "Fanboy's Social", url: "https://secure.fanboy.co.nz/fanboy-social.txt", browsers: "Brave, Adblock Plus, uBlock Origin (opt-in)" },
  { name: "EasyList Cookie", url: "https://secure.fanboy.co.nz/fanboy-cookiemonster.txt", browsers: "Brave, Adblock Plus, uBlock Origin (opt-in)" },
  { name: "Peter Lowe's list", url: "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=adblockplus&showintro=0&mimetype=plaintext", browsers: "uBlock Origin" },
  // uBlock Origin's defaults and annoyances (Firefox for Android, Brave)
  ...["filters", "privacy", "badware", "quick-fixes", "unbreak", "annoyances-cookies", "annoyances-others"].map((f) => ({
    name: `uBlock ${f}`,
    url: `${UBO}/${f}.txt`,
    browsers: "uBlock Origin (Firefox for Android), Brave",
  })),
  // Brave's own
  ...["brave-lists/brave-specific.txt", "brave-lists/brave-firstparty.txt", "brave-unbreak.txt"].map((f) => ({ name: `Brave ${f}`, url: `${BRAVE}/${f}`, browsers: "Brave" })),
];

/** AdGuard publishes every list it offers, its own and third-party, per platform */
const REGISTRIES = [
  { url: "https://filters.adtidy.org/ios/filters.json", browsers: "AdGuard for Safari on iPhone and iPad" },
  { url: "https://filters.adtidy.org/extension/safari/filters.json", browsers: "AdGuard for Safari" },
  { url: "https://filters.adtidy.org/android/filters.json", browsers: "AdGuard for Android (Samsung Internet, Firefox, Chrome)" },
];

const cacheDir = new URL("../../test-results/blocker-lists/", import.meta.url).pathname;
const HALF_DAY = 12 * 3600 * 1000;

const cacheFile = (url: string) => `${cacheDir}${createHash("sha256").update(url).digest("hex").slice(0, 24)}.txt`;

/** Fetches a URL as text, from the cache when fresh; throws on any failure so coverage never shrinks silently */
const fetchText = async (url: string) => {
  mkdirSync(cacheDir, { recursive: true });
  const file = cacheFile(url);
  if (existsSync(file) && Date.now() - statSync(file).mtimeMs < HALF_DAY) return readFileSync(file, "utf8");
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      writeFileSync(file, text);
      return text;
    } catch (e) {
      if (attempt >= 3) throw new Error(`could not download ${url}: ${(e as Error).message}`);
    }
  }
};

/** Every list: the fixed ones plus every list in AdGuard's registries, full and optimised */
export const allLists = async (): Promise<List[]> => {
  const lists = [...FIXED];
  for (const r of REGISTRIES) {
    const { filters } = JSON.parse(await fetchText(r.url)) as { filters: { name: string; downloadUrl: string }[] };
    for (const f of filters) {
      lists.push({ name: `AdGuard ${f.name}`, url: f.downloadUrl, browsers: r.browsers });
      const full = f.downloadUrl.replace(/_optimized\.txt$/, ".txt");
      if (full !== f.downloadUrl) lists.push({ name: `AdGuard ${f.name} (full)`, url: full, browsers: r.browsers });
    }
  }
  // The same list can appear in several registries
  return [...new Map(lists.map((l) => [l.url, l])).values()];
};

export type Loaded = { engine: FiltersEngine; lists: List[]; whereIs: (rule: string) => string[] };

/**
 * Downloads every list (eight at a time) and builds one engine over all of them.
 * The lists share most of their rules (AdGuard's full and optimised builds, on
 * three platforms), so each rule is parsed once: about 8 million lines become
 * about 1.3 million.
 */
export const loadLists = async (): Promise<Loaded> => {
  const lists = await allLists();
  const rules = new Set<string>();
  let next = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (next < lists.length) {
        const text = await fetchText(lists[next++]!.url);
        for (const line of text.split(/\r?\n/)) if (line && !line.startsWith("!") && !line.startsWith("[")) rules.add(line);
      }
    }),
  );
  const engine = FiltersEngine.parse([...rules].join("\n"), { loadCosmeticFilters: true, loadNetworkFilters: true, loadExtendedSelectors: true });
  rules.clear();
  /** The lists a rule comes from, for the failure message (read from the cache) */
  const whereIs = (rule: string) => {
    const needle = rule.replace(/^[^#]*#[@?$]?#/, "");
    return lists.filter((l) => readFileSync(cacheFile(l.url), "utf8").includes(needle)).map((l) => `${l.name} (${l.browsers})`);
  };
  return { engine, lists, whereIs };
};
