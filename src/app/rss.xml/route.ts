import { getPublishedArticles } from "@/lib/articles";
import { CATEGORIES } from "@/lib/categories";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of the latest articles, for feed readers and news aggregators. */
export async function GET() {
  const articles = await getPublishedArticles({ limit: 30 }).catch(() => []);
  const items = articles
    .map((a) => {
      const url = `${SITE.url}/articol/${a.slug}`;
      return `    <item>
      <title>${escape(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escape(a.excerpt)}</description>
      <category>${CATEGORIES[a.category].label}</category>${a.author_name ? `\n      <dc:creator>${escape(a.author_name)}</dc:creator>` : ""}${a.published_at ? `\n      <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>` : ""}${a.cover_image ? `\n      <enclosure url="${escape(a.cover_image)}" type="image/jpeg" length="0" />` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(SITE.name)}</title>
    <link>${SITE.url}/</link>
    <description>${escape(SITE.description)}</description>
    <language>ro-RO</language>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600" },
  });
}
