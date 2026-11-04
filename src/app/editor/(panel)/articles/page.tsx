import Link from "next/link";
import { listArticles } from "@/lib/editor-data";
import { formatDate, formatNumber } from "@/lib/format";
import { ctr } from "@/lib/stats";

export default async function ArticlesPage() {
  const articles = await listArticles();

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-black text-ink">Articles</h1>
        <Link
          href="/editor/articles/new"
          className="rounded-md bg-accent px-4 py-2.5 font-display text-sm font-extrabold uppercase tracking-wider text-accent-ink hover:bg-accent-hover"
        >
          + New article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
          No articles yet. Write your first one!
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Title</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Views</th>
                <th className="px-4 py-3 text-right font-bold">Home CTR</th>
                <th className="px-4 py-3 font-bold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-surface/60">
                  <td className="px-4 py-3">
                    <Link href={`/editor/articles/${a.id}`} className="font-semibold text-ink hover:text-accent">
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={a.category === "review" ? "text-review" : "text-news"}>
                      {a.category === "review" ? "Review" : "News"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                        a.status === "published" ? "bg-score-great/15 text-score-great" : "bg-surface-2 text-muted"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(a.view_count)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{ctr(a.home_click_count, a.home_impression_count)}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(a.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
