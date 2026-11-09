// No page may claim more than the app does. Doughnut Forge signs contact cards
// but does not prove who sent a file, so no built page, in any language, may:
// - say a sender or contact is "verified", or name a "Verified Identity";
// - say the app verifies or proves who sent a file;
// - say a file was not tampered with, is tamper-proof, or that the app detects tampering.
// It reads what visitors and search engines see: the visible text, alt and
// title text, and the meta descriptions.
//
// Each language has a small table aimed at those claim shapes: the participle
// "verified" (never the verb "verify", which often just means "check", as in
// Spanish "verifique el código"), "tamper" words, and a "proves" verb in the
// same block of text as "who sent". Telling people to check or compare the
// contact code is fine. A page in a language with no table fails, so a new
// language cannot slip through unchecked.
//
//   node scripts/check-sender-claims.mjs [--dist <dir>]
import { readdirSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";

const root = new URL("..", import.meta.url).pathname;
const dist = (parseArgs({ options: { dist: { type: "string" } } }).values.dist ?? `${root}dist`).replace(/\/?$/, "/");

// A whole word or phrase: no letter or digit just before or after. "\w" stands
// for any letter, in every script.
const W = ({ raw: [s] }) => `(?<![\\p{L}\\p{M}\\p{N}])(?:${s.replaceAll("\\w", "[\\p{L}\\p{M}]")})(?![\\p{L}\\p{M}\\p{N}])`;

// verified: the participle, anywhere. tamper: tamper words, anywhere.
// proves + sender: both in one block of text (a paragraph, list item, heading).
// notYet: a block with it is a denial, as on Technical details ("Doughnut Forge
// does not yet prove who sent an item"), and is not a "proves" claim.
const LANGS = {
  en: { verified: W`verified`, tamper: W`tamper\w*`, proves: W`verifies|proves|confirms|authenticates`, sender: W`who sent|senders?`, notYet: W`not yet` },
  fr: { verified: W`vérifiée?s?`, tamper: W`falsifi\w*|infalsifiable|inviolable|altérée?s?`, proves: W`prouve|vérifie|confirme|authentifie|garantit`, sender: W`qui a envoyé|expéditeur\w*`, notYet: W`pas encore` },
  // "überprüft" is also "checks", so only the inflected "überprüfter" etc.
  de: { verified: W`verifiziert\w*|überprüfte[nrs]?|geprüfte[nrs]?`, tamper: W`manipul\w*|fälschungssicher\w*`, proves: W`beweist|weist|verifiziert|bestätigt|belegt|garantiert`, sender: `${W`wer`}.{0,40}${W`gesendet|geschickt|verschickt`}|${W`absender\w*`}`, notYet: W`noch nicht` },
  es: { verified: W`verificad[oa]s?`, tamper: W`manipulad[oa]s?|manipulaci\w*|alterad[oa]s?|inviolable`, proves: W`verifica|demuestra|comprueba|confirma|garantiza`, sender: W`quién (?:lo |la )?(?:envió|ha enviado)|remitente\w*`, notYet: W`todavía no|aún no` },
  it: { verified: W`verificat[oaie]`, tamper: W`manomess\w*|manomission\w*|manipolat\w*|alterat[oaie]`, proves: W`dimostra|verifica|conferma|attesta|garantisce`, sender: W`chi ha inviato|mittent[ei]`, notYet: `${W`non`}.{0,30}${W`ancora`}` },
  pt: { verified: W`verificad[oa]s?`, tamper: W`adulterad[oa]s?|adultera\w*|violad[oa]s?|inviolável|manipulad[oa]s?`, proves: W`verifica|comprova|confirma|demonstra|prova|garante`, sender: W`quem enviou|remetente\w*`, notYet: W`ainda não` },
  nl: { verified: W`geverifieerd\w*`, tamper: W`geknoeid|knoei\w*|gemanipuleerd\w*|manipulatie\w*`, proves: W`bewijst|verifieert|bevestigt|garandeert`, sender: `${W`wie`}.{0,40}${W`verstuurd|verzonden|gestuurd`}|${W`afzender\w*`}`, notYet: W`nog niet` },
  sv: { verified: W`verifiera[dt]\w*`, tamper: W`manipul\w*`, proves: W`bevisar|verifierar|bekräftar|garanterar`, sender: W`vem som (?:har )?skicka\w*|avsändare\w*`, notYet: W`ännu inte|inte ännu` },
  // The app says "Bekræftet" (confirmed) for "Verified"
  da: { verified: W`verificere[dt]\w*|bekræfte[dt]\w*`, tamper: W`manipul\w*|forfalsk\w*`, proves: W`beviser|verificerer|bekræfter|garanterer`, sender: W`hvem der (?:har )?sendt|afsender\w*`, notYet: W`endnu ikke|ikke endnu` },
  // The app says "Bekreftet" (confirmed) for "Verified"
  no: { verified: W`verifisert\w*|bekreftet|bekreftede`, tamper: W`manipul\w*|forfalsk\w*`, proves: W`beviser|verifiserer|bekrefter|garanterer`, sender: W`hvem som (?:har )?sendte?|avsender\w*`, notYet: W`ennå ikke|ikke ennå` },
  // The app says "Vahvistettu" (confirmed) for "Verified"; participles only, not
  // "vahvistetaan" ("Vahvistetaan sormenjälkeä...", the app's "Verifying fingerprint...")
  fi: { verified: W`vahvistett\w*|vahvistetu\w*`, tamper: W`peukaloi\w*|peukalo\w*|väärenn\w*|manipul\w*`, proves: W`todistaa|vahvistaa|varmentaa|takaa`, sender: `${W`kuka`}.{0,30}${W`lähetti`}|${W`lähettäjä\w*`}`, notYet: W`vielä` },
  pl: { verified: W`z?weryfikowan\w*`, tamper: W`manipul\w*|sfałszowan\w*`, proves: W`dowodzi|udowadnia|weryfikuje|potwierdza|gwarantuje`, sender: `${W`kto`}.{0,20}${W`wysłał\w*`}|${W`nadawc\w*`}`, notYet: W`jeszcze` },
  cs: { verified: W`ověřen\w*`, tamper: W`manipul\w*|zfalšov\w*|pozměněn\w*`, proves: W`prokazuje|ověřuje|potvrzuje|zaručuje`, sender: `${W`kdo`}.{0,30}${W`odeslal\w*`}|${W`odesílatel\w*`}`, notYet: W`zatím|ještě ne\w*` },
  // The app says "Ellenőrizve" (checked) for "Verified"; "ellenőrizze" (check) is not matched
  hu: { verified: W`ellenőrzött\w*|ellenőrizve|hitelesített\w*`, tamper: W`manipul\w*|(?:meg)?hamisít\w*`, proves: W`igazolja|bizonyítja|hitelesíti|garantálja`, sender: W`ki küldött\w*|feladó\w*`, notYet: W`még nem` },
  // "verificare" (checking, as in "update check") is not matched
  ro: { verified: W`verificat(?:ă|e|i|ul|a)?`, tamper: W`falsific\w*|manipul\w*|alterat\w*`, proves: W`dovedește|verifică|confirmă|garantează|atestă`, sender: W`cine a trimis|expeditor\w*`, notYet: `${W`nu`}.{0,30}${W`încă`}|${W`încă nu`}` },
  // The app says "Проверено" (checked) for "Verified". Participles only: "проверьте"
  // (check) and the noun "подтверждение" (proof, in the denial) are not matched.
  ru: { verified: W`верифицирован\w*|проверенн\w*|проверен[аоы]?|подтвержд[её]нн\w*|подтвержд[её]н[аоы]?`, tamper: W`поддел\w*|фальсифи\w*`, proves: W`подтверждает|доказывает|удостоверяет|верифицирует|гарантирует`, sender: `${W`кто`}.{0,20}${W`отправил\w*`}|${W`отправител\w*`}`, notYet: W`пока не|ещё не|еще не` },
  // As Russian: participles only, never the noun "підтвердження" (in the denial)
  uk: { verified: W`верифікован\w*|перевірен(?:[аеіо]|ий|ого|ому|им|их)?|підтверджен(?:[аеіо]|ий|ого|ому|им|их)?`, tamper: W`підроб\w*|фальсифік\w*`, proves: W`підтверджує|доводить|засвідчує|верифікує|гарантує`, sender: `${W`хто`}.{0,20}${W`надіслав\w*`}|${W`відправник\w*`}`, notYet: W`поки що не|поки не|ще не` },
  el: { verified: W`επαληθευμέν\w*|επαληθεύτηκε|επιβεβαιωμέν\w*|πιστοποιημέν\w*`, tamper: W`παραποι\w*|παραποί\w*|αλλοιω\w*|αλλοίω\w*`, proves: W`αποδεικνύει|επαληθεύει|επιβεβαιώνει|πιστοποιεί|εγγυάται`, sender: W`ποιος έστειλε|αποστολέ\w*`, notYet: `${W`δεν`}.{0,40}${W`ακόμη|ακόμα`}` },
  tr: { verified: W`doğrulanmış\w*|doğrulandı\w*|doğrulanan\w*`, tamper: W`kurcala\w*|tahrif\w*`, proves: W`kanıtlar|kanıtlıyor|doğrular|doğruluyor|garanti eder`, sender: W`kimin gönderdiğ\w*|gönderen\w*`, notYet: W`henüz` },
  // Japanese, Chinese and Thai have no spaces between words, so no W`` here.
  // Chinese "经过验证" alone also means "authenticated" (Technical details), so only before a person.
  // "確認してください" (please check) is not matched.
  ja: { verified: "検証済み|認証済み|確認済み", tamper: "改ざん|改竄|耐タンパ|タンパー", proves: "(?:証明|検証|確認|保証)(?:します|している|する|でき)", sender: "誰が送|送信者|送り主|差出人", notYet: "まだ" },
  "zh-CN": { verified: "已验证|已认证|已核实|验证过的|经过验证的(?:联系人|发送者|发件人|身份)", tamper: "篡改", proves: "证明|验证|核实", sender: "由谁发送|谁发送|谁发的|发送者|发件人|发送人", notYet: "尚不|尚未|还不|还没|暂不" },
  "zh-TW": { verified: "已驗證|已認證|已核實|驗證過的|經過驗證的(?:聯絡人|傳送者|寄件者|身分|身份)", tamper: "竄改|篡改", proves: "證明|驗證|核實", sender: "由誰傳送|誰傳送|誰發送|寄件者|傳送者|發送者", notYet: "尚不|尚未|還不|還沒|暫不" },
  // The app says "확인됨" / "확인된" (confirmed) for "Verified"; "확인하세요" (check) is not matched
  ko: { verified: "검증된|검증됨|인증된|인증됨|확인된|확인됨", tamper: "변조|위조", proves: "증명합니다|증명해 줍니다|검증합니다|확인해 줍니다|보장합니다", sender: "누가 보냈|보낸 사람|발신자|송신자", notYet: "아직" },
  // "सत्यापित" is both "verified" and, before "करें" and the like, "verify" (check)
  hi: { verified: "(?:सत्यापित|प्रमाणित)(?!\\s*कर)", tamper: "छेड़छाड़|छेड़-छाड़", proves: "(?:साबित|प्रमाणित|सत्यापित|पुष्टि) करता", sender: "किसने भेज|प्रेषक|भेजने वाले", notYet: "अभी" },
  id: { verified: W`terverifikasi|diverifikasi`, tamper: W`diutak-atik|utak-atik|dimanipulasi|manipulasi|dipalsukan|pemalsuan`, proves: W`membuktikan|memverifikasi|mengonfirmasi|menjamin`, sender: W`siapa yang mengirim\w*|pengirim\w*`, notYet: W`belum` },
  // The app says "Disahkan" for "Verified", but alone it also means "authenticated"
  // (Technical details: "kandungan dan pengepala item disahkan"), so only after a person
  ms: { verified: W`terverifikasi|ditentusahkan|(?:kenalan|pengirim|penghantar|identiti) (?:yang )?(?:telah )?disahkan`, tamper: W`diusik|dimanipulasi|manipulasi|dipalsukan|pemalsuan`, proves: W`membuktikan|mengesahkan|menjamin`, sender: W`siapa yang menghantar\w*|penghantar\w*|pengirim\w*`, notYet: W`belum` },
  // "ยืนยัน" (confirm) alone is not matched, only "confirmed" forms, and not
  // "ได้รับการยืนยันความถูกต้อง" ("authenticated", Technical details). "ได้รับการตรวจสอบ"
  // is "audited" (the not-yet-audited line), so "ตรวจสอบ" forms are left out.
  th: { verified: "ยืนยันแล้ว|ผ่านการยืนยัน|ได้รับการยืนยัน(?!ความถูกต้อง)", tamper: "ปลอมแปลง|งัดแงะ", proves: "พิสูจน์|ยืนยัน", sender: "ใครเป็นผู้ส่ง|ใครส่ง|ผู้ส่ง", notYet: "ยังไม่" },
  // "hãy xác minh" (check) is not matched, only "đã / được xác minh" (verified).
  // "được xác thực" is "authenticated" (Technical details), so only after a person.
  vi: { verified: W`(?:đã|được) (?:xác minh|kiểm chứng)|(?:liên hệ|người gửi|danh tính) (?:đã )?(?:được )?xác thực`, tamper: W`giả mạo|bị can thiệp|bị sửa đổi`, proves: W`chứng minh|xác minh|xác thực|đảm bảo`, sender: W`ai đã gửi|người gửi`, notYet: W`chưa` },
};
const compiled = Object.fromEntries(
  Object.entries(LANGS).map(([lang, p]) => [lang, Object.fromEntries(Object.entries(p).map(([k, s]) => [k, new RegExp(s.normalize("NFC"), "iu")]))]),
);
const tableFor = (lang) => compiled[lang] ?? compiled[lang.split("-")[0]];

// Block elements end a block of text; inline ones (links, bold) do not
const BLOCK = /<\/?(?:p|li|h[1-6]|td|th|dt|dd|div|section|article|header|footer|nav|main|aside|blockquote|figcaption|caption|title|summary|ul|ol|table|tr|br|label|button|option)\b[^>]*>/gi;
const ENTITY = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) =>
  s.replace(/&(?:#x([0-9a-f]+)|#(\d+)|(\w+));/gi, (m, hex, dec, name) => (hex ? String.fromCodePoint(parseInt(hex, 16)) : dec ? String.fromCodePoint(+dec) : (ENTITY[name] ?? m)));

/** What visitors and search engines read on a page, as blocks of text */
const blocksOf = (html) => {
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

const hits = (re, s) => [...s.matchAll(new RegExp(re, "giu"))].map((m) => m[0]);
const problems = [];
const langs = new Set();
let pages = 0;
for (const file of readdirSync(dist, { recursive: true }).map(String).filter((f) => f.endsWith(".html")).sort()) {
  const html = readFileSync(`${dist}${file}`, "utf8");
  const lang = /<html\b[^>]*\slang="([^"]+)"/i.exec(html)?.[1] ?? "en";
  pages++;
  langs.add(lang);
  const own = tableFor(lang);
  if (!own) {
    problems.push(`${file}: no patterns for language "${lang}"; add it to LANGS in scripts/check-sender-claims.mjs`);
    continue;
  }
  // English too, for any English word left on a translated page
  const tables = own === compiled.en ? [own] : [own, compiled.en];
  for (const block of blocksOf(html)) {
    const words = new Set();
    for (const t of tables) {
      for (const w of [...hits(t.verified, block), ...hits(t.tamper, block)]) words.add(w);
      const proves = hits(t.proves, block);
      if (proves.length && t.sender.test(block) && !t.notYet.test(block)) for (const w of proves) words.add(w);
    }
    if (words.size) problems.push(`${file}: "${[...words].join('", "')}" in "${block.length > 160 ? `${block.slice(0, 157)}...` : block}"`);
  }
}

if (problems.length) {
  console.error(`check-sender-claims: Doughnut Forge does not prove who sent a file. Reword these:\n  ${problems.slice(0, 60).join("\n  ")}`);
  process.exit(1);
}
console.log(`check-sender-claims: ${pages} pages in ${langs.size} languages, no claim that a sender is verified or a file was not tampered with`);
