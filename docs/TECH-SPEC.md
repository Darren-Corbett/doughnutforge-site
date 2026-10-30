# Technical details

Doughnut Forge encrypts files, folders and short messages on your own device. There are no accounts, no servers and no cloud storage. This page lists the standard methods it uses, for readers who want to check them.

## Encryption

- **Cipher:** AES-256-GCM (256-bit key, 96-bit nonce, 128-bit authentication tag).
- **One key per item:** every file, folder or message gets its own new random 256-bit key.
- **Authentication:** the content and the item's header are authenticated. If they are changed, opening fails and nothing is saved.
- **Nonces:** never reused under the same key. Each item has its own key and its own random values.
- **Compression:** content is compressed (Zstandard) before it is encrypted.
- **Randomness:** keys, nonces and salts come from the operating system's secure random source.

## Keys and identity

- **Your identity** is made from one 256-bit random secret, created on your device.
- **Recovery:** that secret can be written down as 24 recovery words (BIP-39). It can also be split into recovery shards with Shamir's Secret Sharing, where any chosen number of shards (at least 2, at most 16 in total) brings it back. Fewer shards than that reveal nothing.
- **Key exchange (post-quantum hybrid):** each item's key is sealed separately for every recipient, and for you, using X25519 together with ML-KEM-768. The two shared secrets are combined with SHA-256.
- **Signatures:** Ed25519, used to sign contact cards. Proof of who sent an item is not yet offered.
- **Key derivation:** HKDF-SHA-256.
- **Several recipients:** one encrypted item can be opened by up to 1,024 people, each with their own sealed copy of the item's key.

### How your secret is stored

Your secret is stored only in encrypted form. It is encrypted with AES-256-GCM, using a key made from your passphrase with **Argon2id**:

| Setting | Value |
|---|---|
| Memory | 19 MiB (19,456 KiB) |
| Passes | 2 |
| Parallel lanes | 1 |
| Salt | 128-bit, random |
| Output | 256-bit key |

Your contact list is also stored encrypted (AES-256-GCM).

| Device | Unlock |
|---|---|
| Mac | Passphrase. The app runs in the macOS App Sandbox. |
| Windows | Passphrase. |
| iPhone and iPad | Passphrase, or Face ID or Touch ID if you turn it on. Doughnut Forge then keeps your passphrase in the iOS Keychain, on this device only, and only while the device is unlocked. iOS releases it after Face ID, Touch ID or the device passcode. The app's files use iOS Complete data protection. |

## What can be seen without the key

| | Without the key |
|---|---|
| File contents | Hidden |
| Original file name and type | Hidden inside. By default the encrypted file is named after the original (for example `report.vlt2`); rename it if the name itself is private. |
| Who it is for | Hidden |
| Who sent it | Hidden |
| How many people can open it | Visible (the number of recipients, counting the sender) |
| Size | Visible, roughly (the compressed size) |
| Dates | No dates can be read without the key. The file has the normal dates your computer gives any file. |
| That it is a Doughnut Forge file, and its format version | Visible |

Files made with versions older than 0.4.41 show who they are for, and who sent them, without the key. They still open in the current version.

## Copying an encrypted message as text

Yes. An encrypted message is plain text: standard Base64 between a `BEGIN FORGE ENCLAVE` line and an `END FORGE ENCLAVE` line. It can be pasted into an email, a chat or a post.

- **Line wrapping is fine.** Spaces and line breaks are ignored when the message is opened.
- **Extra text around it is fine.** Anything before the BEGIN line or after the END line is ignored.
- **Changes inside it are not.** If an app changes, removes or adds a character inside the message, shortens it, or changes the dashes in the BEGIN and END lines, it will not open. It never opens as different text.
- **Length:** a short message for one person is about 3,700 characters, plus the message itself. Each extra recipient adds about 1,600 characters.

Doughnut Forge has not been tested with each app that the text might pass through.

## Network

Doughnut Forge makes no network connections of its own. There is no account, no sign-in, no analytics, no crash reporting and no update check. The app's content policy does not allow its screens to load anything from the internet.

On Mac, iPhone and iPad, the operating system may contact the Doughnut Forge website so that password managers can offer to save and fill your passphrase. Apple's system does this, not the app.

Encrypted items leave your device only when you share them yourself.

## Libraries

| Purpose | Library | Version |
|---|---|---|
| AES-256-GCM | aes-gcm (RustCrypto) | 0.10.3 |
| Argon2id | argon2 (RustCrypto) | 0.5.3 |
| ML-KEM-768 | ml-kem (RustCrypto) | 0.3.2 |
| X25519 | x25519-dalek | 2.0.1 |
| Ed25519 | ed25519-dalek | 2.2.0 |
| Curve25519 | curve25519-dalek | 4.1.3 |
| HKDF | hkdf (RustCrypto) | 0.12.4 |
| SHA-256 and SHA-512 | sha2 (RustCrypto) | 0.10.9 |
| Operating system random source | getrandom | 0.2.17 |
| Recovery words | bip39 | 2.2.2 |
| Recovery shards | sharks | 0.5.0 |
| Secrets in memory | secrets (libsodium) | 1.3.0 |
| Wiping secrets from memory | zeroize | 1.9.0 |
| Compression | zstd | 0.13.3 |

## What Doughnut Forge does not protect against

- **A device that is already compromised.** While Doughnut Forge is unlocked, malware with full access to your device could read your secrets.
- **Anyone with your passphrase and your device, your 24 recovery words, or enough recovery shards.** Keep them safe.
- **Your device passcode,** on iPhone and iPad with Face ID or Touch ID turned on. iOS accepts the passcode in place of Face ID or Touch ID.
- **Recipients.** Anyone who can open an item can save, copy or share what is inside.
- **Proof of who sent an item.** Doughnut Forge does not yet prove who sent an item.
- **Size, number of recipients and file name.** See "What can be seen without the key".
- **Unencrypted copies.** The original file stays where it was after encrypting, and opened files are saved as normal files. Deleting them is up to you. On SSDs, deleting or overwriting a file does not guarantee the old data is gone.
