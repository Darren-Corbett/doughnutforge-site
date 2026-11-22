// What visitors and search engines read on a built page, as blocks of text: the
// visible text split at block elements, plus alt and title text and the meta
// descriptions. Shared by the build checks that read words.

// Block elements end a block of text; inline ones (links, bold) do not
const BLOCK = /<\/?(?:p|li|h[1-6]|td|th|dt|dd|div|section|article|header|footer|nav|main|aside|blockquote|figcaption|caption|title|summary|ul|ol|table|tr|br|label|button|option)\b[^>]*>/gi;
const ENTITY = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) =>
  s.replace(/&(?:#x([0-9a-f]+)|#(\d+)|(\w+));/gi, (m, hex, dec, name) => (hex ? String.fromCodePoint(parseInt(hex, 16)) : dec ? String.fromCodePoint(+dec) : (ENTITY[name] ?? m)));

/** What visitors and search engines read on a page, as blocks of text */
export const blocksOf = (html) => {
  // Line-break markup (src/middleware.ts) may sit inside a word; it is removed first
  html = html.replace(/<wbr>/g, "").replace(/<span class="keep-word">([^<]*)<\/span>/g, "$1");
  const attrs = [
    ...[...html.matchAll(/<(?:img|area)\b[^>]*\salt="([^"]*)"/gi)].map((m) => m[1]),
    ...[...html.matchAll(/\stitle="([^"]*)"/gi)].map((m) => m[1]),
    ...[...html.matchAll(/<meta\s[^>]*(?:name|property)="(?:description|og:description|twitter:description)"[^>]*>/gi)].map((m) => /content="([^"]*)"/.exec(m[0])?.[1] ?? ""),
  ];
  const text = html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(BLOCK, "\n").replace(/<[^>]+>/g, " ");
  return [...text.split("\n"), ...attrs].map((b) => decode(b).normalize("NFC").replace(/\s+/g, " ").trim()).filter(Boolean);
};

/** The language of a built page, from its html element */
export const langOf = (html) => /<html\b[^>]*\slang="([^"]+)"/i.exec(html)?.[1] ?? "en";
