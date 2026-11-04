import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { formatDate, formatNumber, readingTime } from "@/lib/format";
import { CategoryBadge, ScoreRing } from "./Badges";
import { ReviewSummary } from "./ReviewSummary";

/** The clean reading layout shared by the public article page and the editor preview. */
export function ArticleView({ article }: { article: Article }) {
  const isReview = article.category === "review";
  const hasScore = isReview && article.review_score !== null;

  return (
    <>
      <header className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
        <Link
          href={isReview ? "/reviews" : "/news"}
          className="inline-block font-display text-base hover:opacity-80"
          aria-label={`Back to ${isReview ? "Reviews" : "News"}`}
        >
          <CategoryBadge category={article.category} />
        </Link>

        <div className={hasScore ? "mt-4 flex items-start gap-6" : "mt-4"}>
          <h1 className="flex-1 font-display text-4xl font-black leading-[1.08] tracking-tight text-ink sm:text-5xl">
            {article.title}
          </h1>
          {hasScore && (
            <div className="hidden shrink-0 sm:block">
              <ScoreRing score={article.review_score!} />
            </div>
          )}
        </div>

        {article.excerpt && <p className="mt-5 text-xl leading-relaxed text-ink-soft">{article.excerpt}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-4 text-sm text-muted">
          {article.author_name && (
            <span>
              By <span className="font-semibold text-ink">{article.author_name}</span>
            </span>
          )}
          {article.published_at && (
            <time dateTime={new Date(article.published_at).toISOString()}>{formatDate(article.published_at)}</time>
          )}
          <span>{readingTime(article.content_html)} min read</span>
          <span className="inline-flex items-center gap-1.5" title="Total views">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {formatNumber(article.view_count)} {article.view_count === 1 ? "view" : "views"}
          </span>
          {hasScore && (
            <span className="font-display font-black text-accent sm:hidden">
              Score {article.review_score!.toFixed(1)}/10
            </span>
          )}
        </div>
      </header>

      {article.cover_image && (
        <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-surface">
            <Image src={article.cover_image} alt="" fill priority sizes="(min-width: 1024px) 1000px, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="article-body mt-10" dangerouslySetInnerHTML={{ __html: article.content_html }} />
        {isReview && <ReviewSummary article={article} />}
      </div>
    </>
  );
}
