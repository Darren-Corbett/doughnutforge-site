// The public roadmap: shipped, next, then and later, and nothing else. Items not yet
// shipped are always shown as planned, with no dates. When an item ships, change
// its status here; its wording stays the same in every language. Doughnut Forge 2
// is built from roadmap-status.md in the v2 website pack, and its points are the
// short changelog, from the release notes.
import type { UiKey } from "../i18n";
import { reached } from "./stages";

export type RoadmapStatus = "shipped" | "next" | "then" | "later";

export type RoadmapItem = { status: RoadmapStatus; title: UiKey; text?: UiKey; points?: UiKey[] };

export const roadmapStatuses: RoadmapStatus[] = ["shipped", "next", "then", "later"];

// Once 3.0 is live the roadmap is roadmap.md's: one 3.0 entry (v2, approved by
// Darren 21 November 2026), 3.1 next, then 3.2 with the security review, and 4.0
// later (approved 25 November 2026, replacing the 23 November text). Until then the new format and Android ship by stage (src/data/stages.ts).
const v3 = reached("live3");

/** Anchors on single points, so other pages can link to them */
export const pointIds: Partial<Record<UiKey, string>> = { "roadmap.v32.review": "security-review" };

/** Where the audit line on the Security and Technical details pages links: the security review once it is on the roadmap */
export const securityReviewPath = v3 ? "roadmap/#security-review" : "roadmap/";

const V3: RoadmapItem = {
  status: "shipped",
  title: "roadmap.v3.title",
  points: ["roadmap.v3.android", "roadmap.v3.free", "roadmap.v3.format", "roadmap.v3.sender", "roadmap.v3.sealed", "roadmap.v3.cards", "roadmap.v3.older"],
};

const AFTER_3: RoadmapItem[] = [
  { status: "next", title: "roadmap.v31.title", points: ["roadmap.v31.messages", "roadmap.v31.rtl"] },
  { status: "then", title: "roadmap.v32.title", points: ["roadmap.v32.review"] },
  { status: "later", title: "roadmap.v4.title", points: ["roadmap.v4.cli"] },
];

const BEFORE_3: RoadmapItem[] = [
  { status: "next", title: "roadmap.small.title", text: "roadmap.small.text" },
  { status: "later", title: "roadmap.audit.title", text: "roadmap.audit.text" },
];

export const roadmap: RoadmapItem[] = [
  ...(v3 ? [V3] : []),
  ...(reached("all3") && !v3 ? [{ status: "shipped", title: "roadmap.format.title", text: "roadmap.format.text" } as const] : []),
  ...(reached("android") && !v3 ? [{ status: "shipped", title: "roadmap.android.title" } as const] : []),
  {
    status: "shipped",
    title: "roadmap.v2.title",
    text: "roadmap.v2.text",
    points: [
      "v2.notes.reset",
      "v2.notes.words",
      "v2.notes.start",
      "v2.notes.design",
      "home.v2.cancel.text",
      "v2.notes.backups",
      "v2.notes.ios",
      "v2.notes.desktop",
    ],
  },
  ...(reached("android") ? [] : [{ status: "next", title: "roadmap.android.title" } as const]),
  // The 3.0.1 maintenance items are left out on purpose (roadmap.md). The security
  // review replaces the independent security audit (Darren, 23 November 2026).
  ...(v3 ? AFTER_3 : BEFORE_3),
];
