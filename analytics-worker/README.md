# Page counter

Anonymous daily page counts for doughnut-forge.app: a Cloudflare Worker with a D1 database. The site's public `/stats/` page shows the numbers.

## What it keeps

Daily totals only (`schema.sql`), each counted on its own:

- **page**: a path that exists on the site, such as `/de/features/`. No query string, no `#`.
- **language**: the page's language, taken from the path.
- **country**: Cloudflare's two-letter code, or `unknown`. Never a city.
- **referrer**: the referring site's domain, or `direct` or `internal`.
- **store**: taps on a store button, per store.

It never reads or stores IP addresses, the browser (user agent), full referrer addresses, times or anything that links one view to another. It sets no cookies. It skips visitors with Do Not Track or Global Privacy Control on. Request logs are off (`wrangler.toml`).

## How it works

- `POST /hit`: the site sends `{"p":"/de/features/","r":"google.com"}` for a page view or `{"s":"app-store"}` for a store tap, with `navigator.sendBeacon`. It always answers `204`. Hits are counted only from `https://doughnut-forge.app`, only for pages and stores in the live site's `count-pages.json` (kept for an hour), and at most 50 a second per Worker copy.
- `GET /summary?window=7` or `?window=30`: totals for the last 7 or 30 complete days, ending yesterday (UTC). Any other window, or any other query, gets `400`. Values below 5 are grouped into one Others line, whose total shows only when it is 5 or more (`null` means fewer than 5). Only two fixed windows exist, so totals for overlapping ranges cannot be subtracted to find small counts.
- Every day at 03:17 UTC: totals older than 13 months are deleted.

## Tests

```sh
cd analytics-worker
npm test
```

They run on Node's built-in SQLite, which takes the same SQL as D1. No Cloudflare account is needed.

## First deploy (owner, by hand)

Cloudflare Free plan: 100,000 Worker requests and 100,000 D1 rows written a day, which covers about 25,000 page views a day (each view writes 4 rows). Above that, hits fail quietly and the site is unaffected. Cost: nothing.

In the Cloudflare dashboard, leave Web Analytics, Workers Logs and Logpush off.

```sh
cd analytics-worker
npm ci
npx wrangler login
npx wrangler d1 create doughnut-forge-counts
```

Put the `database_id` it prints into `wrangler.toml` in place of the zeros, then:

```sh
npx wrangler d1 execute doughnut-forge-counts --remote --file=schema.sql
npx wrangler deploy
```

`deploy` prints the counter's address, `https://doughnut-forge-counter.doughnutforge.workers.dev`. That address goes into the site's `src/data/counter.ts`.

`npm ci` may say install scripts were skipped for `workerd`. That is fine: `workerd` is only needed to run the Worker on this Mac (`wrangler dev`), not to deploy it.

### Check it works

```sh
curl -i "https://doughnut-forge-counter.doughnutforge.workers.dev/summary?window=7"
curl -i "https://doughnut-forge-counter.doughnutforge.workers.dev/summary?window=14"
```

The first answers `200` with empty totals, the second `400`. Until the site publishes `count-pages.json`, every hit is ignored.

## Later deploys

After a change here: `npm test`, then `npx wrangler deploy`. A new page or blog post needs no deploy: the Worker reads the live page list.
