// The public roadmap: shipped, next and later, and nothing else. Items not yet
// shipped are always shown as planned, with no dates. When an item ships, change
// its status here; its wording stays the same in every language.
import type { UiKey } from "../i18n";

export type RoadmapStatus = "shipped" | "next" | "later";

export type RoadmapItem = { status: RoadmapStatus; title: UiKey; text?: UiKey };

export const roadmapStatuses: RoadmapStatus[] = ["shipped", "next", "later"];

export const roadmap: RoadmapItem[] = [
  // Shipped once 0.4.44 is live in every store (Mac, Windows, iPhone and iPad)
  { status: "next", title: "roadmap.identity.title", text: "roadmap.identity.text" },
  { status: "next", title: "roadmap.stricter.title", text: "roadmap.stricter.text" },
  { status: "next", title: "roadmap.android.title" },
  { status: "later", title: "roadmap.audit.title", text: "roadmap.audit.text" },
];
