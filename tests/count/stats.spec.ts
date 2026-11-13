// /stats/, the footer line and the corrected FAQ answer, on the copy of the
// site with the counter on. The page explains what is counted without
// JavaScript; with it, the page asks the counter for the two fixed windows and
// shows them, with every count below 5 as "fewer than 5".
import { type Page } from "@playwright/test";
import { expect, test } from "../support/browser";
import { readFileSync } from "node:fs";
import { COUNTER, serveSite, SITE, SITE_DIR } from "./site";

const SEVEN = {
  window: 7,
  from: "2026-11-06",
  to: "2026-11-12",
  totals: {
    page: { rows: [{ value: "/", count: 120 }, { value: "/features/", count: 8 }], others: { count: null } },
    language: { rows: [{ value: "en", count: 128 }], others: null },
    country: { rows: [{ value: "GB", count: 40 }, { value: "unknown", count: 6 }], others: { count: 12 } },
    referrer: {
      rows: [
        { value: "direct", count: 50 },
        { value: "internal", count: 30 },
        { value: "duckduckgo.com", count: 9 },
      ],
      others: null,
    },
    store: { rows: [], others: null },
  },
};
const THIRTY = {
  window: 30,
  from: "2026-10-14",
  to: "2026-11-12",
  totals: {
    page: { rows: [{ value: "/", count: 1234 }], others: null },
    language: { rows: [{ value: "en", count: 1234 }], others: null },
    country: { rows: [{ value: "DE", count: 1234 }], others: null },
    referrer: { rows: [{ value: "direct", count: 1234 }], others: null },
    store: { rows: [{ value: "app-store", count: 6 }], others: { count: null } },
  },
};
const SUMMARIES = { "7": SEVEN, "30": THIRTY };
const SOURCE = "https://github.com/Darren-Corbett/doughnutforge-site/tree/main/analytics-worker";

/** Every row of one table in one window, as the text of each cell */
const rowsOf = (page: Page, window: string, table: string) =>
  page
    .getByRole("region", { name: window })
    .getByRole("table", { name: table })
    .locator("tbody tr")
    .evaluateAll((rows) => rows.map((row) => [...row.children].map((cell) => (cell.textContent ?? "").trim())));

test.describe("/stats/ without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("explains what is and is not counted, how to opt out, and asks for JavaScript to see the numbers", async ({ context, page }) => {
    const { summaryAsks } = await serveSite(context, { summaries: SUMMARIES });
    await page.goto(`${SITE}/stats/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page views on this site");
    for (const heading of ["What is counted", "What is never counted", "How not to be counted", "How the counter works"])
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    // getByText skips <noscript>, so the message is found by its tag
    await expect(page.locator("noscript p")).toHaveText("Turn on JavaScript to see the numbers.");
    await expect(page.locator("noscript p")).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Read the counter's source code" })).toHaveAttribute("href", SOURCE);
    expect(summaryAsks).toEqual([]);
  });
});

test.describe("/stats/ with JavaScript", () => {
  test("asks the counter for the 7 and 30 day windows only", async ({ context, page }) => {
    const { summaryAsks } = await serveSite(context, { summaries: SUMMARIES });
    await page.goto(`${SITE}/stats/`);
    await expect(page.getByRole("region", { name: "Last 30 days" }).getByRole("table").first()).toBeVisible();
    expect([...summaryAsks].sort()).toEqual([`${COUNTER}/summary?window=30`, `${COUNTER}/summary?window=7`]);
    await expect(page.locator("noscript p")).toHaveCount(0);
  });

  test("shows each window's pages, countries, referring sites and store taps, with counts below 5 as fewer than 5", async ({ context, page }) => {
    await serveSite(context, { summaries: SUMMARIES });
    await page.goto(`${SITE}/stats/`);
    expect(await rowsOf(page, "Last 7 days", "Pages")).toEqual([
      ["/", "120"],
      ["/features/", "8"],
      ["Others, each fewer than 5", "fewer than 5"],
    ]);
    expect(await rowsOf(page, "Last 7 days", "Countries")).toEqual([
      ["United Kingdom", "40"],
      ["Unknown", "6"],
      ["Others, each fewer than 5", "12"],
    ]);
    expect(await rowsOf(page, "Last 7 days", "Referring sites")).toEqual([
      ["No referring site", "50"],
      ["This site", "30"],
      ["duckduckgo.com", "9"],
    ]);
    expect(await rowsOf(page, "Last 7 days", "Store taps")).toEqual([["None yet"]]);
    expect(await rowsOf(page, "Last 30 days", "Pages")).toEqual([["/", "1,234"]]);
    expect(await rowsOf(page, "Last 30 days", "Countries")).toEqual([["Germany", "1,234"]]);
    expect(await rowsOf(page, "Last 30 days", "Store taps")).toEqual([
      ["App Store", "6"],
      ["Others, each fewer than 5", "fewer than 5"],
    ]);
  });

  test("shows the days each window covers", async ({ context, page }) => {
    await serveSite(context, { summaries: SUMMARIES });
    await page.goto(`${SITE}/stats/`);
    await expect(page.getByRole("region", { name: "Last 7 days" })).toContainText(/6\s*–\s*12 November 2026/);
    await expect(page.getByRole("region", { name: "Last 30 days" })).toContainText(/14 October\s*–\s*12 November 2026/);
  });

  test("says the numbers could not load when the counter does not answer", async ({ context, page }) => {
    await serveSite(context, { summaries: "fail" });
    await page.goto(`${SITE}/stats/`);
    await expect(page.getByText("The numbers could not load. Try again later.")).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
  });
});

test("every page's footer says what is counted and links to the numbers", async ({ context, page }) => {
  await serveSite(context, { summaries: SUMMARIES });
  for (const path of ["/", "/features/", "/blog/", "/stats/"]) {
    await page.goto(`${SITE}${path}`);
    const footer = page.locator("footer");
    await expect(footer).toContainText("This site counts page views anonymously. No cookies. Nothing about you.");
    await expect(footer.getByRole("link", { name: "See the numbers" })).toHaveAttribute("href", "/stats/");
  }
});

test("the support FAQ says what the website keeps, on the page and in its structured data", async ({ context, page }) => {
  await serveSite(context);
  await page.goto(`${SITE}/support/`);
  const answer = "This website keeps only anonymous daily totals of page views";
  await expect(page.locator("main")).toContainText(answer);
  await expect(page.locator("main")).not.toContainText("this website has no analytics");
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.join("")).toContain(answer);
  expect(jsonLd.join("")).not.toContain("this website has no analytics");
});

test("the counter's page list includes /stats/", () => {
  const list = JSON.parse(readFileSync(`${SITE_DIR}count-pages.json`, "utf8"));
  expect(list.pages["/stats/"]).toBe("en");
});
