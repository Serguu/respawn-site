import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/editor-data";
import { ArticleForm } from "../ArticleForm";
import { deleteArticle } from "../actions";
import { DeleteButton } from "../DeleteButton";

export default async function EditArticlePage({ params, searchParams }: PageProps<"/editor/articles/[id]">) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();
  const justCreated = (await searchParams).created === "1";

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-black text-ink">Edit article</h1>
        <form action={deleteArticle}>
          <input type="hidden" name="id" value={article.id} />
          <DeleteButton />
        </form>
      </div>
      {/* key forces a fresh form when switching between articles */}
      <ArticleForm key={article.id} article={article} justCreated={justCreated} />
    </>
  );
}
