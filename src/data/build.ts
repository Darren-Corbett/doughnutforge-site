// This build's ID, set once per build in astro.config.mjs: the commit plus the
// build time, so the daily rebuild of the same commit gets a new one. Every page
// carries it, and /build.json holds the live one (src/components/FreshCheck.astro).
export const buildId: string = import.meta.env.BUILD_ID;
