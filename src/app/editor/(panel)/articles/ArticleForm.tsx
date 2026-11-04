"use client";

import type { JSONContent } from "@tiptap/react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { slugify } from "@/lib/format";
import type { Article, Category } from "@/lib/types";
import { uploadFile } from "../../upload-client";
import { Field, inputClass, Panel, PrimaryButton, SecondaryButton } from "../../ui";
import { saveArticle, type SaveState } from "./actions";
import { RichTextEditor, type EditorValue } from "./RichTextEditor";

export function ArticleForm({ article, justCreated = false }: { article: Article | null; justCreated?: boolean }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(
    saveArticle,
    justCreated ? { message: "Article created.", status: article?.status } : {},
  );

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [category, setCategory] = useState<Category>(article?.category ?? "news");
  const [cover, setCover] = useState(article?.cover_image ?? "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [score, setScore] = useState(article?.review_score?.toString() ?? "");
  // Controlled fields: React resets uncontrolled inputs after a form action.
  const [fields, setFields] = useState({
    excerpt: article?.excerpt ?? "",
    review_platform: article?.review_platform ?? "",
    review_pros: article?.review_pros.join("\n") ?? "",
    review_cons: article?.review_cons.join("\n") ?? "",
    review_verdict: article?.review_verdict ?? "",
  });
  const bind = (name: keyof typeof fields) => ({
    id: name,
    name,
    value: fields[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [name]: e.target.value })),
  });
  const [content, setContent] = useState<EditorValue>({
    html: article?.content_html ?? "",
    json: (article?.content_json as JSONContent | null) ?? null,
  });

  const status = state.status ?? article?.status ?? "draft";
  const liveSlug = state.slug ?? article?.slug;

  const onCover = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    try {
      setCover(await uploadFile(file));
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setCoverUploading(false);
    }
  };

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      {article && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="content_html" value={content.html} />
      <input type="hidden" name="content_json" value={JSON.stringify(content.json)} />
      <input type="hidden" name="cover_image" value={cover} />
      <input type="hidden" name="category" value={category} />

      {/* ---------- Main column ---------- */}
      <div className="min-w-0 space-y-5">
        <input
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="Article title"
          aria-label="Title"
          required
          className="w-full border-0 border-b-2 border-line bg-transparent pb-3 font-display text-3xl font-black text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none sm:text-4xl"
        />
        <Field label="Excerpt" htmlFor="excerpt" hint="1–2 sentences shown on cards and under the title.">
          <textarea
            {...bind("excerpt")}
            rows={2}
            maxLength={400}
            className={inputClass}
          />
        </Field>
        <RichTextEditor initialContent={(article?.content_json as JSONContent) ?? article?.content_html ?? null} onChange={setContent} />
      </div>

      {/* ---------- Side panel ---------- */}
      <div className="space-y-5">
        <Panel>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Status</span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                status === "published" ? "bg-score-great/15 text-score-great" : "bg-surface-2 text-muted"
              }`}
            >
              {status}
            </span>
          </div>

          {state.error && (
            <p role="alert" className="mt-4 rounded-md border border-score-bad/40 bg-score-bad/10 px-3 py-2 text-sm text-score-bad">
              {state.error}
            </p>
          )}
          {state.message && !state.error && (
            <p role="status" className="mt-4 rounded-md border border-score-great/40 bg-score-great/10 px-3 py-2 text-sm text-score-great">
              {state.message}
            </p>
          )}

          <div className="mt-4 grid gap-2">
            {status === "published" ? (
              <>
                <PrimaryButton type="submit" name="intent" value="save" disabled={pending}>
                  {pending ? "Saving…" : "Update"}
                </PrimaryButton>
                <SecondaryButton type="submit" name="intent" value="unpublish" disabled={pending}>
                  Unpublish
                </SecondaryButton>
              </>
            ) : (
              <>
                <PrimaryButton type="submit" name="intent" value="publish" disabled={pending}>
                  {pending ? "Saving…" : "Publish"}
                </PrimaryButton>
                <SecondaryButton type="submit" name="intent" value="save" disabled={pending}>
                  Save draft
                </SecondaryButton>
              </>
            )}
          </div>

          {article && (
            <div className="mt-4 flex gap-4 text-sm">
              <Link href={`/editor/preview/${article.id}`} target="_blank" className="text-accent hover:underline">
                Preview ↗
              </Link>
              {status === "published" && liveSlug && (
                <Link href={`/article/${liveSlug}`} target="_blank" className="text-accent hover:underline">
                  View live ↗
                </Link>
              )}
            </div>
          )}
        </Panel>

        <Panel title="Category">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Category">
            {(["news", "review"] as const).map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={category === c}
                onClick={() => setCategory(c)}
                className={`rounded-md border px-3 py-2.5 font-display text-sm font-extrabold uppercase tracking-wider transition-colors ${
                  category === c
                    ? c === "news"
                      ? "border-news bg-news text-accent-ink"
                      : "border-review bg-review text-accent-ink"
                    : "border-line text-ink-soft hover:border-ink-soft"
                }`}
              >
                {c === "news" ? "News" : "Review"}
              </button>
            ))}
          </div>
        </Panel>

        {category === "review" && (
          <Panel title="Review details">
            <div className="space-y-4">
              <Field label="Final score (0–10)" htmlFor="review_score">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={score || 0}
                    onChange={(e) => setScore(e.target.value)}
                    className="flex-1 accent-[#f8d435]"
                    aria-label="Score slider"
                  />
                  <input
                    id="review_score"
                    name="review_score"
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className={`${inputClass} w-20 text-center font-display font-black`}
                  />
                </div>
              </Field>
              <Field label="Platform" htmlFor="review_platform" hint="e.g. PC, PS5, Xbox Series X, Switch 2">
                <input {...bind("review_platform")} className={inputClass} />
              </Field>
              <Field label="Pros" htmlFor="review_pros" hint="One per line">
                <textarea {...bind("review_pros")} rows={4} className={inputClass} />
              </Field>
              <Field label="Cons" htmlFor="review_cons" hint="One per line">
                <textarea {...bind("review_cons")} rows={4} className={inputClass} />
              </Field>
              <Field label="Verdict" htmlFor="review_verdict" hint="A short closing summary.">
                <textarea {...bind("review_verdict")} rows={3} className={inputClass} />
              </Field>
            </div>
          </Panel>
        )}

        <Panel title="Cover image">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="Cover preview" className="aspect-[16/9] w-full rounded-md object-cover" />
          ) : (
            <div className="grid aspect-[16/9] place-items-center rounded-md border border-dashed border-line text-sm text-muted">
              No cover yet
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <label className="flex-1 cursor-pointer rounded-md border border-line bg-bg px-3 py-2 text-center text-sm font-semibold text-ink hover:border-accent">
              {coverUploading ? "Uploading…" : cover ? "Replace" : "Upload"}
              <input type="file" accept="image/*" hidden onChange={onCover} disabled={coverUploading} />
            </label>
            {cover && (
              <button type="button" onClick={() => setCover("")} className="rounded-md px-3 py-2 text-sm text-muted hover:text-score-bad">
                Remove
              </button>
            )}
          </div>
        </Panel>

        <Panel title="URL">
          <Field label="Slug" htmlFor="slug" hint={`/article/${slug || "…"}`}>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={inputClass}
            />
          </Field>
        </Panel>
      </div>
    </form>
  );
}
