// Second copies of the store badges, for when a content blocker hides the first
// (src/components/StoreBadge.astro). Every badge file, every store's (so iPhone
// and iPad are ready before they go on sale), byte for byte, named after its own
// content so nothing in the name says "store" or "badge".
import type { APIRoute, GetStaticPaths } from "astro";
import { badgeBytes, badgeFiles, secondArt } from "../../data/badges";

export const getStaticPaths = (() =>
  badgeFiles.map((file) => ({ params: { name: secondArt(file).slice(3, -4) }, props: { file } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => new Response(badgeBytes(props.file as string), { headers: { "Content-Type": "image/svg+xml" } });
