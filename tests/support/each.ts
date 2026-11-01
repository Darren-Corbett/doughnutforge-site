// Every element a locator matches, for a test that checks each one. A loop over
// `locator.all()` passes when nothing matches, so it proves nothing on a page
// that lost its elements; this fails instead. With no count, at least one must
// match; with a count, exactly that many (0 where a page may rightly have none).
// tests/checks/each.spec.ts keeps bare `.all()` loops out of the tests.
import { expect, type Locator } from "@playwright/test";

export async function each(locator: Locator, count?: number): Promise<Locator[]> {
  const found = await locator.all();
  if (count === undefined) expect(found.length, `nothing matches ${locator}`).toBeGreaterThan(0);
  else expect(found.length, `matches of ${locator}`).toBe(count);
  return found;
}
