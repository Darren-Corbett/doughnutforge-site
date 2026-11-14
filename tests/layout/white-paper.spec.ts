// The white paper page (src/views/WhitePaperPage.astro): one h1, an overview
// first, each "How this is checked" note folded away, and a PDF of the same text
// to download, served from this site.
import { expect, test } from "../support/browser";

test("white paper: overview first, notes folded away, PDF from this site", async ({ page }) => {
  await page.goto("/security/white-paper/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main h2").first()).toHaveText("Overview");
  const notes = page.locator("main details.checked");
  expect(await notes.count()).toBeGreaterThan(5);
  for (const note of await notes.all()) expect(await note.getAttribute("open")).toBeNull();
  await expect(notes.first().locator("summary")).toHaveText("How this is checked");
  const pdf = page.locator('a[href="/security/white-paper/doughnut-forge-white-paper-en.pdf"]');
  await expect(pdf).toHaveCount(1);
  const res = await page.request.get("/security/white-paper/doughnut-forge-white-paper-en.pdf");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("application/pdf");
});

test("white paper: opening a note shows how that section is checked", async ({ page }) => {
  await page.goto("/security/white-paper/");
  const note = page.locator("main details.checked").first();
  await note.locator("summary").click();
  await expect(note).toHaveAttribute("open", "");
  await expect(note.locator("p").first()).toBeVisible();
});
