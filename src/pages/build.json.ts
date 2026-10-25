// The live build's ID. An open page fetches it, uncached, to tell whether it is
// out of date (src/components/FreshCheck.astro). Not in the sitemap.
import type { APIRoute } from "astro";
import { buildId } from "../data/build";

export const GET: APIRoute = () => new Response(JSON.stringify({ id: buildId }), { headers: { "Content-Type": "application/json" } });
