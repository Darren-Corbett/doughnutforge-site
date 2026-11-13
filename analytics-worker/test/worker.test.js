import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createWorker } from "../src/index.js";
import { perSecond } from "../src/limit.js";
import { addRow, allRows, fakeD1 } from "./d1.js";

const SITE = "https://doughnut-forge.app";
const COUNTER = "https://counter.example.workers.dev";
const LIST = {
  pages: { "/": "en", "/features/": "en", "/de/features/": "de" },
  stores: ["app-store", "mac-app-store", "microsoft-store", "google-play"],
};
const NOW = new Date("2026-11-13T10:00:00Z");
const IP = "203.0.113.9";
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) TestAgent/1.0";

function setup({ list = LIST, max = 50 } = {}) {
  const db = fakeD1();
  const clock = { now: NOW };
  const worker = createWorker({
    pages: { get: async () => list },
    limit: perSecond(max, () => clock.now.getTime()),
    now: () => clock.now,
  });
  const env = { DB: db };
  return {
    db,
    clock,
    send: (request) => worker.fetch(request, env),
    clean: () => worker.scheduled({}, env),
  };
}

function hit(body, { headers = {}, cf = { country: "GB", city: "London", postalCode: "SW1A 1AA" } } = {}) {
  const request = new Request(`${COUNTER}/hit`, {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: {
      origin: SITE,
      "content-type": "text/plain;charset=UTF-8",
      "cf-connecting-ip": IP,
      "x-forwarded-for": IP,
      "user-agent": UA,
      ...headers,
    },
  });
  Object.defineProperty(request, "cf", { value: cf });
  return request;
}

const summary = (query) => new Request(`${COUNTER}/summary${query}`, { headers: { origin: SITE } });
const view = (p, r = "direct") => ({ p, r });

describe("POST /hit: a page view", () => {
  it("adds one to the page, language, country and referrer totals for today (UTC)", async () => {
    const { db, send } = setup();
    const res = await send(hit(view("/de/features/", "google.com")));
    assert.equal(res.status, 204);
    assert.deepEqual(allRows(db), [
      { day: "2026-11-13", kind: "country", value: "GB", count: 1 },
      { day: "2026-11-13", kind: "language", value: "de", count: 1 },
      { day: "2026-11-13", kind: "page", value: "/de/features/", count: 1 },
      { day: "2026-11-13", kind: "referrer", value: "google.com", count: 1 },
    ]);
  });

  it("adds to the same totals on a second view", async () => {
    const { db, send } = setup();
    await send(hit(view("/features/")));
    await send(hit(view("/features/")));
    assert.ok(allRows(db).every((row) => row.count === 2));
  });

  it("accepts direct and internal as referrers", async () => {
    const { db, send } = setup();
    await send(hit(view("/", "direct")));
    await send(hit(view("/", "internal")));
    const referrers = allRows(db).filter((row) => row.kind === "referrer").map((row) => row.value);
    assert.deepEqual(referrers, ["direct", "internal"]);
  });

  it("stores no IP address, browser, city or postcode, and keeps only day, kind, value and count", async () => {
    const { db, send } = setup();
    await send(hit(view("/", "example.org")));
    await send(hit({ s: "app-store" }));
    const stored = JSON.stringify(allRows(db));
    for (const secret of [IP, UA, "iPhone", "London", "SW1A"]) assert.ok(!stored.includes(secret), `stored ${secret}`);
    const tables = db.sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
    assert.deepEqual(
      tables.map((t) => t.name),
      ["daily"],
    );
    const columns = db.sqlite.prepare("PRAGMA table_info(daily)").all();
    assert.deepEqual(
      columns.map((c) => c.name),
      ["day", "kind", "value", "count"],
    );
  });

  it("answers without setting a cookie", async () => {
    const { send } = setup();
    const res = await send(hit(view("/")));
    assert.equal(res.headers.get("set-cookie"), null);
    assert.equal(res.headers.get("cache-control"), "no-store");
  });

  it("stores the country as unknown when Cloudflare does not know it, or it is Tor", async () => {
    for (const cf of [{ country: "XX" }, { country: "T1" }, { country: "gb" }, {}, null]) {
      const { db, send } = setup();
      await send(hit(view("/"), { cf }));
      const country = allRows(db).find((row) => row.kind === "country");
      assert.equal(country.value, "unknown", JSON.stringify(cf));
    }
  });
});

describe("POST /hit: a store tap", () => {
  it("adds one to that store's total and nothing else", async () => {
    const { db, send } = setup();
    await send(hit({ s: "microsoft-store" }));
    assert.deepEqual(allRows(db), [{ day: "2026-11-13", kind: "store", value: "microsoft-store", count: 1 }]);
  });
});

describe("POST /hit: what it rejects", () => {
  const rejected = async (request, setupOptions) => {
    const { db, send } = setup(setupOptions);
    const res = await send(request);
    assert.equal(res.status, 204);
    assert.deepEqual(allRows(db), []);
  };

  it("pages that do not exist on the site", () => rejected(hit(view("/no-such-page/"))));
  it("paths with a query string", () => rejected(hit(view("/features/?utm_source=x"))));
  it("paths with an anchor", () => rejected(hit(view("/features/#pricing"))));
  it("unknown stores", () => rejected(hit({ s: "some-store" })));
  it("bodies with extra fields", () => rejected(hit({ p: "/", r: "direct", t: 1731492000 })));
  it("bodies with both a page and a store", () => rejected(hit({ p: "/", r: "direct", s: "app-store" })));
  it("bodies that are not JSON", () => rejected(hit("p=/&r=direct")));
  it("bodies over 512 bytes", () => rejected(hit(JSON.stringify(view("/")) + " ".repeat(500))));

  for (const r of [
    "https://www.google.com/search?q=secret",
    "google.com/search",
    "Google.com",
    "192.168.1.10",
    "localhost",
    "",
    7,
  ])
    it(`the referrer ${JSON.stringify(r)}`, () => rejected(hit(view("/", r))));

  it("requests from another site", () => rejected(hit(view("/"), { headers: { origin: "https://example.com" } })));
  it("requests with no origin", async () => {
    const request = hit(view("/"));
    request.headers.delete("origin");
    await rejected(request);
  });
  it("visitors with Do Not Track on", () => rejected(hit(view("/"), { headers: { dnt: "1" } })));
  it("visitors with Global Privacy Control on", () => rejected(hit(view("/"), { headers: { "sec-gpc": "1" } })));
  it("every hit while the site's page list cannot be loaded", () => rejected(hit(view("/")), { list: null }));
});

describe("POST /hit: rate limit", () => {
  it("counts at most the limit in each second, then counts again in the next", async () => {
    const { db, clock, send } = setup({ max: 2 });
    for (let i = 0; i < 3; i++) await send(hit({ s: "app-store" }));
    assert.equal(allRows(db)[0].count, 2);
    clock.now = new Date(NOW.getTime() + 1000);
    await send(hit({ s: "app-store" }));
    assert.equal(allRows(db)[0].count, 3);
  });
});

describe("GET /summary", () => {
  it("gives the last 7 complete days ending yesterday (UTC)", async () => {
    const { db, send } = setup();
    addRow(db, "2026-11-05", "page", "/", 100); // 8 days ago: outside
    addRow(db, "2026-11-06", "page", "/", 10); // first day inside
    addRow(db, "2026-11-12", "page", "/", 20); // yesterday: inside
    addRow(db, "2026-11-13", "page", "/", 1000); // today: not complete
    const res = await send(summary("?window=7"));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.window, 7);
    assert.equal(body.from, "2026-11-06");
    assert.equal(body.to, "2026-11-12");
    assert.deepEqual(body.totals.page, { rows: [{ value: "/", count: 30 }], others: null });
  });

  it("gives the last 30 complete days ending yesterday (UTC)", async () => {
    const { db, send } = setup();
    addRow(db, "2026-10-13", "page", "/", 100); // 31 days ago: outside
    addRow(db, "2026-10-14", "page", "/", 10);
    addRow(db, "2026-11-12", "page", "/", 20);
    addRow(db, "2026-11-13", "page", "/", 1000);
    const body = await (await send(summary("?window=30"))).json();
    assert.equal(body.from, "2026-10-14");
    assert.equal(body.to, "2026-11-12");
    assert.deepEqual(body.totals.page.rows, [{ value: "/", count: 30 }]);
  });

  it("groups every total below 5 into one Others line, with its total only when that is 5 or more", async () => {
    const { db, send } = setup();
    addRow(db, "2026-11-12", "page", "/", 12);
    addRow(db, "2026-11-12", "page", "/features/", 4);
    addRow(db, "2026-11-12", "page", "/de/features/", 3);
    addRow(db, "2026-11-12", "referrer", "someones-blog.example", 3);
    addRow(db, "2026-11-12", "country", "GB", 5);
    const { totals } = await (await send(summary("?window=7"))).json();
    assert.deepEqual(totals.page, { rows: [{ value: "/", count: 12 }], others: { count: 7 } });
    assert.deepEqual(totals.referrer, { rows: [], others: { count: null } });
    assert.deepEqual(totals.country, { rows: [{ value: "GB", count: 5 }], others: null });
    assert.deepEqual(totals.language, { rows: [], others: null });
    assert.deepEqual(totals.store, { rows: [], others: null });
    assert.ok(!JSON.stringify(totals).includes("someones-blog"));
    assert.ok(!JSON.stringify(totals).includes("/features/"));
  });

  it("sorts each kind by count, largest first", async () => {
    const { db, send } = setup();
    addRow(db, "2026-11-12", "store", "app-store", 6);
    addRow(db, "2026-11-12", "store", "microsoft-store", 9);
    const { totals } = await (await send(summary("?window=7"))).json();
    assert.deepEqual(
      totals.store.rows.map((row) => row.value),
      ["microsoft-store", "app-store"],
    );
  });

  it("can be read by the site, and caches for an hour", async () => {
    const { send } = setup();
    const res = await send(summary("?window=30"));
    assert.equal(res.headers.get("access-control-allow-origin"), SITE);
    assert.equal(res.headers.get("cache-control"), "public, max-age=3600");
    assert.match(res.headers.get("content-type"), /^application\/json/);
    assert.equal(res.headers.get("set-cookie"), null);
  });

  for (const query of [
    "",
    "?window=",
    "?window=1",
    "?window=14",
    "?window=31",
    "?window=365",
    "?window=07",
    "?window=7.0",
    "?window=+7",
    "?window=-7",
    "?window=7&window=30",
    "?window=7&from=2026-11-01",
    "?from=2026-11-01&to=2026-11-12",
  ])
    it(`rejects any other window: ${JSON.stringify(query)}`, async () => {
      const { send } = setup();
      const res = await send(summary(query));
      assert.equal(res.status, 400);
    });
});

describe("other requests", () => {
  it("answers 404 to anything else", async () => {
    const { send } = setup();
    assert.equal((await send(new Request(`${COUNTER}/hit`))).status, 404);
    assert.equal((await send(new Request(`${COUNTER}/`))).status, 404);
    assert.equal((await send(new Request(`${COUNTER}/summary?window=7`, { method: "POST", body: "{}" }))).status, 404);
  });
});

describe("daily clean-up", () => {
  it("deletes totals older than 13 months and keeps the rest", async () => {
    const { db, clean } = setup();
    addRow(db, "2025-10-12", "page", "/", 1); // older than 13 months before 2026-11-13
    addRow(db, "2025-10-13", "page", "/", 2); // exactly 13 months: kept
    addRow(db, "2026-11-12", "page", "/", 3);
    await clean();
    assert.deepEqual(
      allRows(db).map((row) => row.day),
      ["2025-10-13", "2026-11-12"],
    );
  });
});
