import type { Metadata } from "next";
import Link from "next/link";
import { getMostRead, getPublishedArticles } from "@/lib/articles";
import type { ArticleSummary, Category, Recommendation } from "@/lib/types";
import { CATEGORIES, CATEGORY_ORDER, isCategory } from "@/lib/categories";
import { getTopRecommendationsSafe } from "@/lib/recommendations";
import { timeAgo } from "@/lib/format";
import { ArticleCard, RankedItem } from "@/components/ArticleCard";
import { CategoryBadge, CategoryLabel, ScoreChip } from "@/components/Badges";
import { CategoryTabs } from "@/components/CategoryTabs";
import { Cover } from "@/components/Cover";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeading } from "@/components/SectionHeading";
import { JsonLd } from "@/components/JsonLd";
import { HomeTracker } from "@/components/trackers";
import { SITE } from "@/lib/site";

// ?category=… is a filtered view of the homepage, so it points search engines at "/".
export const metadata: Metadata = {
  // A page's own `alternates` replaces the layout's, so the RSS link is repeated here.
  alternates: { canonical: "/", types: { "application/rss+xml": [{ url: "/rss.xml", title: SITE.name }] } },
};

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const param = (await searchParams).category;
  const category: Category | undefined = isCategory(param) ? param : undefined;

  const [latest, mostRead, perCategory, recommendations] = await Promise.all([
    getPublishedArticles({ category, limit: 5 }),
    getMostRead(5, category),
    category
      ? Promise.resolve([])
      : Promise.all(CATEGORY_ORDER.map((c) => getPublishedArticles({ category: c, limit: 4 }))),
    category ? Promise.resolve([]) : getTopRecommendationsSafe(3),
  ]);
  const more = category ? await getPublishedArticles({ category, limit: 8, offset: 5 }) : [];

  const [featured, secondary, ...rest] = latest;
  // Each "Ultimele …" row is simply that category's newest articles. (It used to skip ones already shown
  // at the top, which hid the newest story of a category and could empty a row entirely.)
  const sections = perCategory.map((articles, i) => ({ category: CATEGORY_ORDER[i], articles }));

  return (
    <HomeTracker>
      <JsonLd data={siteStructuredData()} />
      {!category && latest.length > 1 && <Ticker articles={latest} />}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="sr-only">Ultimele știri gaming, recenzii și articole</h1>
          <CategoryTabs active={category} />
        </div>

        {!featured ? (
          <EmptyState title="Încă nu am publicat nimic" text="Articole noi sunt pe drum. Revino în curând!" />
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
                  <h2 id="most-read" className="mb-5 flex items-center gap-2 font-display text-xl font-black uppercase tracking-tight text-ink">
                    <span className="text-accent" aria-hidden>▲</span> Cele mai citite
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

        {sections.map(
          (s) =>
            s.articles.length > 0 && (
              <CardSection
                key={s.category}
                title={`Ultimele ${CATEGORIES[s.category].label.toLowerCase()}`}
                href={CATEGORIES[s.category].path}
                accent={s.category}
                articles={s.articles}
              />
            ),
        )}
        {more.length > 0 && category && (
          <CardSection
            title={`Mai multe ${CATEGORIES[category].label.toLowerCase()}`}
            href={CATEGORIES[category].path}
            accent={category}
            articles={more}
          />
        )}

        {!category && <CommunityBand recommendations={recommendations} />}
      </div>
    </HomeTracker>
  );
}

/** "Ultima oră" strip: latest headlines scrolling sideways (paused on hover / for reduced motion). */
function Ticker({ articles }: { articles: ArticleSummary[] }) {
  const items = (copy: boolean) =>
    articles.map((a) => (
    <Link
      key={a.id}
      href={`/articol/${a.slug}`}
      tabIndex={copy ? -1 : undefined}
      className="inline-flex shrink-0 items-center gap-3 px-6 text-sm font-semibold text-ink-soft hover:text-accent"
    >
      <span className={`size-1.5 rounded-full ${CATEGORIES[a.category].bg}`} aria-hidden />
      {a.title}
    </Link>
    ));
  return (
    <div className="group flex items-stretch overflow-hidden border-b border-line bg-bg-deep">
      <span className="z-10 flex shrink-0 items-center gap-2 bg-accent px-4 py-2 font-display text-xs font-black uppercase tracking-wider text-accent-ink">
        <span className="size-2 animate-pulse rounded-full bg-accent-ink" aria-hidden />
        Ultima oră
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-track flex w-max py-2 group-hover:[animation-play-state:paused]">
          {items(false)}
          {/* Second copy makes the loop seamless; hidden from screen readers and keyboard. */}
          <span aria-hidden className="flex">
            {items(true)}
          </span>
        </div>
      </div>
    </div>
  );
}

function CommunityBand({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <section className="mt-20 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]" aria-label="Comunitate">
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-score-great">De la cititori</p>
            <h2 className="mt-1 font-display text-2xl font-black uppercase text-ink">Recomandările comunității</h2>
          </div>
          <Link
            href="/recomandari"
            className="font-display text-xs font-extrabold uppercase tracking-wider text-muted hover:text-accent"
          >
            Vezi toate →
          </Link>
        </div>
        {recommendations.length === 0 ? (
          <p className="mt-6 text-ink-soft">
            Ai un joc pe care toată lumea ar trebui să-l încerce?{" "}
            <Link href="/recomandari" className="font-semibold text-accent hover:underline">
              Recomandă-l aici
            </Link>
            .
          </p>
        ) : (
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {recommendations.map((r, i) => (
              <li key={r.id} className="rounded-xl border border-line bg-bg p-4">
                <p className="font-display text-sm font-black text-accent">
                  {r.votes > 0 ? `#${i + 1} · ▲ ${r.votes} ${r.votes === 1 ? "vot" : "voturi"}` : "Nou"}
                </p>
                <p className="mt-1 font-display text-lg font-black text-ink">{r.game}</p>
                <p className="mt-1 line-clamp-3 text-sm text-muted">{r.reason}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Link
        href="/joaca"
        className="group relative overflow-hidden rounded-2xl border border-accent/40 bg-[radial-gradient(circle_at_80%_10%,#f8d43533,transparent_55%),radial-gradient(circle_at_10%_90%,#c38bff33,transparent_50%)] bg-surface p-6 sm:p-8"
      >
        <SnakeArt />
        <p className="relative font-display text-xs font-extrabold uppercase tracking-[0.2em] text-accent">Pauză?</p>
        <h2 className="relative mt-1 font-display text-3xl font-black uppercase text-ink">Joacă un mini-joc</h2>
        <p className="relative mt-2 max-w-[16rem] text-sm text-ink-soft">Snake, aim trainer sau trivia. Bate-ți recordul.</p>
        <span className="relative mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 font-display text-sm font-extrabold uppercase tracking-wider text-accent-ink transition-transform group-hover:translate-x-1">
          Joacă acum →
        </span>
      </Link>
    </section>
  );
}

/** Decorative snake with the "R" head for the games teaser. */
function SnakeArt() {
  const body = [
    [7, 1], [6, 1], [5, 1], [5, 2], [5, 3], [4, 3], [3, 3],
  ];
  return (
    <svg viewBox="0 0 9 5" className="absolute bottom-4 right-5 w-40 opacity-90 transition-transform group-hover:-translate-x-2" aria-hidden>
      {body.map(([x, y], i) => (
        <rect key={i} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.2} fill="#f8d435" opacity={0.85 - i * 0.09} />
      ))}
      <rect x={8} y={1} width={1} height={1} rx={0.22} fill="#f8d435" />
      <text x={8.5} y={1.78} textAnchor="middle" fontSize={0.8} fontWeight={900} fill="#1e1f1e" fontFamily="var(--font-archivo)">
        R
      </text>
      <path d="M1.5 2.6l.4.4-.4.4-.4-.4z" fill="#6ea8fe" />
    </svg>
  );
}

/** Tells Google the site's name (shown above results) and who publishes it. */
function siteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: `${SITE.url}/`,
        name: SITE.name,
        description: SITE.description,
        inLanguage: "ro-RO",
        publisher: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        url: `${SITE.url}/`,
        logo: { "@type": "ImageObject", url: `${SITE.url}/apple-icon` },
      },
    ],
  };
}

function FeaturedStory({ article }: { article: ArticleSummary }) {
  return (
    <article data-article-id={article.id} className="group">
      <Link href={`/articol/${article.slug}`} className="relative block overflow-hidden rounded-xl">
        <Cover
          src={article.cover_image}
          alt=""
          sizes="(min-width: 1024px) 860px, 100vw"
          priority
          className="aspect-[4/3] rounded-xl sm:aspect-[16/9]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/60 to-transparent" aria-hidden />
        {article.category === "review" && article.review_score !== null && (
          <ScoreChip score={article.review_score} className="absolute right-4 top-4 size-14 text-2xl" />
        )}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <h2 className="font-display text-2xl font-black leading-[1.1] text-ink drop-shadow sm:text-4xl">
            <CategoryBadge category={article.category} className="mr-2" />
            <span className="headline-link">{article.title}</span>
          </h2>
          {article.excerpt && (
            <p className="mt-3 hidden max-w-2xl line-clamp-2 leading-relaxed text-ink-soft sm:block">{article.excerpt}</p>
          )}
          <p className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <CategoryLabel category={article.category} />
            <span className="text-ink-soft">{timeAgo(article.published_at)}</span>
            {article.author_name && <span className="text-ink-soft">de {article.author_name}</span>}
          </p>
        </div>
      </Link>
    </article>
  );
}

function SecondaryStory({ article }: { article: ArticleSummary }) {
  return (
    <article data-article-id={article.id} className="group">
      <Link href={`/articol/${article.slug}`} className="block">
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
  accent?: Category;
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
