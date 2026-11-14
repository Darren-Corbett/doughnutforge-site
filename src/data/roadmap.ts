// The public roadmap: shipped, next and later, and nothing else. Items not yet
// shipped are always shown as planned, with no dates. When an item ships, change
// its status here; its wording stays the same in every language. Doughnut Forge 2
// is built from roadmap-status.md in the v2 website pack, and its points are the
// short changelog, from the release notes.
import type { UiKey } from "../i18n";

export type RoadmapStatus = "shipped" | "next" | "later";

export type RoadmapItem = { status: RoadmapStatus; title: UiKey; text?: UiKey; points?: UiKey[] };

export const roadmapStatuses: RoadmapStatus[] = ["shipped", "next", "later"];

export const roadmap: RoadmapItem[] = [
  { status: "shipped", title: "roadmap.format.title", text: "roadmap.format.text" },
  { status: "shipped", title: "roadmap.android.title" },
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
  { status: "next", title: "roadmap.small.title", text: "roadmap.small.text" },
  { status: "later", title: "roadmap.audit.title", text: "roadmap.audit.text" },
];
