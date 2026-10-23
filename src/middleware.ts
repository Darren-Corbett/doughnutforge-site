// Words are never broken across lines, in any language (CLAUDE.md). CSS can stop
// hyphenation, but browsers still break a line after a hyphen inside a word
// ("24-" / "word"). So in the visible text of every page, each word with a hyphen
// in it is wrapped in <span class="keep-word"> (white-space: nowrap, global.css).
// The hyphen stays a real hyphen, so copied text and search match the word.
//
// Left alone: the <head> (titles, descriptions, structured data), tags and their
// attributes (link addresses), scripts and styles, and anything that looks like a
// domain or address, such as doughnut-forge.app, which may break at its dots.
import { defineMiddleware } from "astro:middleware";

const HYPHEN_IN_WORD = /[\p{L}\p{N}]-[\p{L}\p{N}]/u;
const LOOKS_LIKE_ADDRESS = /[./@:]\p{L}/u;

const keepWords = (text: string) =>
  text.replace(/[^\s<>]+/g, (token) =>
    HYPHEN_IN_WORD.test(token) && !LOOKS_LIKE_ADDRESS.test(token) ? `<span class="keep-word">${token}</span>` : token,
  );

export const keepHyphenatedWords = (html: string) => {
  const start = html.indexOf("<body");
  if (start === -1) return html;
  const body = html
    .slice(start)
    // Odd parts are tags, scripts and styles; even parts are text
    .split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]*>)/)
    .map((part, i) => (i % 2 ? part : keepWords(part)))
    .join("");
  return html.slice(0, start) + body;
};

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(keepHyphenatedWords(await response.text()), { status: response.status, headers });
});
