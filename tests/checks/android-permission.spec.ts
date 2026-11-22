// The Android internet permission (android-permission.md v1, 21 November 2026):
// Darren's Pixel test picks version A or B. Both lines are ready behind one switch
// (src/data/android-permission.ts); until he picks, the Technical details page
// holds the [PENDING-ANDROID-PERMISSION] marker, so no build that shows Android
// can go out saying anything about its permissions.
import { expect, test } from "@playwright/test";
import { androidPermission, androidPermissionLine } from "../../src/data/android-permission";
import en from "../../src/i18n/ui/en";

test("until Darren picks, the line is the pending marker", () => {
  expect(androidPermission).toBeNull();
  expect(androidPermissionLine(null)).toBe("[PENDING-ANDROID-PERMISSION]");
});

test("each version shows its own line, in android-permission.md's words", () => {
  expect(androidPermissionLine("A")).toBe("technical.network.androidA");
  expect(androidPermissionLine("B")).toBe("technical.network.androidB");
  expect(en["technical.network.androidA"]).toBe(
    "On Android, Doughnut Forge has no permission to use the internet, so Android itself stops it from connecting. Google Play's own app handles the purchase.",
  );
  expect(en["technical.network.androidB"]).toBe(
    "On Android, Google Play's purchase library needs the permission to use the internet. Doughnut Forge's own code never connects: your files, keys and contacts never leave your phone.",
  );
});

test("the network paragraph and tile no longer carry the Android marker themselves", () => {
  for (const key of ["technical.network.none", "technical.glance.network"] as const) expect(en[key]).not.toContain("PENDING-ANDROID-PERMISSION");
});
