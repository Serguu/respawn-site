"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { slugify } from "@/lib/format";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { requireEditor } from "@/lib/session";

export type SaveState = { error?: string; message?: string; status?: "draft" | "published"; slug?: string };

const UUID = /^[0-9a-f-]{36}$/i;

function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function uniqueSlug(base: string, id: string | null): Promise<string> {
  let slug = base || "article";
  for (let n = 2; ; n++) {
    const [taken] = await sql`
      select 1 from articles where slug = ${slug} ${id ? sql`and id <> ${id}` : sql``}
    `;
    if (!taken) return slug;
    slug = `${base}-${n}`;
  }
}

export async function saveArticle(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const editor = await requireEditor();

  const rawId = String(formData.get("id") ?? "");
  const id = UUID.test(rawId) ? rawId : null;
  const intent = String(formData.get("intent") ?? "save");
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim().slice(0, 400);
  const category = formData.get("category") === "review" ? "review" : "news";
  const coverRaw = String(formData.get("cover_image") ?? "").trim();
  const coverImage = coverRaw && isHttpUrl(coverRaw) ? coverRaw : null;
  const contentHtml = sanitizeArticleHtml(String(formData.get("content_html") ?? ""));
  let contentJson: unknown = null;
  try {
    contentJson = JSON.parse(String(formData.get("content_json") ?? "null"));
  } catch {
    contentJson = null;
  }

  if (!title) return { error: "The title is required." };

  const scoreRaw = String(formData.get("review_score") ?? "").trim();
  const score = scoreRaw === "" ? null : Math.round(Number(scoreRaw) * 10) / 10;
  if (category === "review" && score !== null && (Number.isNaN(score) || score < 0 || score > 10)) {
    return { error: "The score must be a number between 0 and 10." };
  }

  const review =
    category === "review"
      ? {
          review_score: score,
          review_verdict: String(formData.get("review_verdict") ?? "").trim() || null,
          review_pros: sql.json(lines(formData.get("review_pros"))),
          review_cons: sql.json(lines(formData.get("review_cons"))),
          review_platform: String(formData.get("review_platform") ?? "").trim() || null,
        }
      : {
          review_score: null,
          review_verdict: null,
          review_pros: sql.json([]),
          review_cons: sql.json([]),
          review_platform: null,
        };

  const [current] = id
    ? await sql<{ status: "draft" | "published" }[]>`select status from articles where id = ${id}`
    : [];
  if (id && !current) return { error: "This article no longer exists." };

  const status: "draft" | "published" =
    intent === "publish" ? "published" : intent === "unpublish" ? "draft" : (current?.status ?? "draft");

  if (status === "published") {
    if (!contentHtml.replace(/<[^>]+>/g, "").trim()) return { error: "Write some content before publishing." };
    if (category === "review" && score === null) return { error: "Reviews need a final score before publishing." };
  }

  const slugInput = slugify(String(formData.get("slug") ?? "")) || slugify(title);
  const slug = await uniqueSlug(slugInput, id);

  const values = {
    title,
    slug,
    excerpt,
    category,
    cover_image: coverImage,
    content_html: contentHtml,
    content_json: sql.json(contentJson as never),
    status,
    ...review,
  };

  if (!id) {
    const row = { ...values, author_id: editor.id, published_at: status === "published" ? new Date() : null };
    const [created] = await sql<{ id: string }[]>`insert into articles ${sql(row)} returning id`;
    redirect(`/editor/articles/${created.id}?created=1`);
  }

  await sql`
    update articles set ${sql(values)},
      updated_at = now(),
      published_at = case when ${status} = 'published' then coalesce(published_at, now()) else published_at end
    where id = ${id}
  `;

  const message =
    intent === "publish"
      ? "Published! It's live on the site."
      : intent === "unpublish"
        ? "Moved back to drafts."
        : "Saved.";
  return { message, status, slug };
}

export async function deleteArticle(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  if (UUID.test(id)) await sql`delete from articles where id = ${id}`;
  redirect("/editor/articles");
}
