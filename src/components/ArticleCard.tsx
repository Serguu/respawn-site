import Link from "next/link";
import type { ArticleSummary } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { CategoryBadge, CategoryLabel, ScoreChip } from "./Badges";
import { Cover } from "./Cover";

/** Standard grid card: image, meta line, badge + headline, excerpt. */
export function ArticleCard({ article, priority = false }: { article: ArticleSummary; priority?: boolean }) {
  return (
    <article data-article-id={article.id} className="group">
      <Link href={`/article/${article.slug}`} className="block">
        <div className="relative">
          <Cover
            src={article.cover_image}
            alt=""
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="aspect-[16/9]"
          />
          {article.category === "review" && article.review_score !== null && (
            <ScoreChip score={article.review_score} className="absolute bottom-2 right-2" />
          )}
        </div>
        <p className="mt-3 flex items-center gap-3 text-xs">
          <CategoryLabel category={article.category} />
          <time className="text-muted" dateTime={article.published_at?.toISOString()}>
            {timeAgo(article.published_at)}
          </time>
        </p>
        <h3 className="mt-2 font-display text-lg font-extrabold leading-snug text-ink">
          <CategoryBadge category={article.category} className="mr-2" />
          <span className="headline-link">{article.title}</span>
        </h3>
        {article.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{article.excerpt}</p>}
      </Link>
    </article>
  );
}

/** Numbered compact item for "Most Read" lists. */
export function RankedItem({ article, rank }: { article: ArticleSummary; rank: number }) {
  return (
    <li data-article-id={article.id} className="group">
      <Link href={`/article/${article.slug}`} className="flex gap-3">
        <span className="w-6 shrink-0 font-display text-2xl font-black leading-none text-accent">{rank}</span>
        <span className="font-display text-[0.95rem] font-bold leading-snug text-ink">
          <CategoryBadge category={article.category} className="mr-2" />
          <span className="headline-link">{article.title}</span>
        </span>
      </Link>
    </li>
  );
}
