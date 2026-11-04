import "server-only";
import { sql } from "./db";
import type { Article, ArticleSummary, Category } from "./types";

// numeric columns come back as strings from Postgres; normalise them.
function normalise<T extends { review_score: unknown }>(row: T): T {
  return {
    ...row,
    review_score: row.review_score === null ? null : Number(row.review_score),
  };
}

const summaryColumns = sql`
  a.id, a.slug, a.title, a.excerpt, a.cover_image, a.category, a.published_at,
  a.view_count, a.review_score, e.display_name as author_name
`;

export async function getPublishedArticles(opts: {
  category?: Category;
  limit: number;
  offset?: number;
  excludeId?: string;
}): Promise<ArticleSummary[]> {
  const rows = await sql<ArticleSummary[]>`
    select ${summaryColumns}
    from articles a
    left join editors e on e.id = a.author_id
    where a.status = 'published'
      ${opts.category ? sql`and a.category = ${opts.category}` : sql``}
      ${opts.excludeId ? sql`and a.id <> ${opts.excludeId}` : sql``}
    order by a.published_at desc
    limit ${opts.limit} offset ${opts.offset ?? 0}
  `;
  return rows.map(normalise);
}

export async function countPublished(category?: Category): Promise<number> {
  const [row] = await sql<{ count: string }[]>`
    select count(*) from articles
    where status = 'published' ${category ? sql`and category = ${category}` : sql``}
  `;
  return Number(row.count);
}

export async function getMostRead(limit: number, category?: Category): Promise<ArticleSummary[]> {
  const rows = await sql<ArticleSummary[]>`
    select ${summaryColumns}
    from articles a
    left join editors e on e.id = a.author_id
    where a.status = 'published' ${category ? sql`and a.category = ${category}` : sql``}
    order by a.view_count desc, a.published_at desc
    limit ${limit}
  `;
  return rows.map(normalise);
}

export async function getPublishedBySlug(slug: string): Promise<Article | null> {
  const [row] = await sql<Article[]>`
    select a.*, e.display_name as author_name
    from articles a
    left join editors e on e.id = a.author_id
    where a.slug = ${slug} and a.status = 'published'
  `;
  return row ? normalise(row) : null;
}
