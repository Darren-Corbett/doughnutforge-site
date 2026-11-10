// scripts/check-sender-claims.mjs on small built sites of its own: no page, in
// any language, may say a sender or contact is verified, that the app verifies
// or proves who sent a file, or that a file was not tampered with. Doughnut
// Forge does not prove who sent anything. Telling people to check or compare
// the contact code is fine (in Spanish, "verifique" means "check"), and so is
// the Technical details line that says proof of who sent an item is not yet offered.
import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const root = new URL("../../", import.meta.url).pathname;
const run = promisify(execFile);

const check = async (files: Record<string, string>) => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(dist, path, ".."), { recursive: true });
    writeFileSync(join(dist, path), body);
  }
  try {
    const { stdout, stderr } = await run(process.execPath, [`${root}scripts/check-sender-claims.mjs`, "--dist", dist]);
    return { code: 0, output: stdout + stderr };
  } catch (e) {
    const err = e as { code?: number; stdout?: string; stderr?: string };
    return { code: err.code ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
};
const page = (lang: string, body: string, head = "") =>
  `<!doctype html><html lang="${lang}"><head><title>Doughnut Forge</title>${head}</head><body><main>${body}</main></body></html>`;

// The Technical details denial, as the site builds it: a bold label, then the text
const denial = (label: string, text: string, signatures: string) =>
  `<ul><li><strong>Signatures:</strong> ${signatures}</li><li><strong>${label}</strong> ${text}</li></ul>`;

test("passes on clean pages, the denial lines and telling people to check the contact code", async () => {
  const result = await check({
    "index.html": page(
      "en-GB",
      `<p>The app checks each card as you add it, but only comparing the contact code tells you it is the right person's card.</p>
       <p>“Unknown Sender Detected”: the file still opens. Ask the sender to check they chose the right contact.</p>
       <p>Not audited yet. Cryptomator was audited in 2017.</p>` +
        denial("Proof of who sent an item.", "Doughnut Forge does not yet prove who sent an item.", "Ed25519, used to sign contact cards. Proof of who sent an item is not yet offered."),
      '<meta name="description" content="Encrypt files on your own device.">',
    ),
    "es/index.html": page(
      "es-ES",
      "<p>Verifique el código de contacto con la otra persona.</p><p>Compare el código de contacto en persona.</p>" +
        denial("La prueba de quién envió un elemento.", "Doughnut Forge todavía no demuestra quién envió un elemento.", "Ed25519, que se usa para firmar las tarjetas de contacto. Todavía no se ofrece una prueba de quién envió un elemento."),
    ),
    "de/index.html": page(
      "de",
      "<p>Überprüfen Sie den Kontaktcode. Die App prüft jede Karte, wenn Sie sie hinzufügen.</p>" +
        denial("Nachweis, wer ein Element gesendet hat.", "Doughnut Forge weist noch nicht nach, wer ein Element gesendet hat.", "Ed25519, verwendet zum Signieren von Kontaktkarten. Ein Nachweis, wer ein Element gesendet hat, wird noch nicht angeboten."),
    ),
    "ja/index.html": page(
      "ja",
      "<p>連絡先コードを確認してください。</p>" +
        denial("アイテムを誰が送ったかの証明。", "Doughnut Forgeは、アイテムを誰が送ったかをまだ証明しません。", "Ed25519。連絡先カードの署名に使用されます。アイテムを誰が送ったかの証明は、まだ提供されていません。"),
    ),
    "ru/index.html": page(
      "ru",
      "<p>Проверьте код контакта вместе с собеседником.</p>" +
        denial("Подтверждение того, кто отправил элемент.", "Doughnut Forge пока не подтверждает, кто отправил элемент.", "Ed25519, для подписи карточек контакта. Подтверждение того, кто отправил элемент, пока не предлагается."),
    ),
    "zh-cn/index.html": page(
      "zh-CN",
      "<p>请与对方核对联系人代码。</p>" +
        denial("证明某项内容由谁发送。", "Doughnut Forge 目前尚不能证明某项内容由谁发送。", "Ed25519，用于对联系人卡片签名。目前尚不提供证明某项内容由谁发送的功能。"),
    ),
    "th/index.html": page(
      "th",
      denial("การพิสูจน์ว่าใครเป็นผู้ส่งรายการ", "Doughnut Forge ยังไม่ได้พิสูจน์ว่าใครเป็นผู้ส่งรายการ", "Ed25519 ใช้สำหรับลงนามนามบัตร การพิสูจน์ว่าใครเป็นผู้ส่งรายการยังไม่มีให้ใช้"),
    ),
  });
  expect(result.output).toContain("check-sender-claims: 7 pages in 7 languages");
  expect(result.code).toBe(0);
});

for (const [what, lang, body, words] of [
  ["English: verified sender", "en-GB", "<p>Every file shows a verified sender.</p>", "verified"],
  ["English: Verified Identity", "en-US", "<h2>Verified Identity</h2>", "Verified"],
  ["English: the app verifies who sent it", "en-GB", "<p>When a file arrives, the app verifies who sent it.</p>", "verifies"],
  ["English: has not been tampered with", "en-GB", "<p>The app shows the file has not been tampered with.</p>", "tampered"],
  ["English: tamper-proof", "en-GB", "<p>Your files are tamper-proof.</p>", "tamper"],
  // The app's own translations of "Verified Links" (contacts.verifiedLinks), with "contact"
  ["German: verified contact", "de", "<p>Verifizierter Kontakt</p>", "Verifizierter"],
  ["Spanish: verified contact", "es-ES", "<p>Contacto verificado</p>", "verificado"],
  ["Mexican Spanish: verified contacts", "es-MX", "<p>Contactos verificados</p>", "verificados"],
  ["Japanese: verified contact", "ja", "<p>検証済みの連絡先</p>", "検証済み"],
  ["Russian: verified contact", "ru", "<p>Проверенный контакт</p>", "Проверенный"],
  ["Chinese (Simplified): verified contact", "zh-CN", "<p>已验证的联系人</p>", "已验证"],
  ["French: verified contact", "fr", "<p>Contact vérifié</p>", "vérifié"],
  ["Korean: verified contact", "ko", "<p>확인된 연락처</p>", "확인된"],
  ["Spanish: the app verifies who sent it", "es-ES", "<p>La app verifica quién envió el archivo.</p>", "verifica"],
  ["German: not tampered with", "de", "<p>Die Datei wurde nicht manipuliert.</p>", "manipuliert"],
  ["Japanese: tampering", "ja", "<p>ファイルの改ざんを検出します。</p>", "改ざん"],
] as const) {
  test(`fails on ${what}`, async () => {
    const result = await check({ "index.html": page(lang, body) });
    expect(result.code).not.toBe(0);
    expect(result.output).toContain("index.html");
    expect(result.output).toContain(words);
  });
}

test("fails when the claim is only in an image's alt text", async () => {
  const result = await check({ "features/index.html": page("en-GB", '<img src="/a.png" alt="A verified contact in the app">') });
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("features/index.html");
  expect(result.output).toContain("verified");
});

test("fails when the claim is only in the meta description", async () => {
  const result = await check({ "de/index.html": page("de", "<p>Dateien verschlüsseln.</p>", '<meta name="description" content="Verifizierte Absender, auf Ihrem Gerät.">') });
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("Verifizierte");
});

test("fails on a page in a language it has no patterns for", async () => {
  const result = await check({ "xx/index.html": page("xx", "<p>Hello</p>") });
  expect(result.code).not.toBe(0);
  expect(result.output).toContain("xx");
});

// The v1 app's guide sentences, in all 30 languages, that the Features page
// showed until 9 November 2026: they say the app verifies who someone is, verifies
// trusted contacts and confirms their true identity. Each must fail on its own.
const v1 = JSON.parse(readFileSync(`${root}tests/fixtures/v1-identity-claims.json`, "utf8")).sentences as Record<string, string[]>;
const htmlLang: Record<string, string> = { en: "en-GB", es: "es-ES" };
for (const [lang, sentences] of Object.entries(v1)) {
  test(`fails on each of the v1 identity claims in ${lang}`, async () => {
    const files = Object.fromEntries(sentences.map((s, i) => [`${lang}/claim-${i + 1}/index.html`, page(htmlLang[lang] ?? lang, `<p>${s}</p>`)]));
    const result = await check(files);
    expect(result.code).not.toBe(0);
    for (const file of Object.keys(files)) expect(result.output).toContain(file);
  });
}
