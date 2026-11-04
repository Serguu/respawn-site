import { requireEditor } from "@/lib/session";
import { ArticleForm } from "../ArticleForm";

export default async function NewArticlePage() {
  await requireEditor();
  return (
    <>
      <h1 className="mb-6 font-display text-2xl font-black text-ink">New article</h1>
      <ArticleForm article={null} />
    </>
  );
}
