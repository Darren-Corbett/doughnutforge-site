// The public roadmap: shipped, next and later, and nothing else. Items not yet
// shipped are always shown as planned, with no dates. When an item ships, change
// its status here; its wording stays the same in every language. Doughnut Forge 2
// is built from roadmap-status.md in the v2 website pack, and its points are the
// short changelog, from the release notes.
import type { UiKey } from "../i18n";
import { reached } from "./stages";

export type RoadmapStatus = "shipped" | "next" | "later";

export type RoadmapItem = { status: RoadmapStatus; title: UiKey; text?: UiKey; points?: UiKey[] };

export const roadmapStatuses: RoadmapStatus[] = ["shipped", "next", "later"];

// 3.0 is live once every store on sale sells it and Android is on sale. Then the
// roadmap is roadmap.md's (v2, approved by Darren 21 November 2026): one 3.0
// entry, and what comes next, in order. Until then the new format and Android
// ship by stage (src/data/stages.ts).
const v3 = reached("all3") && reached("android");

/** Whether the next items are shown in their order ("Next, in this order") */
export const nextInOrder = v3;

const V3: RoadmapItem = {
  status: "shipped",
  title: "roadmap.v3.title",
  points: ["roadmap.v3.android", "roadmap.v3.free", "roadmap.v3.format", "roadmap.v3.sender", "roadmap.v3.sealed", "roadmap.v3.cards", "roadmap.v3.older"],
};

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
  // The 3.0.1 maintenance items are left out on purpose (roadmap.md)
  ...(v3
    ? ([
        { status: "next", title: "roadmap.cli.title" },
        { status: "next", title: "roadmap.rtl.title" },
      ] as const)
    : [{ status: "next", title: "roadmap.small.title", text: "roadmap.small.text" } as const]),
  { status: "later", title: "roadmap.audit.title", text: "roadmap.audit.text" },
];
