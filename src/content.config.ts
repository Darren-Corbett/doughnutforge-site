// Blog posts: one Markdown or MDX file per post per language, in src/content/blog/<lang>/.
// MDX is for posts with figures (src/components/blog/).
// Every field below is required unless marked optional, so a post missing its
// search phrase or date fails the build. The author is always the organisation
// (src/layouts/Post.astro), so posts carry no author field.
import { defineCollection } from "astro:content";
import { glob, type Loader } from "astro/loaders";
import { z } from "astro/zod";

const BASE = "./src/content/blog";
const posts = glob({ pattern: "*/[^_]*.{md,mdx}", base: BASE });

// The glob loader warns on every build while the blog has no posts yet, so it
// only runs once a post file exists. (In `npm run dev`, restart after adding the first post.)
const hasPosts = Object.keys(import.meta.glob("./content/blog/*/[^_]*.{md,mdx}")).length > 0;
const loader: Loader = {
  name: "blog-posts",
  load: async (context) => (hasPosts ? posts.load(context) : context.store.clear()),
};

const blog = defineCollection({
  loader,
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70),
      description: z.string().min(50).max(160),
      /** The one main search phrase the post answers */
      keyphrase: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      /** New posts start as drafts; they are published only after approval */
      draft: z.boolean().default(true),
      image: image().optional(),
      imageAlt: z.string().optional(),
      lang: z.string(),
    }),
});

export const collections = { blog };
