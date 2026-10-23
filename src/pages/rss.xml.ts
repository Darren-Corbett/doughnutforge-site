// The blog's RSS feed: published English posts only, newest first. Drafts never
// appear here, not even in a DRAFTS=1 preview.
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getPublishedPosts, postSlug } from "../data/blog";
import { site } from "../data/site";
import { useStrings } from "../i18n";

export const GET: APIRoute = async () => {
  const { t } = useStrings("en");
  const posts = await getPublishedPosts("en");
  return rss({
    title: `${site.name} ${t("blog.title")}`,
    description: t("meta.blog.description"),
    site: site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${postSlug(post)}/`,
    })),
    customData: "<language>en-GB</language>",
  });
};
