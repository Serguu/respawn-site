import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/editor-data";
import { ArticleView } from "@/components/ArticleView";

export default async function PreviewPage({ params }: PageProps<"/editor/preview/[id]">) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  return (
    <div className="bg-bg pb-16">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-accent px-4 py-2 text-sm font-bold text-accent-ink">
        <span>
          Preview · {article.status === "published" ? "Published" : "Draft — not visible to visitors"}
        </span>
        <Link href={`/editor/articles/${article.id}`} className="underline">
          Back to editor
        </Link>
      </div>
      <ArticleView article={article} />
    </div>
  );
}
