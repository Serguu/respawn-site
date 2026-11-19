import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getPublishedArticles, getPublishedBySlug } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleView } from "@/components/ArticleView";
import { SectionHeading } from "@/components/SectionHeading";
import { ViewTracker } from "@/components/trackers";
import { SITE } from "@/lib/site";
import type { Article } from "@/lib/types";

const getArticle = cache(getPublishedBySlug);

export async function generateMetadata({ params }: PageProps<"/article/[slug]">): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  const url = `/article/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url,
      publishedTime: article.published_at?.toISOString(),
      modifiedTime: article.updated_at.toISOString(),
      authors: article.author_name ? [article.author_name] : undefined,
      section: article.category === "review" ? "Reviews" : "News",
      images: article.cover_image ? [article.cover_image] : undefined,
    },
  };
}

/** schema.org data so search engines know this is a news article or a scored game review. */
function structuredData(article: Article) {
  const url = `${SITE.url}/article/${article.slug}`;
  const author = article.author_name ? { "@type": "Person", name: article.author_name } : undefined;
  const publisher = { "@type": "Organization", name: SITE.name, url: SITE.url };
  const base = {
    "@context": "https://schema.org",
    url,
    mainEntityOfPage: url,
    image: article.cover_image ?? undefined,
    datePublished: article.published_at?.toISOString(),
    dateModified: article.updated_at.toISOString(),
    author,
    publisher,
  };
  if (article.category === "review" && article.review_score !== null) {
    return {
      ...base,
      "@type": "Review",
      name: article.title,
      reviewBody: article.excerpt,
      // The review title is the best name we have for the game itself.
      itemReviewed: { "@type": "VideoGame", name: article.title, gamePlatform: article.review_platform ?? undefined },
      reviewRating: { "@type": "Rating", ratingValue: Number(article.review_score), bestRating: 10, worstRating: 0 },
    };
  }
  return { ...base, "@type": "NewsArticle", headline: article.title, description: article.excerpt };
}

export default async function ArticlePage({ params }: PageProps<"/article/[slug]">) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  const isReview = article.category === "review";
  const related = await getPublishedArticles({ category: article.category, limit: 3, excludeId: article.id });

  return (
    <article className="pb-8">
      <script
        type="application/ld+json"
        // "<" is escaped so article text can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(article)).replace(/</g, "\\u003c") }}
      />
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
