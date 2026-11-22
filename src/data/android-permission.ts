// The Android internet permission (android-permission.md v1, 21 November 2026).
// 3.0.0 sells file encryption on Android through Google Play's purchase library,
// which normally needs the permission to use the internet. Darren's Pixel test
// on the release candidate decides:
//   A  the purchase works without it: the app has no internet permission at all
//   B  the purchase needs it: Google Play's library uses it; the app's own code never connects
// null until he picks. The Technical details page then shows the pending marker
// in place of the line, so no build that shows Android can go out with either.
import type { UiKey } from "../i18n";

export type AndroidPermission = "A" | "B";

export const androidPermission: AndroidPermission | null = null;

/** The Android line under the network paragraph, or the pending marker until Darren picks */
export const androidPermissionLine = (choice: AndroidPermission | null = androidPermission): UiKey | "[PENDING-ANDROID-PERMISSION]" =>
  choice ? `technical.network.android${choice}` : "[PENDING-ANDROID-PERMISSION]";
