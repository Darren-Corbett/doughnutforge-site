// File names for the assets the build emits: Astro's own "_astro/[name].[hash][extname]",
// except that an asset made from several identical files (the en and en-US store
// badges, say) takes the first of their names in sorted order, not whichever the
// build happened to see first. So two builds of the same commit are byte for byte
// the same, and keep the same build ID (scripts/build-id.mjs). Like Astro's own,
// it drops Astro's internal "@_@" marker and what follows it.
/** @param {{ names?: readonly string[], name?: string }} info */
export const assetFileNames = (info) => {
  const name = [...(info.names ?? []), ...(info.name ? [info.name] : [])].map((n) => n.split("/").pop() ?? n).sort()[0] ?? "asset";
  const base = name.includes("@_@") ? name.split("@_@")[0] : name.replace(/\.[^.]*$/, "");
  return `_astro/${base}.[hash][extname]`;
};
