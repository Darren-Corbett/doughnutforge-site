// scripts/asset-names.mjs: the file name of an asset the build emits must not
// depend on the order the build happened to see its sources in. Identical files
// (en.svg and en-US.svg store badges, say) become one asset, which was named
// after whichever came first, so two builds of the same commit could differ and
// the content build ID (scripts/build-id.mjs) would change for nothing.
import { expect, test } from "@playwright/test";

const { assetFileNames } = await import(new URL("../../scripts/asset-names.mjs", import.meta.url).href).catch(() => ({
  assetFileNames: undefined as unknown as (info: { names?: string[]; name?: string }) => string,
}));

test("an asset made from identical files gets the same name whatever order they came in", () => {
  expect(assetFileNames, "scripts/asset-names.mjs").toBeDefined();
  const a = assetFileNames({ names: ["es.svg", "es-MX.svg"] });
  const b = assetFileNames({ names: ["es-MX.svg", "es.svg"] });
  expect(a).toBe(b);
  expect(a).toBe("_astro/es-MX.[hash][extname]");
});

test("other assets keep Astro's usual names", () => {
  expect(assetFileNames, "scripts/asset-names.mjs").toBeDefined();
  expect(assetFileNames({ names: ["Base.css"] })).toBe("_astro/Base.[hash][extname]");
  expect(assetFileNames({ name: "app-icon.png" })).toBe("_astro/app-icon.[hash][extname]");
});
