import "server-only";
import { sql } from "./db";
import { requireEditor } from "./session";
import type { Article, Category, Status } from "./types";

// Every function re-checks the session so data never leaks if a page forgets to.

export type EditorArticleRow = {
  id: string;
  title: string;
  slug: string;
  category: Category;
  status: Status;
  updated_at: Date;
  published_at: Date | null;
  view_count: number;
  home_impression_count: number;
  home_click_count: number;
};

export async function listArticles(): Promise<EditorArticleRow[]> {
  await requireEditor();
  return sql<EditorArticleRow[]>`
    select id, title, slug, category, status, updated_at, published_at,
           view_count, home_impression_count, home_click_count
    from articles
    order by updated_at desc
  `;
}

export async function getArticleById(id: string): Promise<Article | null> {
  await requireEditor();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await sql<Article[]>`
    select a.*, e.display_name as author_name
    from articles a left join editors e on e.id = a.author_id
    where a.id = ${id}
  `;
  if (!row) return null;
  return { ...row, review_score: row.review_score === null ? null : Number(row.review_score) };
}

export async function getDashboardTotals() {
  await requireEditor();
  const [row] = await sql<
    {
      published: string;
      drafts: string;
      views: string;
      impressions: string;
      clicks: string;
      views_7d: string;
    }[]
  >`
    select
      count(*) filter (where status = 'published')            as published,
      count(*) filter (where status = 'draft')                as drafts,
      coalesce(sum(view_count), 0)                            as views,
      coalesce(sum(home_impression_count), 0)                 as impressions,
      coalesce(sum(home_click_count), 0)                      as clicks,
      (select count(*) from view_events where day > current_date - 7) as views_7d
    from articles
  `;
  return {
    published: Number(row.published),
    drafts: Number(row.drafts),
    views: Number(row.views),
    impressions: Number(row.impressions),
    clicks: Number(row.clicks),
    views7d: Number(row.views_7d),
  };
}
