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

## Post 2: Why offline encryption keeps your files private
`src/content/blog/en/offline-encryption-privacy.mdx`, phrase "offline encryption"

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
| E2.3 | "You could encrypt the data yourself before you upload it", as long as the key is not stored in the same place | same page |
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
| 3.1 | Doughnut Forge uses post-quantum encryption, so what you protect today stays protected as computers become more powerful | Mac and iOS store `description.txt` ("Built for the long term"); site `faq.quantum.a` |
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
| 4.7 | The app checks each card has not been tampered with | `mobile-guides.json:56`; `src-tauri/src/engine/contact.rs:213-214` |
| 4.8 | Each contact has a short contact code; compare it with the code on the person's own Identity screen, in person or on a call | Mac `release_notes.txt`; `contact_code.rs:3-5`; `contacts.json:94-97` |
| 4.9 | Only add cards received directly; a card that does not match an existing contact is refused | `mobile-views.json:177`; `contact.rs:68-71`; `errors.json:66` |
| 4.10 | "Who can open this?": select one or several contacts; you are always included too | `secure-directory.json:35-37`; `writer.rs:161` (`let mut recipients = vec![Contact::from_keys(&my_keys)]`) |
| 4.11 | On a computer the locked `.vlt2` file appears next to the original; in the iPhone and iPad app the share sheet opens | `writer.rs:286-290`; `mobile_vault.rs:87-88`; `secure-file.json:24`; App Store lookup `itunes.apple.com/lookup?id=6821344597` (iPhone and iPad app, live 27 October 2026) |
| 4.12 | The locked file does not show who can open it; only those it was encrypted for can unlock it | Mac `release_notes.txt` ("Encrypted files now keep the sender and the recipients private."); `writer.rs` (key slots name nobody); `errors.json:21-22` |
| 4.13 | Send it any way (email, messaging app, cloud folder, USB stick); only the chosen people can open it | store ("However you send them, only they can open them"); `mobile-guides.json:37`; site `faq.share.a` |
| 4.14 | The recipient decrypts with their own identity; no file password | store ("They open them with their own identity"); `vault.rs:340` (no file passwords exist) |
| 4.15 | "Access Denied": not encrypted for this identity, or changed since it was encrypted | `errors.json:21-22` |
| 4.16 | "Unknown Sender Detected": the file still opens, but the app cannot match the sender to one of your contacts | `secure-directory.json:60`; `reader.rs:181-182` |
| 4.17 | Folders encrypted on a computer cannot be opened on iPhone or iPad | `mobile_vault.rs:135, 162` |
| 4.18 | Losing the backup phrase and password means files sent to you cannot be opened | `mobile-guides.json:25`; `mobile-views.json:126` |
| 4.19 | Screenshots of the Identity and Contacts screens are from the iPhone app | `fastlane/screenshots/ios/en-GB/iphone_05_identity.png`, `iphone_03_contacts.png`; App Store lookup `itunes.apple.com/lookup?id=6821344597` (iPhone and iPad app, live 27 October 2026) |
| R4.1 | *Reasoning:* the usual advice to send a password separately, and why that is fragile | general advice, no external fact |

Not claimed: QR codes; pasting a contact ID; that the app shows who sent a file; password-only sharing; that a Mac-made file opens on Windows (no test found).

## Comparison posts (drafts, 29 October 2026)

`src/content/blog/en/doughnut-forge-vs-cryptomator.mdx` (phrase "Cryptomator alternative", secondary "encrypt files for cloud storage") and `src/content/blog/en/doughnut-forge-vs-veracrypt.mdx` (phrase "VeraCrypt alternative", secondary "encrypted drive or encrypted files"). Both `draft: true`, waiting for the owner's approval of this table. Every vendor quote was checked word for word on its live page on 29 October 2026. Independent sources: none used; vendor pages cover every row.

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

### Doughnut Forge (existing sources, no new claims)

| # | Claim in the post | Source | Checked | Status |
|---|---|---|---|---|
| D1 | For iPhone and iPad, Mac and Windows; Android is coming | `src/data/stores.ts`; site `faq.which.a` (Linux left out, owner) | 2026-10-29 | verified |
| D2 | One-time purchase on each platform, never a subscription | row 1.16; site `faq.platforms.a` | 2026-10-29 | verified |
| D3 | No account and no servers; works entirely on the device, even without an internet connection | rows 1.2, 2.5 | 2026-10-29 | verified |
| D4 | Encrypts files and text; whole folders on a computer only, not on iPhone or iPad | rows 1.1, 4.17; HANDOVER "Mobile first" | 2026-10-29 | verified |
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
| 5.D1 | Encrypts files and text on iPhone, iPad, Mac or Windows PC; works entirely on the device, even without an internet connection; whole folders on a computer | rows D1, D3, D4, 1.1, 2.5; `src/data/stores.ts` | 2026-10-29 |
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
