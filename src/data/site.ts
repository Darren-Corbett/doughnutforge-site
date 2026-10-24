// Site-wide constants.
export const site = {
  name: "Doughnut Forge",
  url: "https://doughnut-forge.app",
  // Support stays in GitHub issues on forge-privacy: the store listings link there.
  issuesUrl: "https://github.com/Darren-Corbett/forge-privacy/issues",
  // The issue forms (forge-privacy .github/ISSUE_TEMPLATE/, copied from docs/forge-privacy/)
  issueFormUrl: (form: "bug_report" | "question" | "feature_idea") => `https://github.com/Darren-Corbett/forge-privacy/issues/new?template=${form}.yml`,
  // Whose comment on a labelled issue is its answer (scripts/fetch-issues.mjs uses the same)
  owner: "Darren-Corbett",
  // Security reports go to GitHub's private vulnerability reporting, never to the
  // public issues. Also the Contact in public/.well-known/security.txt.
  reportUrl: "https://github.com/Darren-Corbett/forge-privacy/security/advisories/new",
  // The old privacy page, still the Privacy URL in the store listings. It gets a
  // redirect to /privacy/ at launch (Phase 6); never link visitors to it.
  legacyPrivacyUrl: "https://darren-corbett.github.io/forge-privacy/",
};
