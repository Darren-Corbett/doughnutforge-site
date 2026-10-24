// Measurements taken inside the page. `installMeasures` runs in the page as an
// init script and puts every measurement on window.__measure, so they can share
// helpers. Call them with `measure(page, "wideElements")`.
import type { Page } from "@playwright/test";

export type Box = { selector: string; left: number; right: number; width: number; text: string };

export function installMeasures() {
  const name = (e: Element) => {
    const id = e.id ? `#${CSS.escape(e.id)}` : "";
    const cls = [...e.classList]
      .filter((c) => !c.includes(":") && !c.startsWith("astro-"))
      .slice(0, 3)
      .map((c) => `.${CSS.escape(c)}`)
      .join("");
    return `${e.tagName.toLowerCase()}${id}${cls}`;
  };
  const path = (e: Element) => {
    const parts: string[] = [];
    for (let n: Element | null = e; n && n !== document.body && parts.length < 4; n = n.parentElement) parts.unshift(name(n));
    return parts.join(" > ");
  };
  /** Hidden from sight: display none, invisible, screen-reader-only (sr-only, max-sm:sr-only ...), or closed <details> content */
  const hidden = (e: Element) => {
    const details = e.closest("details:not([open])");
    if (details && !e.closest("summary")) return true;
    for (let n: Element | null = e; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === "none" || s.visibility === "hidden") return true;
      const tiny = parseFloat(s.width) <= 1 || parseFloat(s.height) <= 1;
      if (s.position === "absolute" && (tiny || s.getPropertyValue("clip") !== "auto" || s.clipPath === "inset(50%)")) return true;
    }
    return false;
  };
  /** Inside a parent that clips or scrolls sideways, so it cannot widen the page */
  const clipped = (e: Element) => {
    for (let n = e.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement)
      if (getComputedStyle(n).overflowX !== "visible") return true;
    return false;
  };
  const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 40)));

  const measures = {
    /**
     * Elements that reach past the left or right edge of the viewport: only the
     * element where the overflow starts, not each of its children.
     */
    wideElements(): Box[] {
      const vw = document.documentElement.clientWidth;
      const over = (e: Element) => {
        const b = e.getBoundingClientRect();
        return b.width > 0 && b.height > 0 && (b.right > vw + 1 || b.left < -1);
      };
      const out: Box[] = [];
      for (const e of document.body.querySelectorAll("*")) {
        if (!over(e) || hidden(e) || clipped(e)) continue;
        const parent = e.parentElement;
        if (parent && parent !== document.body && over(parent) && !hidden(parent)) continue;
        const b = e.getBoundingClientRect();
        out.push({ selector: path(e), left: Math.round(b.left), right: Math.round(b.right), width: Math.round(b.width), text: (e.textContent ?? "").trim().slice(0, 60) });
      }
      return out;
    },

    /** How far the page can move sideways: scroll width, and where a scroll to the far right ends up */
    sidewaysScroll() {
      const before = { x: scrollX, y: scrollY };
      scrollTo(99999, scrollY);
      const result = {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        innerWidth,
        scrollX,
        visualLeft: visualViewport?.offsetLeft ?? 0,
        visualWidth: visualViewport?.width ?? innerWidth,
        scale: visualViewport?.scale ?? 1,
      };
      scrollTo(before.x, before.y);
      return result;
    },

    /** The header's nav links: how many rows they take, and the space left on the widest row */
    navRows() {
      const items = [...document.querySelectorAll<HTMLElement>("header nav li")];
      const tops = new Set(items.map((li) => Math.round(li.getBoundingClientRect().top)));
      const ul = document.querySelector("header nav ul")!.getBoundingClientRect();
      const used = items.reduce((sum, li) => sum + li.getBoundingClientRect().width, 0);
      return { rows: tops.size, labels: items.map((li) => li.textContent!.trim()), spare: Math.round(ul.width - used), headerHeight: Math.round(document.querySelector("header")!.getBoundingClientRect().height) };
    },

    /** Scroll down the whole page in steps so lazy images start loading */
    async scrollThrough() {
      const step = Math.max(200, innerHeight * 0.8);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        scrollTo(0, y);
        await frame();
      }
      scrollTo(0, 0);
    },

    /** Images that are shown but did not load: each unloaded one is scrolled into view and given 4 seconds */
    async brokenImages() {
      const shown = [...document.images].filter((i) => !hidden(i));
      for (const i of shown) {
        if (i.complete && i.naturalWidth > 0) continue;
        i.scrollIntoView({ block: "center" });
        await Promise.race([
          new Promise((r) => {
            i.addEventListener("load", r, { once: true });
            i.addEventListener("error", r, { once: true });
          }),
          new Promise((r) => setTimeout(r, 4000)),
        ]);
      }
      scrollTo(0, 0);
      return shown
        .filter((i) => !i.complete || i.naturalWidth === 0 || i.getBoundingClientRect().width === 0)
        .map((i) => ({ src: i.getAttribute("src") ?? "", current: i.currentSrc, alt: i.alt, width: Math.round(i.getBoundingClientRect().width), complete: i.complete, natural: i.naturalWidth }));
    },

    /** Text that does not fit its box: a word wider than its column, or text a box cuts off. Visible text elements only. */
    overflowingText() {
      const out: { selector: string; scrollWidth: number; clientWidth: number; text: string; clips: boolean }[] = [];
      for (const e of document.body.querySelectorAll<HTMLElement>("h1,h2,h3,h4,p,li,a,button,summary,span,dt,dd,td,th,label")) {
        if (hidden(e) || e.closest("[aria-hidden=true]")) continue;
        if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) continue;
        const s = getComputedStyle(e);
        if (s.display === "inline") continue;
        if (e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1)
          out.push({ selector: path(e), scrollWidth: e.scrollWidth, clientWidth: e.clientWidth, text: e.textContent!.trim().slice(0, 60), clips: s.overflowX !== "visible" });
      }
      return out;
    },

    /** Links and buttons that cover each other (not parent and child) by more than 2px each way */
    overlappingControls() {
      const controls = [...document.querySelectorAll<HTMLElement>("a[href], button, summary")].filter((e) => {
        if (hidden(e)) return false;
        const b = e.getBoundingClientRect();
        return b.width > 0 && b.height > 0;
      });
      const label = (e: HTMLElement) => `${e.tagName.toLowerCase()} "${(e.textContent || e.getAttribute("aria-label") || e.querySelector("img")?.alt || "").trim().slice(0, 30)}"`;
      const out: { a: string; b: string; overlap: number }[] = [];
      // A link that wraps onto two lines has one box per line: compare those, not
      // the rectangle round both lines
      const boxes = controls.map((e) => [...e.getClientRects()].filter((r) => r.width > 0 && r.height > 0));
      for (let i = 0; i < controls.length; i++) {
        for (let j = i + 1; j < controls.length; j++) {
          if (controls[i]!.contains(controls[j]!) || controls[j]!.contains(controls[i]!)) continue;
          let overlap = 0;
          for (const a of boxes[i]!)
            for (const b of boxes[j]!) {
              const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
              const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (w > 2 && h > 2) overlap += w * h;
            }
          if (overlap) out.push({ a: label(controls[i]!), b: label(controls[j]!), overlap: Math.round(overlap) });
        }
      }
      return out;
    },

    /** Each main section's box width and its widest text block, for the section-width table */
    sectionWidths() {
      return [...document.querySelectorAll<HTMLElement>("main section, main article")]
        .filter((s) => !s.parentElement?.closest("section"))
        .map((s) => {
          const label = s.getAttribute("aria-labelledby");
          const heading = (label && document.getElementById(label)?.textContent) || s.querySelector("h1,h2")?.textContent || s.className;
          const inner = [...s.querySelectorAll<HTMLElement>(":scope > *")].map((e) => e.getBoundingClientRect().width);
          const text = [...s.querySelectorAll<HTMLElement>("p, h1, h2, h3")].filter((e) => !hidden(e)).map((e) => e.getBoundingClientRect().width);
          return { section: (heading ?? "").trim().slice(0, 50), box: Math.round(s.getBoundingClientRect().width), content: Math.round(Math.max(0, ...inner)), widestText: Math.round(Math.max(0, ...text)) };
        });
    },
  };
  (window as unknown as { __measure: typeof measures }).__measure = measures;
  return measures;
}

type Measures = ReturnType<typeof installMeasures>;

/** Run one measurement in the page (installMeasures must be added as an init script first) */
export const measure = <K extends keyof Measures>(page: Page, key: K) =>
  page.evaluate((k) => (window as unknown as { __measure: Record<string, () => unknown> }).__measure[k]!(), key) as Promise<Awaited<ReturnType<Measures[K]>>>;
