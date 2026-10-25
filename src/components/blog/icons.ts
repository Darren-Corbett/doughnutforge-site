// Lucide icons under a different name, where Lucide's own name would put a word
// content blockers hide on sight into the page (scripts/check-blocker-names.mjs):
// Lucide adds a "lucide-<name>" class to every icon. Same artwork as Lucide's.
import { createLucideIcon } from "@lucide/astro";

/** Lucide's "badge-check", as used in the app's identity card */
export const VerifiedCheck = createLucideIcon("verified-check", [
  ["path", { d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" }],
  ["path", { d: "m16 9-5.5 5.5L8 12" }],
]);
