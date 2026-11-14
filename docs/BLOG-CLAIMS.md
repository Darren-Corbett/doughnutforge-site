# Claims tables: Phase 4 draft posts

App sources are paths in `~/git/doughnut-forge` (app 0.4.42, `a036397`). "Store" means the en-GB fastlane listing (`fastlane/metadata/{mac,ios}/en-GB/`). External pages were checked live on 23 October 2026.

## Post 1: How to encrypt files on a Mac without using the cloud
`src/content/blog/en/encrypt-files-on-mac-without-cloud.mdx`, phrase "encrypt files on Mac without cloud"

| # | Claim in the post | Source |
|---|---|---|
| 1.1 | Doughnut Forge encrypts single files, whole folders and text on your Mac | Mac store `description.txt` ("locks your files, folders and text on your computer"); `secure-directory.json:29, 33` |
| 1.2 | It needs no account and works entirely on your computer, even without an internet connection | Mac store `description.txt`, second paragraph |
| 1.3 | It runs on macOS 12 Monterey or later | `src-tauri/tauri.conf.json` (macOS minimum 12.0); site `download.requires.mac` |
| 1.4 | On setup you choose a password that must be rated Strong | `src/components/lock-screen/unlock-create-password.tsx:47, 50`; `common.json:105` ("Strong") |
| 1.5 | Creating an identity shows a 24-word backup phrase | `identity.json:16` |
| 1.6 | The password cannot be reset | `mobile-views.json:118` |
| 1.7 | Losing both password and backup phrase means the identity and encrypted files cannot be recovered | `mobile-guides.json:25` |
| 1.8 | Your password and keys are never stored on a server | `mobile-guides.json:10` |
| 1.9 | Steps: Secure Directory, Add Folder, the item's ⋮ button or right-click, Encrypt File, "Who can open this?" with Just Me preselected, Encrypt Selection | `app.json:7`; `secure-directory.json:8, 13, 35, 37, 42`; `use-seal-enclave.ts:40-41`; `inner-directory.tsx:282, 437` |
| 1.10 | You can select contacts instead, to share | `secure-directory.json:36` ("Select Contacts") |
| 1.11 | A new `.vlt2` file appears in the same folder | `src-tauri/src/crypto/v2/writer.rs:286-290` |
| 1.12 | The original file is kept | `use-seal-enclave.ts:33` (`shredOriginal` defaults to false); the delete toggle is hidden behind `enableDayTwoFunctionality`, which is off (`seal-enclave-modal/index.tsx:237`, `theme-slice.ts:14`) |
| 1.13 | To open: the file's ⋮ button or right-click, Decrypt & Extract, Save Location, Decrypt File | `secure-directory.json:11, 51, 59` |
| 1.17 | The file menu opens from the ⋮ button or by right-clicking | confirmed by the owner in the current Mac build, 23 October 2026; the menu items are in `inner-directory.tsx:250-302` |
| 1.14 | Each file is locked on its own, so no password travels with it | files are encrypted for identities only: `src-tauri/src/commands/vault.rs:340`, `writer.rs:161-181` |
| 1.15 | You can choose exactly who can open each file | `secure-directory.json:35-37` |
| 1.16 | One-time purchase on each platform, never a subscription | site `home.pricing.*` |
| E1.0 | Disk Utility is in the Utilities folder of your Mac | Apple, [Intro to Disk Utility on Mac](https://support.apple.com/guide/disk-utility/intro-to-disk-utility-dskutl1029/mac) ("Disk Utility is located in the /Applications/Utilities folder.") |
| E1.1 | Disk Utility: File > New Image > Blank Image; name, size, APFS; Encryption menu; enter and re-enter a password, Choose; keep the other settings, Save | Apple Support, [Create a disk image using Disk Utility](https://support.apple.com/guide/disk-utility/create-a-disk-image-dskutl11888/mac) |
| E1.2 | If you forget the disk image password you cannot open it or see its files | same page ("WARNING: If you forget this password…") |
| E1.3 | Open the image, copy files in, eject when done | same page (the image mounts for files to be copied in; eject when finished) |
| E1.4 | FileVault protects the startup disk so data needs the login password | Apple Support, [Protect data on your Mac with FileVault](https://support.apple.com/guide/mac-help/protect-data-on-your-mac-with-filevault-mh11785/mac); Disk Utility page ("protect the contents of the system disk, turn on FileVault") |
| R1.1 | *Reasoning:* a copy on a USB stick or in an email is outside FileVault's protection | follows from E1.4 (FileVault covers the startup disk) |
| R1.2 | *Reasoning:* sharing a disk image means passing its password on | follows from E1.1 |

Not claimed: the "Delete Original File" toggle (hidden behind a feature flag that is off); drag and drop (the app has none).

## Post 2: Offline file encryption: how it works and what it protects
`src/content/blog/en/offline-encryption-privacy.mdx`, phrase "offline file encryption" (retitled 29 October 2026; first published as "Why offline encryption keeps your files private", phrase "offline encryption")

| # | Claim in the post | Source |
|---|---|---|
| 2.1 | Doughnut Forge encrypts files on your device | `mobile-views.json:41`; store `description.txt` |
| 2.2 | You can keep the locked file on your device, in cloud storage, or send it however you like; only the chosen people can open it | `mobile-guides.json:37`; store ("However you send them, only they can open them.") |
| 2.3 | iPhone screenshot: files are encrypted and decrypted on the device, nothing is uploaded | `mobile-views.json:41`; screenshot `fastlane/screenshots/ios/en-GB/iphone_01_secure_file.png`; App Store lookup `itunes.apple.com/lookup?id=6821344597` (iPhone and iPad app, live 27 October 2026) |
| 2.4 | Losing both password and 24-word backup phrase means identity and files cannot be recovered; no server copy | `mobile-guides.json:25`; `identity.json:16`; `mobile-guides.json:10` |
| 2.5 | No account, no servers, no tracking; works entirely on your device, even without an internet connection | store `description.txt`, second paragraph |
| 2.6 | Password and keys are never stored on a server or sent across the network | `mobile-guides.json:10` |
| 2.7 | It has a written backup phrase you control | `identity.json:16, 74` |
| 2.8 | This website has no analytics, cookies or tracking scripts | site `faq.data.a`; CLAUDE.md rule; privacy policy section 2 |
| E2.1 | Cloud providers typically manage the encryption keys, which "does not prevent cloud providers from accessing the data" | ICO, [Encryption scenarios](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/security/encryption/encryption-scenarios/) |
| E2.2 | With your own encryption, "the cloud provider only stores the ciphertext and has no access to the encryption keys or the original data" | same page |
| E2.3 | "You could encrypt the data yourself before you upload it", as long as you do not also store the key in the same cloud storage system | same page ("you could encrypt the data yourself before you upload it"; "provided you don’t also store the key in the same cloud storage system"; checked live 29 October 2026, wording matched to the page) |
| E2.4 | Loss of an unencrypted USB stick holding a case file led to enforcement action | same page (CPS enforcement notice) |
| R2.1 | *Reasoning:* if a service holds the key, someone with your stolen account password may be able to open the file | follows from E2.1 |
| R2.2 | *Reasoning:* an email provider or messaging app carrying a locked file cannot see inside; a lost USB stick gives a file that cannot be opened | follows from E2.2 |
| R2.0 | *Reasoning:* often the bigger risk is a readable file somewhere you do not control, not broken encryption | general reasoning, consistent with E2.1 and E2.4 |
| R2.3 | *Reasoning:* the three limits (an unlocked file, lost keys, a compromised device) | general reasoning, no external fact |

Not claimed: that the app cannot connect to the internet (the Mac app has the `network.client` permission; app backlog item 7).

## Post 3: What quantum-safe encryption means, in plain language
`src/content/blog/en/quantum-safe-encryption-explained.mdx`, phrase "quantum-safe encryption"

| # | Claim in the post | Source |
|---|---|---|
| 3.1 | Doughnut Forge is designed to resist attacks by future quantum computers, using NIST-standardised post-quantum algorithms alongside classical ones (owner-approved phrase, 14 November 2026; replaces "what you protect today stays protected", a promise no one can keep) | `docs/TECH-SPEC.md` "Key exchange (post-quantum hybrid)": X25519 (classical) with ML-KEM-768 (NIST FIPS 203); site `faq.quantum.a` |
| 3.2 | It uses a hybrid: the key to each file, folder or note is protected with a long-trusted method and a post-quantum one, and both are needed to open it | `src-tauri/src/crypto/key_slot.rs:20-62` (both secrets combined with SHA-256). No algorithm names, as instructed. |
| 3.3 | This applies to every person a file is encrypted for, including you | `src-tauri/src/crypto/v2/writer.rs:161` (every recipient key slot goes through `key_slot.rs`; the sender is always a recipient) |
| E3.1 | "Most traditional public key cryptography (PKC) algorithms in use today will be vulnerable to attack" | NCSC, [Next steps in preparing for post-quantum cryptography](https://www.ncsc.gov.uk/whitepaper/next-steps-preparing-for-post-quantum-cryptography) (v2.0, 14 August 2024) |
| E3.2 | Symmetric cryptography "is not significantly impacted"; AES with keys of at least 128 bits can continue to be used | same page |
| E3.3 | Today's quantum computers are still limited; when one able to do this will exist is "hard to predict", because "many engineering and physical challenges must be overcome first" | same page ("quantum computers today are still limited") |
| E3.4 | In theory, quantum computers can do certain calculations that are not feasible for ordinary computers | same page ("capable of performing certain computations that would not be feasible for classical computers") |
| E3.5 | The risk of "an attacker collecting and storing data today and decrypting it at some point in the future" | same page |
| E3.6 | Such an attack is "only likely to be worthwhile for very high-value information" | same page |
| E3.7 | A hybrid combines post-quantum and traditional methods | same page (PQ/T hybrid definition) |
| E3.8 | On 13 August 2024, NIST published its first three finalised post-quantum standards: one for general encryption and two for digital signatures | NIST, [first 3 finalized post-quantum encryption standards](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards) |
| E3.9 | NIST encourages starting the move now "because full integration will take time" | same page |
| R3.1 | *Reasoning:* the two-locks explanation and analogy (including "this kind is fast and very strong"), "quantum-safe" and "post-quantum" meaning the same thing, that public-key encryption relies on certain problems being hard, that a hybrid means both methods would have to be broken, and the advice to look for plain claims | general explanation, consistent with E3.1, E3.2 and E3.7 |

Not claimed: that signatures are post-quantum (they are not); "quantum-proof" or "unbreakable" (the word appears only as a warning to readers); any date for quantum computers; the in-app "Hybrid Post-Quantum" label (it sits in a file-details panel that nothing in the app opens, `openInspector` is never called).

## Post 4: How to share encrypted files with someone you trust
`src/content/blog/en/share-encrypted-files.mdx`, phrase "share encrypted files"

| # | Claim in the post | Source |
|---|---|---|
| 4.1 | Creating an identity makes a private key that stays on the device, and a 24-word backup phrase | `identity.json:16`; `mobile-guides.json:63` ("Your private keys and master password never leave your device") |
| 4.2 | Keep the backup phrase safe and never share it | `mobile-guides.json:25` |
| 4.3 | The contact card is a `.vltc2` file; on the Identity screen choose Share Identity, then Share Card or Save File | `identity.json:59`; `share-identity.json:3, 10, 13`; `export-identity-modal.tsx:87-88` |
| 4.4 | The card shows a public name you choose | `share-identity.json:8, 18` |
| 4.5 | The card is safe to share; it lets people encrypt files for you but cannot open anything sent to you | `share-identity.json:21`; `mobile-views.json:121-122` |
| 4.6 | Contacts, Add Contact, pick the card file; several at once | `contacts.json:9`; `share-identity.json:24-26`; `add-contact-modal.tsx:66-70`; Mac `release_notes.txt` |
| 4.7 | The app checks each card as you add it; only comparing the contact code tells you it is the right person's card (reworded 9 November 2026: "has not been tampered with" overstated the check) | `src-tauri/src/engine/contact.rs:213-214` (as recorded at launch; the app repo was not read tonight); v2 `TECH-SPEC-PUBLIC.md` (contact cards are signed; the app does not prove who sent an item); row 4.8 |
| 4.8 | Each contact has a short contact code; compare it with the code on the person's own Identity screen, in person or on a call | Mac `release_notes.txt`; `contact_code.rs:3-5`; `contacts.json:94-97` |
| 4.9 | Only add cards received directly; a card that does not match an existing contact is refused | `mobile-views.json:177`; `contact.rs:68-71`; `errors.json:66` |
| 4.10 | "Who can open this?": select one or several contacts; you are always included too | `secure-directory.json:35-37`; `writer.rs:161` (`let mut recipients = vec![Contact::from_keys(&my_keys)]`) |
| 4.11 | On a computer the locked `.vlt2` file appears next to the original; in the iPhone and iPad app the share sheet opens | `writer.rs:286-290`; `mobile_vault.rs:87-88`; `secure-file.json:24`; App Store lookup `itunes.apple.com/lookup?id=6821344597` (iPhone and iPad app, live 27 October 2026) |
| 4.12 | The locked file does not show who can open it; only those it was encrypted for can unlock it | Mac `release_notes.txt` ("Encrypted files now keep the sender and the recipients private."); `writer.rs` (key slots name nobody); `errors.json:21-22` |
| 4.13 | Send it any way (email, messaging app, cloud folder, USB stick); only the chosen people can open it | store ("However you send them, only they can open them"); `mobile-guides.json:37`; site `faq.share.a` |
| 4.14 | The recipient decrypts with their own identity; no file password | store ("They open them with their own identity"); `vault.rs:340` (no file passwords exist) |
| 4.15 | "Access Denied": not encrypted for this identity, or changed since it was encrypted | `errors.json:21-22` |
| 4.16 | "Unknown Sender Detected": the file still opens, but the app cannot match the sender to one of your contacts | `secure-directory.json:60`; `reader.rs:181-182` |
| 4.17 | Folders encrypted on a computer cannot be opened on iPhone, iPad or Android | `mobile_vault.rs:135, 162`; Android: `~/Desktop/review/android-live/app-answers.md` (Android launch: package, §3 files and text, no folders); `src/data/stores.ts` (android available) |
| 4.18 | Losing the backup phrase and password means files sent to you cannot be opened | `mobile-guides.json:25`; `mobile-views.json:126` |
| 4.19 | Screenshots of the Identity and Contacts screens are from the iPhone app | `fastlane/screenshots/ios/en-GB/iphone_05_identity.png`, `iphone_03_contacts.png`; App Store lookup `itunes.apple.com/lookup?id=6821344597` (iPhone and iPad app, live 27 October 2026) |
| R4.1 | *Reasoning:* the usual advice to send a password separately, and why that is fragile | general advice, no external fact |

Not claimed: QR codes; pasting a contact ID; that the app shows who sent a file; password-only sharing; that a Mac-made file opens on Windows (no test found).

## Comparison posts (published 29 October 2026)

`src/content/blog/en/doughnut-forge-vs-cryptomator.mdx` (published 29 October 2026; phrase "Cryptomator alternative", secondary "encrypt files for cloud storage") and `src/content/blog/en/doughnut-forge-vs-veracrypt.mdx` (published 29 October 2026; phrase "VeraCrypt alternative", secondary "encrypted drive or encrypted files"). The owner approved this table on 29 October 2026 and both posts are live (`draft: false`). Every vendor quote was checked word for word on its live page on 29 October 2026. Independent sources: none used; vendor pages cover every row.

**Re-checked 2 November 2026 (owner's request, before the posts stay in the sitemap):** every Cryptomator row (C1 to C18) and VeraCrypt row (V1 to V12) still matches its source page. Two notes: the Cure53 PDF (C15) is titled "Pentest-Report Tresor Application Crypto" (an app by 1&1), and its scope lists the four Cryptomator crypto libraries, so the claim stands; Cryptomator's pricing page now lists Android full access as a one-time purchase (€29.99) while its Android docs still mention a yearly subscription or a lifetime licence, so C6 still says only "a paid upgrade". The Doughnut Forge rows (D1 to D10) were not re-checked. In the Cryptomator post, "You want to pay once. It is a one-time purchase on each platform, never a subscription." became "You want a one-time purchase on each platform. It is never a subscription." (owner's wording, 2 November 2026; CLAUDE.md bans "pay once").

Rules for both posts (owner): no logos; product names as plain words only; never say or imply the recipient can be sure who sent a file; the year next to every "audited"; no Linux for Doughnut Forge; no "we", no contractions.

### Cryptomator

| # | Claim in the post | Source (vendor) | Checked | Status |
|---|---|---|---|---|
| C1 | Desktop app for Windows, macOS and Linux | [docs: Desktop setup](https://docs.cryptomator.org/desktop/setup/) ("currently available for Windows, macOS, and Linux") | 2026-10-29 | verified |
| C2 | Apps for iPhone and Android | [docs: iOS setup](https://docs.cryptomator.org/ios/setup/), [docs: Android setup](https://docs.cryptomator.org/android/setup/) | 2026-10-29 | verified |
| C3 | On a Mac it recommends installing macFUSE or FUSE-T | [docs: Desktop setup](https://docs.cryptomator.org/desktop/setup/) | 2026-10-29 | verified |
| C4 | Free on desktop | [Pricing](https://cryptomator.org/pricing/) ("absolutely free to use on the desktop") | 2026-10-29 | verified |
| C5 | On iPhone, reading is free; writing needs a one-time in-app purchase | [Pricing](https://cryptomator.org/pricing/) ("read-only mode indefinitely"; "A one-time in-app purchase … will grant you write access") | 2026-10-29 | verified |
| C6 | On Android, write access is a paid upgrade (the model is not stated: the pricing page says one-time, the Android docs mention a subscription and a lifetime licence) | [Pricing](https://cryptomator.org/pricing/); [docs: Android setup](https://docs.cryptomator.org/android/setup/) | 2026-10-29 | verified |
| C7 | Open source, under GPLv3 (or a commercial licence) | [GitHub README](https://github.com/cryptomator/cryptomator) ("dual-licensed under the GPLv3") | 2026-10-29 | verified |
| C8 | No account needed | [cryptomator.org](https://cryptomator.org/) ("no registration") | 2026-10-29 | verified |
| C9 | A vault opens with its password; a recovery key can reset the password; no one else can reset it | [docs: Password and recovery key](https://docs.cryptomator.org/desktop/password-and-recovery-key/) ("We cannot reset the password of a vault for you in any way") | 2026-10-29 | verified |
| C10 | File names are encrypted and the folder structure is hidden | [GitHub README](https://github.com/cryptomator/cryptomator) ("File names get encrypted"; "Folder structure gets obfuscated") | 2026-10-29 | verified |
| C11 | Timestamps, the number of files and folders, and file sizes are not encrypted | [docs: Security target](https://docs.cryptomator.org/security/security-target/) | 2026-10-29 | verified |
| C12 | Built for cloud storage: Dropbox, Google Drive, OneDrive and any service that syncs a local folder | [GitHub README](https://github.com/cryptomator/cryptomator) ("any other cloud storage service which synchronizes with a local directory") | 2026-10-29 | verified |
| C13 | Protecting files on the computer itself is not its focus; it points to full-disk encryption for that | [docs: Security target](https://docs.cryptomator.org/security/security-target/) ("Protection of the files on the local computer is not the focus of Cryptomator") | 2026-10-29 | verified |
| C14 | To share a vault, share it with people you trust and pass the password safely; for teams, Cryptomator Hub unlocks vaults with each person's own account | [docs: Best practices](https://docs.cryptomator.org/security/best-practices/) | 2026-10-29 | verified |
| C16 | Keep the recovery key as safe as the password | [docs: Password and recovery key](https://docs.cryptomator.org/desktop/password-and-recovery-key/) ("Keep it as safe as your password") | 2026-10-29 | verified |
| C17 | An unlocked vault is a drive you work in like a USB stick | [GitHub README](https://github.com/cryptomator/cryptomator) ("Just work on the virtual drive as if it were a USB flash drive"); [docs: Accessing vaults](https://docs.cryptomator.org/desktop/accessing-vaults/) ("the virtual drive") | 2026-10-29 | verified |
| C15 | Its encryption libraries were audited by Cure53 in 2017 | [Cure53 report, 27 November 2017](https://cryptomator.org/audits/2017-11-27%20crypto%20cure53.pdf) | 2026-10-29 | verified |
| C18 | Cryptomator encrypts on your own device | [GitHub README](https://github.com/cryptomator/cryptomator) ("Secure client-side encryption for your cloud storage") | 2026-10-29 | verified |
| RC1 | *Reasoning:* the two do different jobs and do not compete for the same one; the "fits" lines in "In short" | follows from C12, C17, D5, D6 ("Two different jobs") | 2026-10-29 | verified |

### VeraCrypt

| # | Claim in the post | Source (vendor) | Checked | Status |
|---|---|---|---|---|
| V1 | Free and open source, for Windows, Mac and Linux | [veracrypt.io](https://veracrypt.io/en/Home.html) ("free open source disk encryption software for Windows, Mac OSX and Linux") | 2026-10-29 | verified |
| V2 | No official mobile app | [Android & iOS Support](https://veracrypt.io/en/Android%20%26%20iOS%20Support.html) ("no plans to develop an official VeraCrypt mobile app") | 2026-10-29 | verified |
| V3 | On a Mac: macOS 12 Monterey or later, in a build for macFUSE or one for FUSE-T | [Downloads](https://veracrypt.io/en/Downloads.html) | 2026-10-29 | verified |
| V4 | Licensed under Apache 2.0 and the TrueCrypt License 3.0 | [VeraCrypt License](https://veracrypt.io/en/VeraCrypt%20License.html) | 2026-10-29 | verified |
| V5 | Nothing can be decrypted without the correct password or key | [FAQ](https://veracrypt.io/en/FAQ.html) ("does not allow decryption of data without knowing the correct password or key") | 2026-10-29 | verified |
| V6 | Keyfiles can be combined with the password; a PIM, if set, must be entered every time | [Keyfiles](https://veracrypt.io/en/Keyfiles.html); [PIM](https://veracrypt.io/en/Personal%20Iterations%20Multiplier%20%28PIM%29.html) | 2026-10-29 | verified |
| V7 | A container is a normal file that can sit on any storage | [VeraCrypt Volume](https://veracrypt.io/en/VeraCrypt%20Volume.html) | 2026-10-29 | verified |
| V8 | It encrypts whole hard disks, USB drives and memory sticks | [VeraCrypt Volume](https://veracrypt.io/en/VeraCrypt%20Volume.html) | 2026-10-29 | verified |
| V9 | It encrypts the Windows drive the computer starts from | [System Encryption](https://veracrypt.io/en/System%20Encryption.html) | 2026-10-29 | verified |
| V10 | Hidden volumes inside another volume, and a hidden operating system "whose existence should be impossible to prove" | [Hidden Volume](https://veracrypt.io/en/Hidden%20Volume.html); [Hidden Operating System](https://veracrypt.io/en/Hidden%20Operating%20System.html) | 2026-10-29 | verified |
| V11 | To share, people share the container file and each mounts it on their own computer | [Sharing over Network](https://veracrypt.io/en/Sharing%20over%20Network.html) ("locally mount the shared file") | 2026-10-29 | verified |
| V12 | Audited by Quarkslab in 2016; the fixes shipped in version 1.19 in October 2016 | [veracrypt.io](https://veracrypt.io/en/Home.html); [FAQ](https://veracrypt.io/en/FAQ.html) | 2026-10-29 | verified |
| RV1 | *Reasoning:* everyone who opens a shared container needs its password | follows from V5 and V11 | 2026-10-29 | verified |
| RV2 | *Reasoning:* VeraCrypt encrypts on your own computer: it is software you install on Windows, Mac or Linux that encrypts drives and containers | follows from V1, V8; [veracrypt.io](https://veracrypt.io/en/Home.html) ("Encryption is automatic, real-time (on-the-fly)") | 2026-10-29 | verified |
| RV3 | *Reasoning:* the two do different jobs and do not compete for the same one; the "fits" lines in "In short" | follows from V7, V8, D5, D6 ("Two different jobs") | 2026-10-29 | verified |

### Doughnut Forge (existing sources, no new claims)

| # | Claim in the post | Source | Checked | Status |
|---|---|---|---|---|
| D1 | For iPhone and iPad, Android, Mac and Windows (Android from the joint launch) | `src/data/stores.ts`; site `faq.which.a` (Linux left out, owner) | 2026-10-29 | verified |
| D2 | One-time purchase on each platform, never a subscription | row 1.16; site `faq.platforms.a` | 2026-10-29 | verified |
| D3 | No account and no servers; works entirely on the device, even without an internet connection | rows 1.2, 2.5 | 2026-10-29 | verified |
| D4 | Encrypts files and text; whole folders on a computer only, not on iPhone, iPad or Android | rows 1.1, 4.17; `~/Desktop/review/android-live/app-answers.md` (Android launch: package, §3 files and text, no folders); `src/data/stores.ts` (android available); HANDOVER "Mobile first" | 2026-10-29 | verified |
| D5 | Each file or note is encrypted for the people you choose, who open it with their own identity; there is no file password | rows 1.14, 4.10, 4.14 | 2026-10-29 | verified |
| D6 | The locked file can be sent any way, including a cloud folder; the other person needs Doughnut Forge to open it | row 4.13; site `faq.recipient.a` | 2026-10-29 | verified |
| D7 | If you lose your password and every way to recover your identity (your 24-word backup phrase), your files cannot be opened | row 2.4; app `identity.json:16, 20` (24 words). Recovery shards are not named: the Security tab that makes them is hidden behind `enableDayTwoFunctionality`, which is off (`theme-slice.ts:14`, `common.ts` `ALMOST_ALL_TABS`) | 2026-10-29 | verified |
| D8 | Uses post-quantum encryption | row 3.1 | 2026-10-29 | verified |
| D9 | Not open source | app `Cargo.toml` (`license = "Proprietary"`) | 2026-10-29 | verified |
| D10 | No independent security audit yet | site `security.audit.text` ("planned" dropped, owner) | 2026-10-29 | verified |

### Removed (no source found, so not claimed)
- VeraCrypt: cloud sync; file name encryption; system encryption on Mac or Linux; any account or server.
- Both: sharing with a per-person public key.
- Any Cryptomator audit after 2017 or VeraCrypt audit after 2016.
- The exact Android price model for Cryptomator (see C6).
- Any comparison of encryption strength, and anything about either product and post-quantum encryption.
- Recovery shards in Doughnut Forge (not available to users yet, see D7).

## Post 5: Breaches keep happening. Here is what you can still control
`src/content/blog/en/protect-personal-files-from-data-breaches.mdx`, phrase "protect personal files from data breaches". Topical post on the 28 October 2026 DHS personnel breach, approved by the owner on 29 October 2026. Every external quote re-checked live on 29 October 2026 before publishing (NPR, BBC, ICO). Guardrails (owner): no political stance or quotes; the group, leak site, database, publishers and sign-on company are not named or linked; hacker statements marked as claims; never suggests Doughnut Forge would have prevented it.

| # | Claim in the post | Source | Checked |
|---|---|---|---|
| 5.N1 | Names, phone numbers and work addresses of more than 40,000 DHS staff and contractors were published | [NPR](https://www.npr.org/2026/10/28/nx-s1-6021497/dhs-hack-ice) ("names, phone numbers and addresses of more than 40,000"; contractors named); [BBC](https://www.bbc.co.uk/news/articles/cq8jzkpjr28vo) ("names, work addresses and phone numbers"). The cautious figure (NPR) is used | 2026-10-29 |
| 5.N2 | The BBC puts the figure at more than 41,000 | [BBC](https://www.bbc.co.uk/news/articles/cq8jzkpjr28vo) | 2026-10-29 |
| 5.N3 | The group **claims** it got in through a single sign-on service | [BBC](https://www.bbc.co.uk/news/articles/cq8jzkpjr28vo) (the company is named there, not in the post) | 2026-10-29 |
| 5.N4 | Single sign-on is a tool organisations use to control who can log in to internal systems | [BBC](https://www.bbc.co.uk/news/articles/cq8jzkpjr28vo) ("a popular online security tool that organisations use to ensure that only people with access to internal platforms are logging on") | 2026-10-29 |
| 5.N5 | The company said it has "no evidence our data or systems were compromised" | [BBC](https://www.bbc.co.uk/news/articles/cq8jzkpjr28vo) | 2026-10-29 |
| 5.N6 | DHS said it is "aware of a potential breach" | [NPR](https://www.npr.org/2026/10/28/nx-s1-6021497/dhs-hack-ice); [BBC](https://www.bbc.co.uk/news/articles/cq8jzkpjr28vo) | 2026-10-29 |
| 5.N7 | "the third time in recent weeks that a government agency has been targeted by leaks or hacks" | [BBC](https://www.bbc.co.uk/news/articles/cq8jzkpjr28vo) | 2026-10-29 |
| 5.E1 | ICO: "you could encrypt the data yourself before you upload it"; it helps only if the key is not also stored in the same cloud storage | [ICO: Encryption scenarios](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/security/encryption/encryption-scenarios/) ("provided you don’t also store the key in the same cloud storage system") | 2026-10-29 |
| 5.D1 | Encrypts files and text on iPhone, iPad, Android phone, Mac or Windows PC; works entirely on the device, even without an internet connection; whole folders on a computer | rows D1, D3, D4, 1.1, 2.5; `src/data/stores.ts` | 2026-10-29 |
| 5.D2 | No servers, no account; password and keys never stored on a server or sent across the network | rows D3, 2.6; site `faq.storage.a`, `security.keys.text` | 2026-10-29 |
| 5.D3 | Encrypt a private message for your contacts and share it however you like | `src/i18n/store/en.json` ("Encrypt text" feature) | 2026-10-29 |
| 5.D4 | You choose who can open each file; each opens it with their own identity; no file password | rows D5, 4.10, 4.14 | 2026-10-29 |
| 5.D5 | The locked file can stay on the device, go in a cloud folder, or be sent by email, messaging app or USB stick; only the chosen people can open it | rows 2.2, 4.13 | 2026-10-29 |
| 5.D6 | Creating an identity gives a 24-word backup phrase | row 1.5 | 2026-10-29 |
| 5.D7 | Losing the password and every way to recover the identity (the 24-word backup phrase) means files cannot be opened; no server copy | rows D7, 2.4 | 2026-10-29 |
| 5.D8 | Screenshot: files are encrypted and decrypted on the device, nothing is uploaded | row 2.3 | 2026-10-29 |
| 5.D9 | One-time purchase on each platform, never a subscription | row D2 | 2026-10-29 |
| 5.R1 | *Reasoning:* it cannot protect data other organisations hold about you, or a file already unlocked | follows from 5.D1 and 5.D5 (it works only on files you encrypt) | 2026-10-29 |

Not claimed: that Doughnut Forge would have prevented the breach; any name of the group, company, leak site, database or publishers; any political statement; DHS statements beyond "aware of a potential breach".

## Site FAQ and Technical details page (30 October 2026)

The Technical details page (`/security/technical-details/`, strings `technical.*` in `src/i18n/ui/en.ts`) states only what is in `docs/TECH-SPEC.md`, section by section. Two changes from that file: "password" in place of "passphrase" (the app's own word), and no library versions. The message length figures in TECH-SPEC.md are left out because they were calculated, not measured.

FAQ answer `faq.messaging.a` ("Why not just use WhatsApp or another encrypted messaging app?"). WhatsApp pages checked live on 30 October 2026.

| # | Claim in the answer | Source |
|---|---|---|
| F1 | WhatsApp encrypts messages end to end | [WhatsApp Privacy Policy](https://www.whatsapp.com/legal/privacy-policy), "Your Messages": "We offer end-to-end encryption for our Services. End-to-end encryption means that your messages are encrypted to protect against us and third parties from reading them." |
| F2 | You rely on the company's rules for backups | same policy: "if you use a data backup service integrated with our Services (like iCloud or Google Account), they will receive information you share with them, such as your WhatsApp messages." |
| F3 | ...and on what it can see about how you use it | same policy, "Usage and Log Information": "how you interact with others using our Services ... and the time, frequency, and duration of your activities and interactions" |
| F4 | Doughnut Forge encrypts the file or message itself, on your device | `docs/TECH-SPEC.md` opening paragraph |
| F5 | It can be pasted as text into a social media post, as long as the text arrives unchanged | `docs/TECH-SPEC.md` "Copying an encrypted message as text" ("It can be pasted into an email, a chat or a post"; changes inside it stop it opening; not tested with each app) |
| F6 | Only the people you choose can open it | `docs/TECH-SPEC.md` "Keys and identity" (the item's key is sealed for each recipient and for you); site `faq.recipient.a` |
| F7 | The service can still see that something was sent or posted, when, and roughly how big it is | `docs/TECH-SPEC.md` "What can be seen without the key" (size visible, roughly); that a carrier sees when something passes through it follows from carrying it (WhatsApp's own policy, F3, records time) |

## Post 6: Can WhatsApp read my messages? Encryption, trust and what to check
`src/content/blog/en/can-whatsapp-read-my-messages.mdx`, phrase "can WhatsApp read my messages". Topical post on the 2026 US investigation into claims about WhatsApp. Every claim checked against its source again, live, on 30 October 2026. Guardrails: the claims are allegations; the agency's own wording and Meta's denial are given; nothing says or implies that anyone reads WhatsApp messages; no political stance; WhatsApp is never called insecure.

| # | Claim in the post | Source | Checked |
|---|---|---|---|
| 6.1 | WhatsApp messages are end-to-end encrypted; quoted definition | [WhatsApp Privacy Policy](https://www.whatsapp.com/legal/privacy-policy) ("End-to-end encryption means that your messages are encrypted to protect against us and third parties from reading them.") | 2026-10-30 |
| 6.2 | Messages are deleted from WhatsApp's servers once delivered | same ("Once your messages are delivered, they are deleted from our servers.") | 2026-10-30 |
| 6.3 | In January 2026 Bloomberg reported that an agent in the Office of Export Enforcement, part of the Bureau of Industry and Security, had investigated claims that Meta can access encrypted WhatsApp messages | [The Star (Bloomberg), 30 January 2026](https://www.thestar.com.my/tech/tech-news/2026/01/30/us-has-investigated-claims-whatsapp-chats-arent-private); [The Guardian, Aisha Down, 31 January 2026](https://www.theguardian.com/technology/2026/jan/31/us-authorities-reportedly-investigate-claims-that-meta-can-read-encrypted-whatsapp-messages) (reports the investigation and the lawsuit; Meta called the claim "categorically false and absurd") | The Star 2026-10-30; the Guardian checked by owner in browser, 30 Oct 2026 |
| 6.4 | In April 2026 Bloomberg reported that the investigation had been closed; no official reason given | [The Star (Bloomberg), 29 April 2026](https://www.thestar.com.my/tech/tech-news/2026/04/29/us-ends-investigation-into-claims-whatsapp-chats-arent-private) (no reason from the agency on the page) | 2026-10-30 |
| 6.5 | The agent looked into the claims through much of 2025, and in January 2026 emailed officials at other agencies | same ("Through much of 2025"; "In January, the agent sent more than a dozen officials at other agencies an email") | 2026-10-30 |
| 6.6 | The agent's words: "Meta can and does view and store all the text messages, photographs, audio and video recordings" | same | 2026-10-30 |
| 6.7 | A bureau spokesperson: "unsubstantiated and outside the scope of his authority as an export enforcement agent" | The Star, 30 January and 29 April 2026 | 2026-10-30 |
| 6.8 | Meta later repeated that the bureau had called the allegations unsubstantiated | The Star, 29 April 2026 (Meta spokesperson: "calling its own employee's allegations unsubstantiated") | 2026-10-30 |
| 6.9 | Meta: "The claim that WhatsApp can access people's encrypted communications is patently false." | The Star, 29 April 2026 | 2026-10-30 |
| 6.10 | WhatsApp collects how you interact with others, the time, frequency and duration of activity, "last seen" and connection details such as your IP address | WhatsApp Privacy Policy, "Usage and Log Information" and "Device and Connection Information" | 2026-10-30 |
| 6.11 | A backup service such as iCloud or a Google Account receives your WhatsApp messages | same ("they will receive information you share with them, such as your WhatsApp messages") | 2026-10-30 |
| 6.12 | In 2017 UK officials asked WhatsApp for "technical solutions" to hand over messages; WhatsApp refused, saying it cannot hand over what it does not store | [Sky News, Tom Cheshire, 19 September 2017: "WhatsApp rejected Government request to access encrypted messages"](https://news.sky.com/story/whatsapp-denies-government-access-to-encrypted-messages-11043069); [IBTimes UK, 20 September 2017](https://www.ibtimes.co.uk/whatsapp-rejects-british-government-demand-backdoor-access-encryped-messages-1640133) ("technical solutions"; "cannot hand over what it doesn't store") | IBTimes 2026-10-30; Sky News checked by owner in browser, 30 Oct 2026 |
| 6.13 | In 2025 Apple stopped offering Advanced Data Protection to new UK users; iMessage and FaceTime stay end-to-end encrypted | [Apple Support 122234](https://support.apple.com/en-gb/122234) (published 23 September 2025) | 2026-10-30 |
| 6.14 | Doughnut Forge encrypts files and short messages on your device; no account; no Doughnut Forge servers | `docs/TECH-SPEC.md` opening; site `security.servers.text` | repo |
| 6.15 | An encrypted message is plain text and can be pasted into an email, chat or post if the text arrives unchanged; not tested with every app | `docs/TECH-SPEC.md` "Copying an encrypted message as text" | repo |
| 6.16 | Each person needs Doughnut Forge and their own identity, added once from their contact card | site `faq.recipient.a`, `faq.share.a` | repo |
| 6.17 | The carrier can see that something was sent or posted, when, and roughly how big; recipients can copy what is inside | `docs/TECH-SPEC.md` "What can be seen without the key" and "What Doughnut Forge does not protect against" | repo |
| 6.18 | One-time purchase on each platform, never a subscription; iPhone and iPad, Mac, Windows | site `home.pricing.*`; `src/data/stores.ts` | repo |

## Post 7: Harvest now, decrypt later: what it means for files you keep for years
`src/content/blog/en/harvest-now-decrypt-later.mdx`, phrase "harvest now decrypt later". Topical post on the 4 November 2026 NSA, ASD's ACSC and CISA guidance on post-quantum questions to ask vendors; also backlog row 10. Every external quote re-checked live on 9 November 2026 against the page text (the NSA release in a WebKit browser, because it refuses plain downloads). The guidance PDF itself was not opened, so none of its own questions are quoted; the post's six questions are its own and say so. Guardrails: no algorithm names; NIST 2024 only in general; no date for quantum computers; never says the app protects copies already taken; "unbreakable" appears only as a warning to readers, as in post 3.

| # | Claim in the post | Source | Checked |
|---|---|---|---|
| 7.1 | On 4 November 2026 the NSA, the Australian Signals Directorate's Australian Cyber Security Centre (ASD's ACSC) and the US Cybersecurity and Infrastructure Security Agency (CISA) released "Post-quantum questions to ask your vendors: Evaluating third-party readiness for post-quantum cryptography" | [NSA press release](https://www.nsa.gov/Press-Room/Press-Releases-Statements/Press-Release-View/Article/4641375/nsa-joins-asds-acsc-and-cisa-to-provide-practical-questions-to-evaluate-third-p/) ("Nov. 4, 2026"; agency names and title as given) | 2026-11-09 |
| 7.2 | It is for organisations: buying, contract renewals and checking existing suppliers | same ("for use during procurement activities, contract renewals, or ongoing vendor assurance processes") | 2026-11-09 |
| 7.3 | "will depend on its vendors' readiness, transparency, and roadmaps." | same | 2026-11-09 |
| 7.4 | The release warns that leaving the questions too late risks "discovering a critical product, service, or dependency cannot support PQC within required timeframes." | same ("Early, structured engagement also reduces the likelihood of late-stage surprises, such as …") | 2026-11-09 |
| 7.5 | "an attacker collecting and storing data today and decrypting it at some point in the future" | [NCSC: Next steps in preparing for post-quantum cryptography](https://www.ncsc.gov.uk/whitepaper/next-steps-preparing-for-post-quantum-cryptography) (version 2, published 14 August 2024); also E3.5 | 2026-11-09 |
| 7.6 | "most traditional public key cryptography (PKC) algorithms in use today will be vulnerable to attack." | same; E3.1 | 2026-11-09 |
| 7.7 | "hard to predict when this may happen as many engineering and physical challenges must be overcome first." | same; E3.3 | 2026-11-09 |
| 7.8 | "is only likely to be worthwhile for very high-value information." Storing data for years costs money | same ("Given the cost of storing vast amounts of old data for decades, such an attack is only likely to be worthwhile for very high-value information."); E3.6 | 2026-11-09 |
| 7.9 | Stronger protection for "particularly sensitive data that needs to be kept secure for a long period of time." | same | 2026-11-09 |
| 7.10 | On 13 August 2024 NIST published its first finalised post-quantum standards and encouraged system administrators "to begin transitioning to the new standards as soon as possible" | [NIST release](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards) ("August 13, 2024"; "NIST is encouraging computer system administrators to begin transitioning to the new standards as soon as possible."); E3.8 | 2026-11-09 |
| 7.11 | NCSC milestones: by 2028 "Build an initial plan for migration"; by 2031 "Carry out your early, highest-priority PQC migration activities"; by 2035 "Complete migration to PQC of all your systems, services and products" | [NCSC: Timelines for migration to post-quantum cryptography](https://www.ncsc.gov.uk/guidance/pqc-migration-timelines). No page date given in the post | 2026-11-09 |
| 7.12 | These dates are aimed mainly at large organisations and operators of critical systems | same ("primarily aimed at technical decision-makers and risk owners of large organisations, operators of critical national infrastructure systems …") | 2026-11-09 |
| 7.13 | Doughnut Forge is designed to resist attacks by future quantum computers, using NIST-standardised post-quantum algorithms alongside classical ones | site `faq.quantum.a`, `security.quantum.text`; row 3.1 | 2026-11-14 |
| 7.14 | It uses a hybrid: the key to each file, folder or note is protected with a long-trusted method and a post-quantum one, both needed; this applies to every person a file is encrypted for, including you | rows 3.2, 3.3; `docs/TECH-SPEC.md` "Key exchange (post-quantum hybrid)" | repo |
| 7.15 | Files are encrypted on your own device; password and keys are never stored on a server or sent across the network | site `security.device.text`, `faq.storage.a`, `security.keys.text`; row 2.6 | repo |
| 7.16 | The technical details page names the exact methods and lists what Doughnut Forge does not protect against, including a compromised device and anyone who can open a file copying what is inside | site `security.technical.text`; `docs/TECH-SPEC.md` "What Doughnut Forge does not protect against"; row 6.17 | repo |
| 7.17 | Screenshot caption: files are encrypted and decrypted on the device, and nothing is uploaded | row 2.3; same image, alt text and caption as post 5 | repo |
| 7.18 | No independent security audit yet; one is planned | site `security.audit.text` ("One is planned."); `src/data/roadmap.ts` (`roadmap.audit`, later) | repo |
| 7.19 | Available for iPhone and iPad, Android, Mac and Windows; one-time purchase on each platform, never a subscription | `src/data/stores.ts` (ios, android, mac, windows available); site `home.pricing.title`, `faq.platforms.a` | repo |
| 7.20 | Losing your password and your 24-word backup phrase means your files cannot be opened | rows D7, 2.4; site `faq.backup.a` | repo |
| 7.21 | Reasoning, not a sourced fact: the two clocks; protecting long-lived files as if the second clock might run out first; examples of long-lived files; the six questions; locking a new copy does not change old ones | consistent with 7.5 to 7.9 | n/a |

## v2 changes to the posts (release/v2-site, 9 November 2026)
Posts changed for Doughnut Forge 2: `encrypt-files-on-mac-without-cloud`, `share-encrypted-files`, `offline-encryption-privacy`, `protect-personal-files-from-data-breaches`, `doughnut-forge-vs-cryptomator`, `doughnut-forge-vs-veracrypt`, `harvest-now-decrypt-later`, `can-whatsapp-read-my-messages` (image only). Sources are the v2 website pack only (`~/website-pack-v2/`, made from tag v2.0.0): its release notes, `features.md`, `roadmap-status.md` and store screenshots. These rows replace the v1 wording of rows 1.5, 1.7, 1.9, 2.3, 2.4, 2.7, 4.1, 4.2, 4.18, 5.D6, 5.D7, 6.14 (image), D7 and 7.17, 7.20 where they say "backup phrase", "Secure Directory", "Secure File", "Share Identity", "Just Me", "Encrypt Selection", "Decrypt & Extract" or that the password cannot be reset.

| # | Claim in the posts | Source | Checked |
|---|---|---|---|
| V2.1 | The 24-word backup phrase is now called your recovery words | release notes, iOS, Mac and Windows (`en-GB`, `en`): "Your 24-word backup phrase is now called your recovery words." | 2026-11-09 |
| V2.2 | After you write them down, the app asks for two of them, to help you catch a mistake | same | 2026-11-09 |
| V2.3 | Forgot your password: "Trouble unlocking?" on the lock screen sets a new one with your recovery words; identity, contacts and encrypted files stay the same | same | 2026-11-09 |
| V2.4 | First open: one short welcome, then one choice, create your identity or restore it | same ("Setting up is one short welcome, then one choice") | 2026-11-09 |
| V2.5 | Your identity is stored only on this device and protected by your password | v2 Mac and iPhone Identity screenshots ("Your identity stays here. It is stored only on this device and protected by your password.") | 2026-11-09 |
| V2.6 | Mac: open Files, click Add folder; a file's ⋮ button, Encrypt file; under "Who can open this?" you are always included; click Encrypt file; the locked copy is saved next to the original, which stays unchanged | v2 Mac screenshots `light-01-files`, `light-02-encrypt` ("Only you and the people you pick can open the encrypted copy. It is saved next to the original"; "The original stays where it is, unchanged.") | 2026-11-09 |
| V2.7 | Mac: Encrypt File and Decrypt File are in the File menu | Mac release notes ("Encrypt File, Decrypt File and Lock are in the File menu, with keyboard shortcuts.") | 2026-11-09 |
| V2.8 | Encrypting and decrypting show progress, then say where the file was saved and who can open it | Mac release notes | 2026-11-09 |
| V2.9 | Identity screen: Share contact card; Contacts: Add contact | v2 iPhone Identity and iPad Contacts screenshots | 2026-11-09 |
| V2.10 | Screenshots: the v2 Files, Identity and "Who can open this?" screens on iPhone; "Everything happens on this device. Nothing is uploaded." | v2 iPhone store screenshots, cropped by `scripts/images-from-pack.mjs` | 2026-11-09 |
| V2.11 | Mac decrypt: find the `.vlt2` file in the app's list in Files (Add folder first if needed); Decrypt & Extract from its ⋮ button; in the Decrypt file window, under Save to, Choose… a folder; Decrypt file; progress, then where it was saved. The post never mentions Finder or drag and drop: neither opens a file in the app yet | app repo `main` a7f5efa4 (read 10 November 2026; also `~/website-pack-v2/app-answers-2026-11-10.md`): `src/locales/en/secure-directory.json` (`contextMenu.decrypt`, `decryptModal.destinationLabel`, `browse`, `decryptPayload`, `unpackedDir`); `src/views/secure-directory-view/inner-directory.tsx:285`; `src/hooks/use-decrypt-enclave.ts:128-143`; `src/locales/en/app.json` (`menu.decryptFile`). There is no file picker for decrypting | 2026-11-10 |
| V2.12 | Share contact card: check your name, then Share card (the system share menu) or Save file (a `.vltc2` file) | app repo: `src/locales/en/share-identity.json` (`exportModal`); `src/components/my-identity-card/export-identity-modal` | 2026-11-10 |
| V2.13 | Messages: "Could not open this file" (not encrypted for your identity, or damaged; ask the sender to encrypt it for you again) and "Encrypted by someone not in your Contacts" (the file still opens; check with the sender if unexpected) | app repo: `src/locales/en/errors.json` (`errors.vault.DECAPSULATION_FAILED`); `secure-directory.json` (`decryptModal.unknownSignerWarning`, `unknownSignerDetail`) | 2026-11-10 |
| V2.14 | Restoring from recovery words does not bring back contacts; restoring an iPhone, iPad or Mac backup first and then entering the recovery words does | app repo: `src-tauri/src/commands/identity.rs:66-108`, `src-tauri/src/engine/contact_store.rs:1-12`, `docs/plans/identity-not-in-backups.md:24, 50` (site FAQ `faq.restore.a`) | 2026-11-10 |

## Post 8: Is my Synology NAS at risk from ransomware? What to do now
`src/content/blog/en/synology-nas-ransomware.mdx`, phrase "Synology NAS ransomware". News: Synology's notice of 29 October 2026. Every external claim was re-checked live on 11 November 2026 against: SY = [Synology notice, 29 October 2026](https://www.synology.com/en-global/company/news/article/C3RB3R/Synology%20urges%20users%20to%20update%20DSM%20following%20ransomware%20attacks%20on%20outdated%20DSM%20versions); SA = [Synology-SA-24:20](https://www.synology.com/en-global/security/advisory/Synology_SA_24_20) (published 5 November 2024, updated 28 March 2025); KA = [Kaspersky, 9 November 2026](https://www.kaspersky.co.uk/blog/synology-c3rb3r-attack/31044/); BC = [BleepingComputer, 2 November 2026, updated 3 November](https://bleepingcomputer.com/news/security/synology-warns-customers-of-ongoing-c3rb3r-ransomware-attacks). The thehackerwire.com article was not used (it is about Synergy).

| # | Claim in the post | Source | Checked |
|---|---|---|---|
| 8.1 | C3RB3R has locked files on Synology drives since October 2026 | KA ("In October 2026, attackers began infecting Synology NAS devices"); BC (first reports "more than two weeks" before 2 November) | 2026-11-11 |
| 8.2 | Attackers use a flaw Synology fixed in December 2024, against outdated DSM | SY ("exploiting a vulnerability patched in December 2024 to target devices running outdated versions of DSM") | 2026-11-11 |
| 8.3 | Synology "strongly urges all users running vulnerable versions to update DSM immediately" | SY | 2026-11-11 |
| 8.4 | Researchers have seen newer flaws in some attacks, fixed in Synology's September update | KA (360.cn; CVE-2026-13639, CVE-2026-13684; "Synology hasn't confirmed that these vulnerabilities have been used in this campaign") | 2026-11-11 |
| 8.5 | Synology recommends automatic updates "to keep DSM up to date at all times" | SY | 2026-11-11 |
| 8.6 | Turn off QuickConnect; remove port forwarding and DMZ rules; check UPnP; test from mobile data | KA (prevention and before-reconnecting steps). Not claimed: that QuickConnect was the way in | 2026-11-11 |
| 8.7 | Never leave ports 139 and 445 open to the internet | KA | 2026-11-11 |
| 8.8 | Block the management interface from the internet (as "instead of opening the NAS itself") | BC ("access to the management web interface from the Internet") | 2026-11-11 |
| 8.9 | For remote access, connect to the home network first, for example by VPN | KA | 2026-11-11 |
| 8.10 | Never keep the only copy on the NAS; snapshots help | KA (only copy; 3-2-1; snapshots) | 2026-11-11 |
| 8.11 | Unique password, two-factor and auto-blocking will not stop C3RB3R, which needs no password, but help if a password is stolen | KA ("won't protect you from the current C3RB3R attack"; "doesn't need your password") | 2026-11-11 |
| 8.12 | "These attacks aim to encrypt data and extort ransom"; the flaw is not named; the notice links SA-24:20, rated critical | SY; SA ("Critical"); BC (spokesperson pointed to "the same 2024 advisory") | 2026-11-11 |
| 8.13 | Most infections need no owner action and no password; scanners probably find drives by DSM version | KA ("the vast majority of C3RB3R infections happen without any user interaction at all"; scanners "likely") | 2026-11-11 |
| 8.14 | It locks photos, documents, archives, videos and music in every folder it can reach | KA ("traversing every accessible folder containing user data") | 2026-11-11 |
| 8.15 | `.L0CK3D` ending; renaming does not help; `read-me3.txt` in each folder | KA ("simply renaming the file won't remove the encryption"); BC | 2026-11-11 |
| 8.16 | The note asks for payment through a hidden website; no guarantee | KA (Tor; "there's no guarantee you'll get your files back intact"); BC (dark web portal) | 2026-11-11 |
| 8.17 | Victims were asked for thousands of dollars | BC | 2026-11-11 |
| 8.18 | Two conditions: not updated for a long time; DSM reachable from the internet or local network | KA ("accessible from the internet (or the local network)") | 2026-11-11 |
| 8.19 | Fixed versions table | SA (DSM Affected Products: 7.2.2-72806-1, 7.2.1-69057-6, 7.2-64570-4, 7.1.1-42962-7, 6.2.4-25556-8 "or above") | 2026-11-11 |
| 8.20 | Self-built NAS with Arc, RR or M-Shell: check compatibility; cut outside access; local access only from needed devices; separate network segment | KA | 2026-11-11 |
| 8.21 | If locked, steps 1 to 7 (disconnect but keep powered, memory may hold a key, shut down normally; copy to an empty drive; snapshots; change passwords, revoke tokens, end sessions, two-factor; reinstalling does not cancel stolen passwords; reset after saving, no settings from after infection, consider waiting for a free decryptor; trust only genuine researchers) | KA (incident steps; "reinstalling DSM doesn't invalidate stolen passwords, sessions, or other secrets") | 2026-11-11 |
| 8.22 | Attackers often threaten to publish passwords, private photos and work documents, by email or social media; some are scams; theft cannot be ruled out if the NAS was locked | KA ("often blackmail victims"; "you can't rule out data theft"). SY and BC do not mention theft | 2026-11-11 |
| R8.1 | *Reasoning:* a backup drive left plugged in, or a folder the NAS can write to, can be locked too | follows from 8.14 and KA's advice not to connect backup drives to an infected NAS | 2026-11-11 |
| R8.2 | *Reasoning:* the best defence is a backup not on the NAS; encrypting before copying to cloud keeps it private | follows from 8.10 and row E2.3 | 2026-11-11 |
| R8.3 | *Reasoning:* encrypting a file already on the NAS may leave the readable original in a snapshot or backup | follows from 8.10 (snapshots) and V2.6 (encrypting makes a separate copy) | 2026-11-11 |
| 8.D1 | Doughnut Forge does not stop ransomware and cannot unlock files ransomware has locked | no such feature anywhere in `src/i18n/`, this file or HANDOVER | repo |
| 8.D2 | Encrypted files can go into any cloud folder; only you and the people you choose can open them | rows 2.2, 4.13, D6 | repo |
| 8.D3 | A file encrypted before it goes on the NAS cannot be read by whoever takes it; ransomware can still lock it | rows 2.2, 4.13; the second half is reasoning | repo |
| 8.D4 | Recovery words | row V2.1 | repo |

Not claimed: any CVE number; that QuickConnect was the way in; that the app would have prevented an attack; the 3-2-1 rule's definition; Shadowserver's count of exposed drives.

## Post 9: Does encryption protect against hackers? What it can and cannot do
`src/content/blog/en/does-encryption-protect-against-hackers.mdx`, phrase "does encryption protect against hackers" (also answers "what does encryption not protect against"). Owner's brief, 11 November 2026; publish date 16 November 2026 (moved from 13 November by the owner on 12 November). Every external page was opened and checked on 11 November 2026, and every CISA quote was matched word for word on the page. CT = [CISA training: How to protect the data stored on your devices](https://www.cisa.gov/resources-tools/training/how-protect-data-stored-your-devices); CB = [CISA: Encrypt business data](https://www.cisa.gov/audiences/small-and-medium-businesses/secure-your-business/encrypt-business-data); N10 = [NCSC 10 Steps: data security](https://www.ncsc.gov.uk/collection/10-steps/data-security).

| # | Claim in the post | Source | Checked |
|---|---|---|---|
| 9.1 | Encryption "prevents people from accessing or manipulating your data without authorization" | CT (exact) | 2026-11-11 |
| 9.2 | "disk encryption should be used where there is a risk of physical theft, such as laptop computers and removable media" | N10 (exact) | 2026-11-11 |
| 9.3 | Use "secure, encrypted and authenticated" connections wherever possible | N10 ("secure, encrypted and authenticated, application protocols") | 2026-11-11 |
| 9.4 | End-to-end encryption: locked on one phone, unlocked on the other; you still trust the app at each end | post 6 rows (WhatsApp privacy policy) | repo |
| 9.5 | Providers typically manage the keys; "does not prevent cloud providers from accessing the data"; "encrypt the data yourself before you upload it" | [ICO: Encryption scenarios](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/security/encryption/encryption-scenarios/) | 2026-11-11 |
| 9.6 | Stolen encrypted copies cannot be read without the key; attackers often threaten to publish what they take | row 9.5; row 8.22 (Kaspersky) | 2026-11-11 |
| 9.7 | CISA lists encryption among defences against "attacks like ransomware and malware" | CB ("It's a critical defense against attacks like ransomware and malware.") | 2026-11-11 |
| R9.1 | *Reasoning:* ransomware encrypts files with the attacker's key; an encrypted file can be locked again; a backup, not encryption, gets files back | rows 8.14, 8.10; CT ("Start the encryption process only after backing up your data") | 2026-11-11 |
| 9.8 | Phishing: criminals "use scam emails, text messages or phone calls to trick their victims" | [NCSC: Phishing scams](https://www.ncsc.gov.uk/collection/phishing-scams) | 2026-11-11 |
| R9.2 | *Reasoning:* a password typed into a fake page lets the attacker sign in as you; encryption cannot tell the difference | rows 9.8, 9.1 | 2026-11-11 |
| 9.9 | Disk encryption "does not protect data on running systems" | N10 (exact) | 2026-11-11 |
| 9.10 | CISA advises a password that is "long, random, and unique" | CT ("Make sure to use a password that is long, random, and unique.") | 2026-11-11 |
| 9.11 | Losing a recovery key or password can mean losing the data for good (paraphrase) | CT ("Losing this information can lead to permanent data loss.") | 2026-11-11 |
| 9.12 | File encryption protects contents; author and creation date can stay visible (paraphrase) | CT and CB ("metadata like the file's author and the time and date it was created will still be visible") | 2026-11-11 |
| R9.3 | *Reasoning:* breaking well-made modern encryption by force is not practical today; attackers go around it | consistent with 9.13 and E3.2 | 2026-11-11 |
| 9.13 | "most traditional public key cryptography (PKC) algorithms in use today will be vulnerable to attack"; symmetric "not significantly impacted"; "hard to predict when this may happen" | [NCSC: Next steps in preparing for PQC](https://www.ncsc.gov.uk/whitepaper/next-steps-preparing-for-post-quantum-cryptography) | 2026-11-11 |
| 9.14 | Updates "contain vital security updates to help protect your devices from cyber criminals"; back up to an external drive or cloud; two-step verification; three random words; password managers | [NCSC Cyber Aware](https://www.ncsc.gov.uk/cyberaware/home) | 2026-11-11 |
| 9.15 | Ransomware can reach a backup drive that stays connected; unplug it (paraphrase) | CT ("the connection could be used by ransomware to gain access to the drive and delete or corrupt your backups") | 2026-11-11 |
| R9.4 | *Reasoning:* pause before you click; go to the website yourself | general advice, consistent with 9.8 | 2026-11-11 |
| R9.5 | *Reasoning:* device encryption is the first step; file encryption covers a file once it leaves the device | rows 9.2, 9.5 | 2026-11-11 |
| 9.D1 | Doughnut Forge encrypts files on your own device; only you and the people you choose can open them, wherever the file goes | rows 2.2, 4.13, D6 | repo |
| 9.D2 | It does not stop ransomware or phishing, and cannot protect a device that is already compromised | row 8.D1; site `technical.limits` | repo |

Not claimed: that CISA says device encryption fails once a device is unlocked (not on its page; the point rests on 9.9); any algorithm name; "install apps only from the official store" (no source opened). No FAQPage markup (owner).

## Post 10: Should I delete apps for privacy? Which ones to worry about
`src/content/blog/en/should-i-delete-apps-for-privacy.mdx`, phrase "should I delete apps for privacy". Owner's brief, 12 November 2026; published 12 November 2026 (brought forward from 16 November by the owner). Every external page was opened on 12 November 2026 and every quote below was matched word for word on the live page the same day, just before this file was written. AP = [Apple Support 102188: About App Privacy Report](https://support.apple.com/en-gb/102188); GD = [Google Play Help 11416267: Data safety section](https://support.google.com/googleplay/answer/11416267?hl=en-GB); NS = [NCSC: Small organisations guide, protecting your devices](https://www.ncsc.gov.uk/collection/small-organisations-guide-to-cyber-security/protecting-your-devices) (reviewed 21 July 2026); BC = [BleepingComputer, 10 November 2026: Binance warns of iOS flaw that could leak crypto wallet secrets](https://www.bleepingcomputer.com/news/security/binance-warns-of-ios-flaw-that-could-leak-crypto-wallet-secrets/); PC = [PCMag UK, Kim Key, 5 September 2026](https://uk.pcmag.com/security/167109/check-your-phone-now-these-10-data-hungry-apps-are-secretly-tracking-you).

| # | Claim in the post | Source | Checked |
|---|---|---|---|
| 10.1 | App Store pages show an App Privacy label with groups such as "Data Linked to You" and "Data Not Linked to You"; See Details gives the full list | [Apple: privacy labels](https://www.apple.com/uk/privacy/labels/) (headings); the App Store listing [id6821344597](https://apps.apple.com/gb/app/id6821344597) ("App Privacy"); PC ("Tap See Details") | 2026-11-12 |
| 10.2 | App Privacy Report: Settings > Privacy & Security > App Privacy Report > Turn on App Privacy Report; iOS or iPadOS 15.2 or later | AP | 2026-11-12 |
| 10.3 | It shows how often apps used location, camera, microphone and more "in the past seven days", and the web domains they contacted | AP ("the web domains that all apps contact most frequently") | 2026-11-12 |
| 10.4 | The report is "encrypted and stored only on your device"; it starts empty | AP ("will only start gathering information after you've turned it on") | 2026-11-12 |
| 10.5 | Data safety shows which data an app collects, why, and whether it shares it | GD | 2026-11-12 |
| 10.6 | Privacy dashboard: Settings > Security and Privacy or Privacy > Privacy dashboard; last 7 days on Android 13, last 24 hours on Android 12 | [Android Help 13530434](https://support.google.com/android/answer/13530434?hl=en-GB) | 2026-11-12 |
| 10.7 | "You're responsible for keeping your responses accurate and up to date." | [Apple Developer: App privacy details](https://developer.apple.com/app-store/app-privacy-details/) (exact) | 2026-11-12 |
| 10.8 | The information "is self-reported by the developer" | [Apple Support 102399](https://support.apple.com/en-gb/102399) (published 3 October 2024; exact) | 2026-11-12 |
| 10.9 | Data safety "is based on information declared by app developers" and differs from permissions | GD (exact) | 2026-11-12 |
| 10.10 | Data used only on the phone and never sent off it need not be listed as collected | GD ("An app accesses the data only on your device and it is not sent off your device") | 2026-11-12 |
| 10.11 | Doughnut Forge shows "Data Not Collected" on the App Store | App Store listings [id6821344597](https://apps.apple.com/gb/app/id6821344597) (iPhone and iPad) and [id6812778888](https://apps.apple.com/gb/app/id6812778888) (Mac) | 2026-11-12 |
| 10.12 | "Only download apps from official stores or websites"; built-in store apps "are vetted before they're released" | NS (exact) | 2026-11-12 |
| 10.13 | On 10 November 2026 Binance warned of an iOS flaw that could let a malicious app read other apps' files; the app "must be installed on an iPhone for the attack to work" and could be sideloaded outside the App Store | BC | 2026-11-12 |
| 10.14 | Binance advised deleting unneeded and untrusted apps and updating; no losses confirmed | BC ("delete any unnecessary and untrusted apps"; "no cryptocurrency losses have been confirmed") | 2026-11-12 |
| 10.15 | "If there are apps or software on your devices that you no longer use, you should delete them." | NS (exact) | 2026-11-12 |
| 10.16 | Deleting an app stops future collection, not what the company already holds | GD ("Delete apps to stop future data collection"; the section covers how users can request data deletion) | 2026-11-12 |
| 10.17 | iPhone: Settings > Privacy & Security, pick a data type; Tracking > Allow Apps to Request to Track | [Apple Personal Safety: App privacy features](https://support.apple.com/en-gb/guide/personal-safety/ipsd4dac4a2c/web) | 2026-11-12 |
| 10.18 | Android: Settings > Apps > the app > Permissions > Allow or Don't allow; Pause app activity if unused, under Unused app settings | [Google Play Help 9431959](https://support.google.com/googleplay/answer/9431959?hl=en-GB) | 2026-11-12 |
| 10.19 | An app using data "in a way or at a time you didn't expect": change the setting or revoke permission | AP (exact) | 2026-11-12 |
| 10.20 | PCMag, September 2026: research analysing privacy policies of "more than 5,000 apps" in the App Store; "companies self-report all of this information to Apple" | PC (exact) | 2026-11-12 |
| 10.21 | Delivery, map and weather apps need location to work | PC ("Delivery, map, and weather apps all require your location to function properly") | 2026-11-12 |
| 10.22 | "Applying security updates promptly will help protect your devices and accounts from cyber criminals"; automatic updates "if available"; avoid phones no longer supported | [NCSC: Install the latest software and app updates](https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online/install-the-latest-software-and-app-updates) (reviewed 21 December 2021) | 2026-11-12 |
| 10.23 | No antivirus needed on a phone or tablet "provided that you only install apps and software from official stores" | [NCSC: What is an antivirus product?](https://www.ncsc.gov.uk/guidance/what-is-an-antivirus-product) (exact) | 2026-11-12 |
| R10.1 | *Reasoning:* a maps app needs location; a photo editor does not need contacts; collecting is not misusing | consistent with 10.21 | 2026-11-12 |
| R10.2 | *Reasoning:* a viral list can be old by the time it reaches you; check its date and source | general advice; PC is two months old at publication | 2026-11-12 |
| 10.D1 | Doughnut Forge is an app for encrypting files on your own device | site `security.device.text`; row 7.15 | repo |

Not claimed: any app named as dangerous (PCMag's ten apps are in a chart image and were not confirmed from its text); any iOS version affected by the Binance flaw, or whether Apple has fixed it (BC: "unclear"); anything from Forbes (403 to automated reading) or The Sun (2023); that people are deleting apps in large numbers (no source opened).
