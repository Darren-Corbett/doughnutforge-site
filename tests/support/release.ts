// Which launch stages the site's data has reached (src/data/release.json), so
// layout tests check the stage the built site is in, never a guess
import { readFileSync } from "node:fs";
// @ts-expect-error: src/data/stages.ts comes with the store switch
import { reached as stageReached, type Stage } from "../../src/data/stages";
// @ts-expect-error: src/i18n/gated.ts comes with the store switch
import { gated } from "../../src/i18n/gated";
import { ui } from "./ui";

export const reached = (stage: Stage): boolean => stageReached(stage);

/** One UI string as the built site shows it now: a gated key keeps its earlier text until its stage */
export const uiNow = async (code: string, key: string): Promise<string> => {
  const stage = (gated as Record<string, Stage>)[key];
  if (!stage || reached(stage)) return ui(code, key);
  const before = JSON.parse(readFileSync(`src/i18n/before/${code}.json`, "utf8")) as Record<string, string>;
  return before[key]!;
};
