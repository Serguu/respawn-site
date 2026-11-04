import Link from "next/link";
import { countPublished, getPublishedArticles } from "@/lib/articles";
import type { Category } from "@/lib/types";
import { ArticleCard } from "./ArticleCard";
import { EmptyState } from "./EmptyState";

const PER_PAGE = 12;

/** Shared listing page for /news and /reviews. */
export async function CategoryListing({
  category,
  title,
  intro,
  basePath,
  page,
}: {
  category: Category;
  title: string;
  intro: string;
  basePath: string;
  page: number;
}) {
  const [articles, total] = await Promise.all([
    getPublishedArticles({ category, limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
    countPublished(category),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const bar = category === "news" ? "bg-news" : "bg-review";

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <header className="mb-10 border-b border-line pb-8">
        <div className={`mb-4 h-1.5 w-16 rounded-full ${bar}`} aria-hidden />
        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{intro}</p>
      </header>

      {articles.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} yet`} text="Check back soon." />
      ) : (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <ArticleCard key={article.id} article={article} priority={i < 3} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={n === 1 ? basePath : `${basePath}?page=${n}`}
              aria-current={n === page ? "page" : undefined}
              className={`grid size-10 place-items-center rounded-md font-display font-bold ${
                n === page ? "bg-accent text-accent-ink" : "bg-surface text-ink hover:bg-surface-2"
              }`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

export function parsePage(value: string | string[] | undefined) {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
