// The pages and stores that may be counted, read from the live site
// (count-pages.json, written by the site's build), so a new page is counted
// without deploying the Worker again.

const KEEP_MS = 60 * 60 * 1000;
const RETRY_MS = 60 * 1000;

const isPageList = (body) =>
  typeof body?.pages === "object" &&
  body.pages !== null &&
  !Array.isArray(body.pages) &&
  Object.entries(body.pages).every(([path, lang]) => path.startsWith("/") && typeof lang === "string") &&
  Array.isArray(body.stores) &&
  body.stores.every((store) => typeof store === "string");

async function load(url, fetch) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const body = await res.json();
    return isPageList(body) ? body : null;
  } catch {
    return null;
  }
}

/**
 * The list is kept for an hour. If a load fails, the last good list stays, and
 * the next try waits a minute. Until a load works, get() gives null.
 */
export function pageList({ url, fetch, now = Date.now }) {
  let list = null;
  let nextLoad = -Infinity;
  return {
    async get() {
      if (now() >= nextLoad) {
        const loaded = await load(url, fetch);
        if (loaded) list = loaded;
        nextLoad = now() + (loaded ? KEEP_MS : RETRY_MS);
      }
      return list;
    },
  };
}
