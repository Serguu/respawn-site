import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { EmptyState } from "@/components/EmptyState";
import { timeAgo } from "@/lib/format";
import { getApprovedRecommendations, getVotedIds, PLATFORMS } from "@/lib/recommendations";
import { stableVisitorHash } from "@/lib/visitor";
import { SuggestForm } from "./SuggestForm";
import { VoteButton } from "./VoteButton";

export const metadata: Metadata = {
  title: "Recomandări de jocuri de la cititori",
  description:
    "Jocuri recomandate de comunitatea RespawnCentral: trimite-ți și tu recomandarea și votează jocurile care merită încercate.",
  alternates: { canonical: "/recomandari" },
};

export default async function RecommendationsPage({ searchParams }: PageProps<"/recomandari">) {
  const sort = (await searchParams).sort === "noi" ? "new" : "top";
  const [items, voted] = await Promise.all([
    getApprovedRecommendations({ sort, limit: 100 }),
    getVotedIds(stableVisitorHash(await headers())),
  ]);

  const tab = (value: "top" | "new", label: string, href: string) => (
    <Link
      href={href}
      scroll={false}
      aria-current={sort === value ? "page" : undefined}
      className={`rounded-full border px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider ${
        sort === value ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-soft hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <header className="mb-10 border-b border-line pb-8">
        <div className="mb-4 h-1.5 w-16 rounded-full bg-score-great" aria-hidden />
        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-ink sm:text-5xl">Recomandări</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Jocurile pe care le recomandă cititorii noștri. Votează-le pe cele care merită și trimite-ți și tu
          recomandarea.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="list-heading">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 id="list-heading" className="font-display text-xl font-black uppercase text-ink">
              {items.length} {items.length === 1 ? "recomandare" : "recomandări"}
            </h2>
            <nav aria-label="Sortare" className="flex gap-2">
              {tab("top", "Cele mai votate", "/recomandari")}
              {tab("new", "Cele mai noi", "/recomandari?sort=noi")}
            </nav>
          </div>

          {items.length === 0 ? (
            <EmptyState title="Încă nu sunt recomandări" text="Fii primul care recomandă un joc!" />
          ) : (
            <ol className="space-y-4">
              {items.map((r, i) => (
                <li
                  key={r.id}
                  className="flex gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/50"
                >
                  <VoteButton id={r.id} votes={r.votes} voted={voted.has(r.id)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {sort === "top" && i < 3 && r.votes > 0 && (
                        <span className="font-display text-sm font-black text-accent">#{i + 1}</span>
                      )}
                      <h3 className="font-display text-xl font-black text-ink">{r.game}</h3>
                      {r.platform && (
                        <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
                          {r.platform}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-soft">{r.reason}</p>
                    <p className="mt-3 text-xs text-muted">
                      Recomandat de <span className="font-semibold text-ink-soft">{r.author_name || "un cititor"}</span>{" "}
                      · {timeAgo(r.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl font-black text-ink">Recomandă un joc</h2>
            <p className="mt-1 mb-5 text-sm text-muted">
              Îl citim, îl aprobăm și apare în listă. Fără cont, fără spam.
            </p>
            <SuggestForm platforms={PLATFORMS} />
          </div>
        </aside>
      </div>
    </div>
  );
}
