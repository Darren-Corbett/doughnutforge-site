// The public roadmap: shipped, next and later, and nothing else. Items not yet
// shipped are always shown as planned, with no dates. When an item ships, change
// its status here; its wording stays the same in every language.
import type { UiKey } from "../i18n";

export type RoadmapStatus = "shipped" | "next" | "later";

export type RoadmapItem = { status: RoadmapStatus; title: UiKey; text?: UiKey };

export const roadmapStatuses: RoadmapStatus[] = ["shipped", "next", "later"];

export const roadmap: RoadmapItem[] = [
  { status: "shipped", title: "roadmap.identity.title", text: "roadmap.identity.text" },
  // Shipped once the Windows package is live in the Microsoft Store
  { status: "next", title: "roadmap.identityWindows.title", text: "roadmap.identityWindows.text" },
  { status: "next", title: "roadmap.stricter.title", text: "roadmap.stricter.text" },
  { status: "next", title: "roadmap.android.title" },
  { status: "later", title: "roadmap.audit.title", text: "roadmap.audit.text" },
];
