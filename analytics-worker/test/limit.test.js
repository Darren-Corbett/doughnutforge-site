import assert from "node:assert/strict";
import { it } from "node:test";
import { perSecond } from "../src/limit.js";

it("allows the limit in each second and nothing more, without knowing who asks", () => {
  let now = 5_000;
  const limit = perSecond(3, () => now);
  assert.deepEqual([limit.allow(), limit.allow(), limit.allow(), limit.allow()], [true, true, true, false]);
  now = 5_999;
  assert.equal(limit.allow(), false);
  now = 6_000;
  assert.equal(limit.allow(), true);
  assert.equal(limit.allow.length, 0);
});
