// Reference only: pages never show amounts. Pages say "one-time purchase, never
// a subscription" and the stores show the local price. Kept here so a price
// change is recorded in one place.
export const prices = {
  currency: "USD",
  mac: [{ amount: 4.99 }],
  windows: [{ amount: 4.99 }],
  ios: [
    { amount: 2.99, until: "2026-12-11" },
    { amount: 3.99, from: "2026-12-11" },
  ],
  // Owner, 14 November 2026: no launch price
  android: [{ amount: 3.99 }],
} as const;
