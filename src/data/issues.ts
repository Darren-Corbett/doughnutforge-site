// The labelled forge-privacy issues the Answered questions and Known issues
// pages are built from: src/data/issues.json (written by scripts/fetch-issues.mjs),
// or ISSUES_FILE for a local test build (tests/fixtures/issues.json).
import { readFileSync } from "node:fs";
import committed from "./issues.json";

export type Issue = { number: number; slug: string; title: string; question: string; answer: string; url: string };
export type IssueList = "answered" | "known";

export const issues = (process.env.ISSUES_FILE ? JSON.parse(readFileSync(process.env.ISSUES_FILE, "utf8")) : committed) as Record<IssueList, Issue[]>;

/** Each list's path under the language folder, and the keys of its strings */
export const issueLists: Record<IssueList, { path: string; key: "answered" | "known" }> = {
  answered: { path: "support/answered/", key: "answered" },
  known: { path: "support/known-issues/", key: "known" },
};

/** The lists with something in them: an empty list has no page and no link */
export const shownLists = (Object.keys(issueLists) as IssueList[]).filter((l) => issues[l].length > 0);

/** The paragraphs of a question or answer */
export const paragraphs = (text: string) => text.split(/\n{2,}/).filter(Boolean);
