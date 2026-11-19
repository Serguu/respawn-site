import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { EmptyState } from "@/components/EmptyState";
import { searchArticles } from "@/lib/articles";

export async function generateMetadata({ searchParams }: PageProps<"/cauta">): Promise<Metadata> {
  const q = String((await searchParams).q ?? "").trim();
  return {
    title: q ? `Rezultate pentru „${q.slice(0, 60)}”` : "Caută",
    // Search result pages shouldn't end up in Google's index.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/cauta">) {
  const raw = (await searchParams).q;
  const q = String(Array.isArray(raw) ? raw[0] : (raw ?? "")).trim().slice(0, 100);
  const results = q ? await searchArticles(q) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <header className="mb-10 border-b border-line pb-8">
        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-ink sm:text-5xl">Caută</h1>
        <form action="/cauta" role="search" className="mt-6 flex max-w-2xl gap-2">
          <label htmlFor="search-page-q" className="sr-only">
            Caută pe site
          </label>
          <input
            id="search-page-q"
            name="q"
            type="search"
            defaultValue={q}
            autoFocus={!q}
            placeholder="Joc, studio, subiect…"
            className="min-w-0 flex-1 rounded-md border border-line bg-surface px-4 py-3 text-lg text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-accent px-5 font-display text-sm font-extrabold uppercase tracking-wider text-accent-ink hover:bg-accent-hover"
          >
            Caută
          </button>
        </form>
        {q && (
          <p className="mt-4 text-muted" role="status">
            {results.length === 0
              ? "Niciun rezultat."
              : `${results.length} ${results.length === 1 ? "rezultat" : results.length < 20 ? "rezultate" : "de rezultate"} pentru „${q}”`}
          </p>
        )}
      </header>

      {q && results.length === 0 ? (
        <EmptyState title="N-am găsit nimic" text="Încearcă alte cuvinte sau numele jocului fără prescurtări." />
      ) : (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
