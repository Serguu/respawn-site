import Link from "next/link";
import { getDashboardTotals, listArticles } from "@/lib/editor-data";
import { formatNumber } from "@/lib/format";
import { ctr } from "@/lib/stats";

export default async function DashboardPage() {
  const [totals, articles] = await Promise.all([getDashboardTotals(), listArticles()]);
  const published = articles.filter((a) => a.status === "published");
  const byViews = [...published].sort((a, b) => b.view_count - a.view_count);
  const top = byViews.slice(0, 5);
  const maxViews = Math.max(1, ...top.map((a) => a.view_count));

  return (
    <>
      <h1 className="mb-6 font-display text-2xl font-black text-ink">Dashboard</h1>

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total views" value={formatNumber(totals.views)} note="All time, unique per visitor/day" />
        <Stat label="Views · last 7 days" value={formatNumber(totals.views7d)} />
        <Stat
          label="Homepage CTR"
          value={ctr(totals.clicks, totals.impressions)}
          note={`${formatNumber(totals.clicks)} clicks / ${formatNumber(totals.impressions)} impressions`}
        />
        <Stat label="Articles" value={String(totals.published)} note={`${totals.drafts} draft${totals.drafts === 1 ? "" : "s"}`} />
      </dl>

      <div className="mt-8 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="mb-5 font-display text-sm font-extrabold uppercase tracking-wider text-ink">Most read</h2>
          {top.length === 0 ? (
            <p className="text-sm text-muted">No published articles yet.</p>
          ) : (
            <ol className="space-y-4">
              {top.map((a, i) => (
                <li key={a.id}>
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 font-display text-lg font-black text-accent">{i + 1}</span>
                    <Link href={`/editor/articles/${a.id}`} className="flex-1 truncate text-sm font-semibold text-ink hover:text-accent">
                      {a.title}
                    </Link>
                    <span className="text-sm tabular-nums text-ink-soft">{formatNumber(a.view_count)}</span>
                  </div>
                  <div className="ml-8 mt-1.5 h-1.5 rounded-full bg-bg">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(a.view_count / maxViews) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="min-w-0 rounded-xl border border-line bg-surface">
          <h2 className="p-5 pb-3 font-display text-sm font-extrabold uppercase tracking-wider text-ink">
            Per-article performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-2 font-bold">Article</th>
                  <th className="px-3 py-2 text-right font-bold">Views</th>
                  <th className="px-3 py-2 text-right font-bold">Home impr.</th>
                  <th className="px-3 py-2 text-right font-bold">Home clicks</th>
                  <th className="px-5 py-2 text-right font-bold">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {byViews.map((a) => (
                  <tr key={a.id}>
                    <td className="max-w-xs truncate px-5 py-2.5">
                      <span className={`mr-2 text-xs font-bold ${a.category === "review" ? "text-review" : "text-news"}`}>
                        {a.category === "review" ? "REV" : "NEWS"}
                      </span>
                      <Link href={`/editor/articles/${a.id}`} className="text-ink hover:text-accent">
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatNumber(a.view_count)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">{formatNumber(a.home_impression_count)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">{formatNumber(a.home_click_count)}</td>
                    <td className="px-5 py-2.5 text-right font-semibold tabular-nums">
                      {ctr(a.home_click_count, a.home_impression_count)}
                    </td>
                  </tr>
                ))}
                {byViews.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-muted">
                      Publish an article to start collecting stats.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-5 py-3 text-xs text-muted">
            CTR = clicks on a homepage card ÷ times the card was seen on the homepage.
          </p>
        </section>
      </div>
    </>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <dt className="text-xs font-bold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-2 font-display text-3xl font-black text-ink tabular-nums">{value}</dd>
      {note && <dd className="mt-1 text-xs text-muted">{note}</dd>}
    </div>
  );
}
