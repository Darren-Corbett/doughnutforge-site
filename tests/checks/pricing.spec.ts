// From 3.0.0 the iPhone, iPad and Android apps are free to download, with one
// in-app purchase, paid once, that unlocks encrypting files, photos and videos;
// Mac and Windows stay a one-time purchase (owner, 20 November 2026). Each
// platform switches when its own store sells 3.0, and the reference prices
// (src/data/prices.ts) switch with it.
import { expect, test } from "@playwright/test";
import { pricingSplit } from "../../src/data/pricing";
import { pricesFor } from "../../src/data/prices";

type Status = "available" | "coming";
const list = (status: Record<string, Status>) => Object.entries(status).map(([id, s]) => ({ id, status: s }));
const today = list({ ios: "available", android: "coming", mac: "available", windows: "available" });
const androidOnSale = list({ ios: "available", android: "available", mac: "available", windows: "available" });

test("before any phone store sells 3.0, every platform on sale is a one-time purchase", () => {
  expect(pricingSplit(today, [])).toEqual({ free: [], paid: ["ios", "mac", "windows"] });
});

test("a computer store with 3.0 stays a one-time purchase", () => {
  expect(pricingSplit(today, ["mac", "windows"])).toEqual({ free: [], paid: ["ios", "mac", "windows"] });
});

test("iPhone and iPad are free once the App Store sells 3.0; a platform still coming is in neither list", () => {
  expect(pricingSplit(today, ["ios"])).toEqual({ free: ["ios"], paid: ["mac", "windows"] });
});

test("Android on sale with 3.0 is free while iPhone and iPad wait for theirs", () => {
  expect(pricingSplit(androidOnSale, ["android"])).toEqual({ free: ["android"], paid: ["ios", "mac", "windows"] });
  expect(pricingSplit(androidOnSale, ["ios", "android", "mac", "windows"])).toEqual({ free: ["ios", "android"], paid: ["mac", "windows"] });
});

test("the old mobile prices go exactly when each phone store sells 3.0", () => {
  const unlock = [{ amount: 0, inAppPurchase: { name: "Encrypt files", amount: 3.99 } }];
  const before = pricesFor([]);
  expect(before.ios).toEqual([
    { amount: 2.99, until: "2026-12-11" },
    { amount: 3.99, from: "2026-12-11" },
  ]);
  expect(before.android).toEqual([{ amount: 3.99 }]);
  expect(pricesFor(["ios"]).ios).toEqual(unlock);
  expect(pricesFor(["ios"]).android).toEqual([{ amount: 3.99 }]);
  expect(pricesFor(["android"]).android).toEqual(unlock);
  for (const stores of [[], ["ios", "android", "mac", "windows"]]) {
    expect(pricesFor(stores).mac, "Mac never changes").toEqual([{ amount: 4.99 }]);
    expect(pricesFor(stores).windows, "Windows never changes").toEqual([{ amount: 4.99 }]);
  }
});
