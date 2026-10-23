// Words are never broken across lines, in any language (CLAUDE.md). Two fixes
// are made to the visible text of every page, after it is built:
//
// 1. Words with a hyphen, and short domain names. CSS can stop hyphenation, but
//    browsers still break a line after a hyphen inside a word ("24-" / "word") or
//    at the dot of a name such as tally.so. So each is wrapped in
//    <span class="keep-word"> (white-space: nowrap, global.css).
//    Only the word itself is wrapped: Japanese, Chinese and Thai do not put spaces
//    between words, so "Wi-Fi" inside a Japanese sentence must not take the whole
//    sentence with it. The hyphen stays a real hyphen, so copied text and search
//    match the word.
//
// 2. Japanese and Chinese. Browsers break these lines between any two characters,
//    which splits words. Each text is cut into words here (Intl.Segmenter) and a
//    <wbr> is put between them; global.css sets word-break: keep-all for these
//    languages, so lines break only at the <wbr>s, in every browser, with no script.
//    No <wbr> goes before closing punctuation or after opening punctuation, so
//    no line starts with "。" or ends with "「".
//
// 3. Long words in big headings. Each big heading gets --longest, the width of
//    its longest unbreakable word in average letters, so global.css can shrink a
//    heading such as "Datenschutzerklärung" just enough to fit a phone screen.
//
// 4. Korean words that carry punctuation, such as "사무국(ICO)" or "Inc.의", are
//    kept on one line so a particle never starts a line on its own.
//
// Left alone: the <head> (titles, descriptions, structured data), tags and their
// attributes (link addresses), scripts and styles, and web and email addresses,
// which may break at their dots and slashes.
import { defineMiddleware } from "astro:middleware";

// Letters and numbers of scripts that put spaces between words
const SPACED = String.raw`[[\p{L}\p{N}]--[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}]]`;
// What must stay on one line:
//   - a short domain name, such as tally.so or doughnut-forge.app
//   - a word with a hyphen in it, such as post-quantum
//   - a word that starts with a hyphen straight after other markup, as in
//     "<code>.vlt2</code>-Dateien", where the browser would break after the hyphen
const KEEP = new RegExp(
  [
    String.raw`[A-Za-z0-9]+(?:[.\-][A-Za-z0-9]+)*\.[A-Za-z]{2,}`,
    `${SPACED}+(?:-${SPACED}+)+`,
    `(?<![\\p{L}\\p{N}\\-])-${SPACED}+(?:-${SPACED}+)*`,
  ].join("|"),
  "gv",
);
// Web and email addresses are left free to break at their dots and slashes
const LOOKS_LIKE_URL = /[/@]/;
const SHORT = 30;

const keepWords = (text: string) =>
  text.replace(/[^\s<>]+/g, (token) =>
    LOOKS_LIKE_URL.test(token)
      ? token
      : token.replace(KEEP, (word) => (word.length <= SHORT ? `<span class="keep-word">${word}</span>` : word)),
  );

const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
// Punctuation a line must not start with, and must not end with
const CLOSING = /^[、。，．・：；？！ー」』）】〕〉》”’ゝゞ々…‥,.:;?!)\]}%]/u;
const OPENING = /[「『（【〔〈《“‘([{]$/u;

const wordBreaks = (lang: string) => {
  const segmenter = new Intl.Segmenter(lang, { granularity: "word" });
  return (text: string) => {
    if (!CJK.test(text)) return text;
    let out = "";
    let previous = "";
    for (const { segment } of segmenter.segment(text)) {
      const boundary = previous && (CJK.test(previous.at(-1)!) || CJK.test(segment[0]!));
      if (boundary && !CLOSING.test(segment) && !OPENING.test(previous) && !/\s$/.test(previous) && !/^\s/.test(segment)) {
        out += "<wbr>";
      }
      out += segment;
      previous = segment;
    }
    return out;
  };
};

// Japanese, Chinese and Korean letters are about 1em wide; the average letter
// the CSS assumes is 0.64em
const WIDE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const graphemes = new Intl.Segmenter("en", { granularity: "grapheme" });
const widthOf = (word: string) => [...graphemes.segment(word)].reduce((w, g) => w + (WIDE.test(g.segment) ? 1.6 : 1), 0);

const decode = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, "x");

/** The width of the longest piece of text that cannot be broken across lines */
const longestWord = (html: string, lang: string) => {
  // In Japanese and Chinese the pieces are the words between the <wbr>s
  const pieces = /^(ja|zh)\b/.test(lang) ? html.split(/<wbr>|\s+/) : decode(html).split(/\s+/);
  return Math.max(0, ...pieces.map((p) => widthOf(decode(p))));
};

// Big headings: h1 to h3, and the classes global.css sizes the same way
const BIG = /<(h[1-3])\b([^>]*)>([\s\S]*?)<\/\1>|<(p|span|div)\b([^>]*\bclass="[^"]*\b(?:tagline|statement|row-name)\b[^"]*"[^>]*)>([\s\S]*?)<\/\4>/g;

const measureHeadings = (html: string, lang: string) =>
  html.replace(BIG, (_element, h, hAttrs, hText, tag, attrs, text) => {
    const name = h ?? tag;
    const attributes: string = hAttrs ?? attrs;
    const inner: string = hText ?? text;
    const longest = `--longest:${Math.ceil(longestWord(inner, lang))}`;
    const withStyle = /\sstyle="/.test(attributes)
      ? attributes.replace(/\sstyle="([^"]*)"/, (_, css: string) => ` style="${css.replace(/;?\s*$/, ";")}${longest}"`)
      : `${attributes} style="${longest}"`;
    return `<${name}${withStyle}>${inner}</${name}>`;
  });

// Korean breaks only at spaces (keep-all), but browsers still break around
// brackets and dots inside a spaced word, which strands a particle: "관리자)" / "에".
// Korean words with such punctuation are kept on one line if they are short enough
// to fit a phone (26 average letters, as measured for headings below).
const HANGUL = /\p{Script=Hangul}/u;
const keepKoreanWords = (text: string) =>
  text.replace(/[^\s<>]+/g, (token) =>
    HANGUL.test(token) && /[^\p{L}\p{N}]/u.test(token) && !token.includes("&") && widthOf(token) <= 26
      ? `<span class="keep-word">${token}</span>`
      : keepWords(token),
  );

export const fixLineBreaks = (html: string) => {
  const start = html.indexOf("<body");
  if (start === -1) return html;
  const lang = /<html[^>]*\slang="([^"]+)"/.exec(html)?.[1] ?? "en";
  const cjk = /^(ja|zh)\b/.test(lang) ? wordBreaks(lang) : null;
  const korean = /^ko\b/.test(lang);
  const body = html
    .slice(start)
    // Odd parts are tags, scripts and styles; even parts are text
    .split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]*>)/)
    .map((part, i) => (i % 2 ? part : korean ? keepKoreanWords(part) : keepWords(cjk ? cjk(part) : part)))
    .join("");
  return html.slice(0, start) + measureHeadings(body, lang);
};

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(fixLineBreaks(await response.text()), { status: response.status, headers });
});
