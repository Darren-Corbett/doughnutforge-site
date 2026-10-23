// Marks a value that is not known yet. scripts/check-placeholders.mjs fails the
// deploy build if this marker appears anywhere in the built site.
export const placeholder = (what: string) => `[[PLACEHOLDER: ${what}]]`;
