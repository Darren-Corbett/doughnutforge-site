// The layout checks in real Mobile Safari, on an iOS Simulator, through
// safaridriver (WebDriver). Playwright's WebKit is close to Safari but not the
// same, so this is the final word on sideways panning and the header on iPhone.
//
// macOS with Xcode only. Run by hand:
//   1. npm run build && npm run preview (port 4329)
//   2. Boot a simulator, and in its Settings > Apps > Safari > Advanced turn on
//      Remote Automation (or: xcrun simctl spawn <udid> defaults write com.apple.mobilesafari RemoteAutomationEnabled -bool YES)
//   3. safaridriver -p 4444 &
//   4. node tests/ios/real-safari.ts <udid> [out dir] [path ...]
// Prints one JSON line per page, and saves a screenshot of each page with a problem.
import { mkdirSync, writeFileSync } from "node:fs";
import { installMeasures } from "../support/measure.ts";
import { pages } from "../support/site.ts";

const [udid, out = "test-results/ios", ...only] = process.argv.slice(2);
if (!udid) throw new Error("Give the simulator's UDID: xcrun simctl list devices booted");
mkdirSync(out, { recursive: true });

const DRIVER = "http://localhost:4444";
const BASE = process.env.BASE ?? "http://localhost:4329";

const call = async (method: string, path: string, body?: unknown) => {
  const res = await fetch(`${DRIVER}${path}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const json = (await res.json()) as { value: any };
  if (!res.ok) throw new Error(`${method} ${path}: ${JSON.stringify(json.value).slice(0, 300)}`);
  return json.value;
};

const session = await call("POST", "/session", {
  capabilities: { alwaysMatch: { browserName: "safari", platformName: "iOS", "safari:useSimulator": true, "safari:deviceUDID": udid } },
});
const s = `/session/${session.sessionId}`;
const install = `(${installMeasures.toString()})();`;
const run = (code: string) => call("POST", `${s}/execute/sync`, { script: `${install} return (${code})`, args: [] });
const runAsync = (code: string) =>
  call("POST", `${s}/execute/async`, { script: `${install} const done = arguments[arguments.length - 1]; Promise.resolve(${code}).then(done, (e) => done(String(e)));`, args: [] });

try {
  for (const path of only.length ? only : pages) {
    await call("POST", `${s}/url`, { url: BASE + path });
    await runAsync("window.__measure.scrollThrough()");
    const result = {
      path,
      device: session.capabilities["safari:deviceName"],
      ios: session.capabilities["safari:platformVersion"],
      theme: await run("matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'"),
      scroll: await run("window.__measure.sidewaysScroll()"),
      wide: await run("window.__measure.wideElements()"),
      nav: await run("window.__measure.navRows()"),
      text: await run("window.__measure.overflowingText()"),
      images: await runAsync("window.__measure.brokenImages()"),
    };
    console.log(JSON.stringify(result));
    const pans = result.scroll.scrollWidth > result.scroll.clientWidth || result.scroll.scrollX > 0;
    if (pans || result.wide.length || result.nav.rows > 1 || result.images.length) {
      const png = await call("GET", `${s}/screenshot`);
      writeFileSync(`${out}/${result.theme}-${path.replaceAll("/", "_") || "_"}.png`, Buffer.from(png, "base64"));
    }
  }
} finally {
  await call("DELETE", s);
}
