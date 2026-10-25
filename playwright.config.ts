// Layout and link tests for the built site (see tests/README.md).
// Layout tests run against `astro preview` of dist/, so build first. They make no
// network calls. The link tests (tests/links) fetch the live site and the stores,
// so they run only when asked: `npm run test:links`.
import { defineConfig, devices } from "@playwright/test";

const PORT = 4329;

export default defineConfig({
  testDir: "tests",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : 6,
  timeout: 10 * 60_000,
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
  },
  projects: [
    // Desktop engines at every audit width
    { name: "chromium", testMatch: /layout\/.*\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", testMatch: /layout\/.*\.spec\.ts/, use: { ...devices["Desktop Safari"] } },
    // Safari on a phone: a mobile viewport, touch and the meta viewport, where
    // any element wider than the screen lets the page pan sideways. Layout and
    // pan checks only: accessibility and interactions repeat desktop WebKit.
    { name: "webkit-iphone", testMatch: /layout\/layout\.spec\.ts/, use: { ...devices["iPhone 13"] } },
    { name: "links", testMatch: /links\/.*\.spec\.ts/ },
    // The deploy's live-page check, against a local server (no browser, no network)
    { name: "deploy", testMatch: /deploy\/check-live-deploy\.spec\.ts/ },
    // After a deploy, open and fresh tabs in Safari on a phone end up on the new build
    { name: "deploy-webkit", testMatch: /deploy\/fresh-build\.spec\.ts/, use: { ...devices["iPhone 13"] } },
    // The forge-privacy issue forms and the issue fetch, against a local server (no browser, no network)
    { name: "forms", testMatch: /forms\/.*\.spec\.ts/ },
    // The build's own checks, run on small built sites of their own (no browser)
    { name: "checks", testMatch: /checks\/.*\.spec\.ts/ },
  ],
});
