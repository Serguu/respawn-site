import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // If the database is briefly unreachable, still serve the main pages instead of an error.
  let articles: { slug: string; updated_at: Date }[] = [];
  try {
    articles = await sql<{ slug: string; updated_at: Date }[]>`
      select slug, updated_at from articles where status = 'published' order by published_at desc
    `;
  } catch (error) {
    console.error("sitemap: could not load articles", error);
  }
  return [
    { url: `${SITE.url}/`, changeFrequency: "hourly" },
    { url: `${SITE.url}/news`, changeFrequency: "hourly" },
    { url: `${SITE.url}/reviews`, changeFrequency: "daily" },
    { url: `${SITE.url}/contact`, changeFrequency: "monthly" },
    ...articles.map((a) => ({ url: `${SITE.url}/article/${a.slug}`, lastModified: a.updated_at })),
  ];
}
