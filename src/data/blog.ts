import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

// Drafts show in `npm run dev`, and in a preview build made with DRAFTS=1.
// They never reach a production build, the sitemap or the footer link.
export const showDrafts = import.meta.env.DEV || import.meta.env.DRAFTS === "1";

/** A post's URL slug: its file name without the language folder */
export const postSlug = (post: Post) => post.id.split("/").at(-1)!;

// Astro warns on every page when a collection is empty, so it is only read once a post file exists
const hasPostFiles = Object.keys(import.meta.glob("../content/blog/*/[^_]*.{md,mdx}")).length > 0;

/** Posts in one language, newest first, without drafts unless they are being previewed */
export const getPosts = async (lang: string) =>
  hasPostFiles
    ? (await getCollection("blog", (p) => p.data.lang === lang && (showDrafts || !p.data.draft))).sort(
        (a, b) => b.data.date.getTime() - a.data.date.getTime(),
      )
    : [];

/** Published posts in one language, newest first. Never drafts, even in a preview: for the RSS feed */
export const getPublishedPosts = async (lang: string) =>
  hasPostFiles
    ? (await getCollection("blog", (p) => p.data.lang === lang && !p.data.draft)).sort(
        (a, b) => b.data.date.getTime() - a.data.date.getTime(),
      )
    : [];
