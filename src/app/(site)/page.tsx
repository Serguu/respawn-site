import Link from "next/link";
import { getMostRead, getPublishedArticles } from "@/lib/articles";
import type { ArticleSummary, Category } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { ArticleCard, RankedItem } from "@/components/ArticleCard";
import { CategoryBadge, CategoryLabel, ScoreChip } from "@/components/Badges";
import { CategoryTabs } from "@/components/CategoryTabs";
import { Cover } from "@/components/Cover";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeading } from "@/components/SectionHeading";
import { HomeTracker } from "@/components/trackers";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const param = (await searchParams).category;
  const category: Category | undefined = param === "news" || param === "review" ? param : undefined;

  const [latest, mostRead, latestNews, latestReviews] = await Promise.all([
    getPublishedArticles({ category, limit: 5 }),
    getMostRead(5, category),
    category ? Promise.resolve([]) : getPublishedArticles({ category: "news", limit: 9 }),
    category ? Promise.resolve([]) : getPublishedArticles({ category: "review", limit: 9 }),
  ]);
  const more = category ? await getPublishedArticles({ category, limit: 8, offset: 5 }) : [];

  const [featured, secondary, ...rest] = latest;
  const shown = new Set(latest.map((a) => a.id));
  const newsSection = latestNews.filter((a) => !shown.has(a.id)).slice(0, 4);
  const reviewSection = latestReviews.filter((a) => !shown.has(a.id)).slice(0, 4);

  return (
    <HomeTracker>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="sr-only">Latest gaming news and reviews</h1>
          <CategoryTabs active={category} />
        </div>

        {!featured ? (
          <EmptyState title="Nothing published yet" text="Fresh articles are on the way. Check back soon!" />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              <FeaturedStory article={featured} />
              {rest.length > 0 && (
                <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-10 lg:border-l lg:border-line lg:pl-10">
              {secondary && <SecondaryStory article={secondary} />}
              {mostRead.length > 0 && (
                <section aria-labelledby="most-read">
                  <h2 id="most-read" className="mb-5 font-display text-xl font-black uppercase tracking-tight text-ink">
                    Most Read
                  </h2>
                  <ol className="space-y-5">
                    {mostRead.map((article, i) => (
                      <RankedItem key={article.id} article={article} rank={i + 1} />
                    ))}
                  </ol>
                </section>
              )}
            </aside>
          </div>
        )}

        {newsSection.length > 0 && (
          <CardSection title="Latest News" href="/news" accent="news" articles={newsSection} />
        )}
        {reviewSection.length > 0 && (
          <CardSection title="Latest Reviews" href="/reviews" accent="review" articles={reviewSection} />
        )}
        {more.length > 0 && (
          <CardSection
            title={category === "news" ? "More News" : "More Reviews"}
            href={category === "news" ? "/news" : "/reviews"}
            accent={category}
            articles={more}
          />
        )}
      </div>
    </HomeTracker>
  );
}

function FeaturedStory({ article }: { article: ArticleSummary }) {
  return (
    <article data-article-id={article.id} className="group">
      <Link href={`/article/${article.slug}`} className="grid gap-6 md:grid-cols-[5fr_7fr] md:items-start">
        <div className="order-2 md:order-1">
          <h2 className="font-display text-3xl font-black leading-[1.1] text-ink sm:text-4xl">
            <CategoryBadge category={article.category} className="mr-2" />
            <span className="headline-link">{article.title}</span>
          </h2>
          {article.excerpt && <p className="mt-5 line-clamp-4 leading-relaxed text-muted">{article.excerpt}</p>}
          <p className="mt-4 flex items-center gap-3 text-xs">
            <CategoryLabel category={article.category} />
            <span className="text-muted">{timeAgo(article.published_at)}</span>
            {article.author_name && <span className="text-muted">by {article.author_name}</span>}
          </p>
        </div>
        <div className="relative order-1 md:order-2">
          <Cover
            src={article.cover_image}
            alt=""
            sizes="(min-width: 1024px) 520px, (min-width: 768px) 55vw, 100vw"
            priority
            className="aspect-[4/3] md:aspect-[5/4]"
          />
          {article.category === "review" && article.review_score !== null && (
            <ScoreChip score={article.review_score} className="absolute bottom-3 right-3 size-14 text-2xl" />
          )}
        </div>
      </Link>
    </article>
  );
}

function SecondaryStory({ article }: { article: ArticleSummary }) {
  return (
    <article data-article-id={article.id} className="group">
      <Link href={`/article/${article.slug}`} className="block">
        <div className="relative">
          <Cover src={article.cover_image} alt="" sizes="340px" className="aspect-[16/10]" />
          {article.category === "review" && article.review_score !== null && (
            <ScoreChip score={article.review_score} className="absolute bottom-2 right-2" />
          )}
        </div>
        <p className="mt-3 flex items-center gap-3 text-xs">
          <CategoryLabel category={article.category} />
          <span className="text-muted">{timeAgo(article.published_at)}</span>
        </p>
        <h2 className="mt-2 font-display text-xl font-extrabold leading-snug text-ink">
          <CategoryBadge category={article.category} className="mr-2" />
          <span className="headline-link">{article.title}</span>
        </h2>
      </Link>
    </article>
  );
}

function CardSection({
  title,
  href,
  accent,
  articles,
}: {
  title: string;
  href: string;
  accent?: "news" | "review";
  articles: ArticleSummary[];
}) {
  return (
    <section className="mt-16">
      <SectionHeading title={title} href={href} accent={accent} />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
