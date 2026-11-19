import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getPublishedArticles, getPublishedBySlug } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleView } from "@/components/ArticleView";
import { SectionHeading } from "@/components/SectionHeading";
import { JsonLd } from "@/components/JsonLd";
import { ViewTracker } from "@/components/trackers";
import { SITE } from "@/lib/site";
import type { Article } from "@/lib/types";

const getArticle = cache(getPublishedBySlug);

export async function generateMetadata({ params }: PageProps<"/articol/[slug]">): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  const url = `/articol/${article.slug}`;
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
      section: article.category === "review" ? "Recenzii" : "Știri",
      images: article.cover_image ? [article.cover_image] : undefined,
    },
  };
}

/** schema.org data: a news article or a scored game review, plus its breadcrumb trail. */
function structuredData(article: Article) {
  const url = `${SITE.url}/articol/${article.slug}`;
  const isReview = article.category === "review";
  const section = isReview
    ? { name: "Recenzii", url: `${SITE.url}/recenzii` }
    : { name: "Știri", url: `${SITE.url}/stiri` };
  const author = article.author_name ? { "@type": "Person", name: article.author_name } : undefined;
  const publisher = {
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: { "@type": "ImageObject", url: `${SITE.url}/apple-icon` },
  };
  const base = {
    url,
    mainEntityOfPage: url,
    inLanguage: "ro-RO",
    image: article.cover_image ?? undefined,
    datePublished: article.published_at?.toISOString(),
    dateModified: article.updated_at.toISOString(),
    author,
    publisher,
  };
  const main =
    isReview && article.review_score !== null
      ? {
          ...base,
          "@type": "Review",
          name: article.title,
          reviewBody: article.excerpt,
          // The review title is the best name we have for the game itself.
          itemReviewed: { "@type": "VideoGame", name: article.title, gamePlatform: article.review_platform ?? undefined },
          reviewRating: { "@type": "Rating", ratingValue: Number(article.review_score), bestRating: 10, worstRating: 0 },
        }
      : {
          ...base,
          "@type": "NewsArticle",
          headline: article.title,
          description: article.excerpt,
          articleSection: section.name,
        };
  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: `${SITE.url}/` },
      { "@type": "ListItem", position: 2, name: section.name, item: section.url },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };
  return { "@context": "https://schema.org", "@graph": [main, breadcrumbs] };
}

export default async function ArticlePage({ params }: PageProps<"/articol/[slug]">) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();

  const isReview = article.category === "review";
  const related = await getPublishedArticles({ category: article.category, limit: 3, excludeId: article.id });

  return (
    <article className="pb-8">
      <JsonLd data={structuredData(article)} />
      <ViewTracker articleId={article.id} />
      <ArticleView article={article} />

      {related.length > 0 && (
        <aside className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
          <SectionHeading
            title={isReview ? "Mai multe recenzii" : "Mai multe știri"}
            href={isReview ? "/recenzii" : "/stiri"}
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
