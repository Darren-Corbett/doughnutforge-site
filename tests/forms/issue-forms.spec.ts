// The GitHub issue forms for forge-privacy, kept in docs/forge-privacy/ and
// copied there by hand: each opens with the bold never-attach warning, asks for
// the platform and app version, asks for nothing personal, and blank issues are
// off, with security problems sent to private reporting instead.
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

const dir = new URL("../../docs/forge-privacy/.github/ISSUE_TEMPLATE/", import.meta.url).pathname;
const read = (file: string) => parse(readFileSync(`${dir}${file}`, "utf8"));

const WARNING =
  "**Never attach vault files, identity files, your backup phrase (recovery words), passwords or passphrases, or screenshots that show them.**";
const PLATFORMS = ["Mac", "Windows", "iPhone", "iPad"];
const PERSONAL = /name|e-?mail|phone|address|contact|account/i;
const FORMS = { "bug_report.yml": "bug", "question.yml": "question", "feature_idea.yml": "enhancement" };
// The forms that ask which version of the app is in use
const WITH_VERSION = ["bug_report.yml", "question.yml"];

type Field = { type: string; id?: string; attributes: { label?: string; value?: string; options?: string[] } };

for (const [file, label] of Object.entries(FORMS)) {
  test(file, () => {
    const form = read(file) as { name: string; description: string; labels: string[]; body: Field[] };
    expect(form.name).toBeTruthy();
    expect(form.labels).toEqual([label]);
    // The warning comes first, before any field
    expect(form.body[0]!.type).toBe("markdown");
    expect(form.body[0]!.attributes.value).toContain(WARNING);
    expect(form.body[0]!.attributes.value).toContain("Issues are public: anyone can read what you write.");

    const fields = form.body.filter((f) => f.type !== "markdown");
    const platform = fields.find((f) => f.id === "platform");
    expect(platform?.type, "platform is a dropdown").toBe("dropdown");
    expect(platform!.attributes.options).toEqual(PLATFORMS);
    const version = fields.find((f) => f.id === "version");
    if (WITH_VERSION.includes(file)) expect(version?.type, "app version is a text input").toBe("input");
    else expect(version).toBeUndefined();

    // Nothing personal: no field asks for a name, email, phone, address or account
    for (const f of fields) {
      expect(f.id ?? "", `field id ${f.id}`).not.toMatch(PERSONAL);
      expect(f.attributes.label ?? "", `field label ${f.attributes.label}`).not.toMatch(PERSONAL);
    }
    // Every field has an id, so the answers have stable headings
    expect(fields.every((f) => f.id)).toBe(true);
  });
}

test("config.yml", () => {
  const config = read("config.yml") as { blank_issues_enabled: boolean; contact_links: { name: string; url: string; about: string }[] };
  expect(config.blank_issues_enabled).toBe(false);
  expect(config.contact_links).toContainEqual(
    expect.objectContaining({
      name: "Report a security problem privately",
      url: "https://github.com/Darren-Corbett/forge-privacy/security/advisories/new",
    }),
  );
});
