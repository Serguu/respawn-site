import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getPublishedArticles, getPublishedBySlug } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleView } from "@/components/ArticleView";
import { SectionHeading } from "@/components/SectionHeading";
import { ViewTracker } from "@/components/trackers";

const getArticle = cache(getPublishedBySlug);

export async function generateMetadata({ params }: PageProps<"/article/[slug]">): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: article.cover_image ? [article.cover_image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/article/[slug]">) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  const isReview = article.category === "review";
  const related = await getPublishedArticles({ category: article.category, limit: 3, excludeId: article.id });

  return (
    <article className="pb-8">
      <ViewTracker articleId={article.id} />
      <ArticleView article={article} />

      {related.length > 0 && (
        <aside className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
          <SectionHeading
            title={isReview ? "More Reviews" : "More News"}
            href={isReview ? "/reviews" : "/news"}
            accent={article.category}
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </aside>
      )}
    </article>
  );
}
