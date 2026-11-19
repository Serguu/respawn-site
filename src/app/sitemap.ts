import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // If the database is briefly unreachable, still serve the main pages instead of an error.
  let articles: { slug: string; updated_at: Date; cover_image: string | null }[] = [];
  try {
    articles = await sql<{ slug: string; updated_at: Date; cover_image: string | null }[]>`
      select slug, updated_at, cover_image from articles where status = 'published' order by published_at desc
    `;
  } catch (error) {
    console.error("sitemap: could not load articles", error);
  }
  return [
    { url: `${SITE.url}/`, changeFrequency: "hourly" },
    { url: `${SITE.url}/stiri`, changeFrequency: "hourly" },
    { url: `${SITE.url}/recenzii`, changeFrequency: "daily" },
    { url: `${SITE.url}/articole`, changeFrequency: "daily" },
    { url: `${SITE.url}/recomandari`, changeFrequency: "daily" },
    { url: `${SITE.url}/joaca`, changeFrequency: "monthly" },
    { url: `${SITE.url}/contact`, changeFrequency: "monthly" },
    ...articles.map((a) => ({
      url: `${SITE.url}/articol/${a.slug}`,
      lastModified: a.updated_at,
      images: a.cover_image ? [a.cover_image] : undefined,
    })),
  ];
}
