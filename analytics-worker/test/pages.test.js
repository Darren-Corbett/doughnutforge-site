import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pageList } from "../src/pages.js";

const LIST_URL = "https://doughnut-forge.app/count-pages.json";
const LIST = { pages: { "/": "en", "/de/": "de" }, stores: ["app-store"] };
const HOUR = 60 * 60 * 1000;

function setup(answers) {
  const clock = { now: 0 };
  const asked = [];
  const list = pageList({
    url: LIST_URL,
    fetch: async (url) => {
      asked.push(url);
      const answer = answers.shift();
      if (answer instanceof Error) throw answer;
      return answer;
    },
    now: () => clock.now,
  });
  return { list, clock, asked };
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

describe("the site's page list", () => {
  it("is fetched from the live site and kept for an hour", async () => {
    const { list, clock, asked } = setup([json(LIST), json({ ...LIST, stores: ["google-play"] })]);
    assert.deepEqual(await list.get(), LIST);
    clock.now = HOUR - 1;
    assert.deepEqual(await list.get(), LIST);
    assert.deepEqual(asked, [LIST_URL]);
    clock.now = HOUR;
    assert.deepEqual((await list.get()).stores, ["google-play"]);
    assert.equal(asked.length, 2);
  });

  it("is missing until the first load works", async () => {
    for (const answer of [
      new Error("offline"),
      new Response("nope", { status: 404 }),
      new Response("not json"),
      json({ pages: [] }),
      json({ pages: { "/": "en" } }),
      json({ pages: { "/": 1 }, stores: [] }),
      json({ pages: { "no-slash/": "en" }, stores: [] }),
      json({ pages: { "/": "en" }, stores: [7] }),
    ]) {
      const { list } = setup([answer]);
      assert.equal(await list.get(), null, String(answer));
    }
  });

  it("keeps the last good list when a refresh fails", async () => {
    const { list, clock } = setup([json(LIST), new Error("offline")]);
    await list.get();
    clock.now = HOUR;
    assert.deepEqual(await list.get(), LIST);
  });

  it("waits a minute before trying again after a failure, so a broken site is not asked on every hit", async () => {
    const { list, clock, asked } = setup([new Error("offline"), json(LIST)]);
    assert.equal(await list.get(), null);
    clock.now = 59 * 1000;
    assert.equal(await list.get(), null);
    assert.equal(asked.length, 1);
    clock.now = 60 * 1000;
    assert.deepEqual(await list.get(), LIST);
  });
});
