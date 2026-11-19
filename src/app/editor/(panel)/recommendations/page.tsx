import Link from "next/link";
import { formatDate } from "@/lib/format";
import { getRecommendationsForEditor } from "@/lib/recommendations";
import { requireEditor } from "@/lib/session";
import type { RecommendationStatus } from "@/lib/types";
import { inputClass } from "../../ui";
import { moderateRecommendation } from "./actions";

const TABS: { status: RecommendationStatus; label: string }[] = [
  { status: "pending", label: "Waiting" },
  { status: "approved", label: "Approved" },
  { status: "rejected", label: "Rejected" },
];

export default async function RecommendationsAdminPage({ searchParams }: PageProps<"/editor/recommendations">) {
  await requireEditor();
  const raw = (await searchParams).status;
  const status = TABS.some((t) => t.status === raw) ? (raw as RecommendationStatus) : "pending";
  const items = await getRecommendationsForEditor(status);

  const button = (action: string, label: string, tone: string) => (
    <button type="submit" name="action" value={action} className={`rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${tone}`}>
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-ink">Recommendations</h1>
        <p className="mt-1 text-sm text-muted">
          Games suggested by visitors on{" "}
          <Link href="/recomandari" target="_blank" className="text-accent hover:underline">
            /recomandari ↗
          </Link>
          . Nothing appears on the site until you approve it.
        </p>
      </div>

      <nav className="flex gap-2" aria-label="Filter">
        {TABS.map((t) => (
          <Link
            key={t.status}
            href={`/editor/recommendations?status=${t.status}`}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              t.status === status ? "bg-accent text-accent-ink" : "text-ink-soft hover:bg-surface hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 && <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">Nothing here.</p>}

      <ul className="space-y-4">
        {items.map((r) => (
          <li key={r.id} className="rounded-xl border border-line bg-surface p-5">
            <form action={moderateRecommendation} className="space-y-3">
              <input type="hidden" name="id" value={r.id} />
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                <input name="game" defaultValue={r.game} aria-label="Game" className={`${inputClass} font-bold`} />
                <p className="text-xs text-muted sm:pt-3">
                  {r.platform || "—"} · {r.author_name || "anonymous"} · {formatDate(r.created_at)}
                  {status === "approved" && ` · ${r.votes} votes`}
                </p>
              </div>
              <textarea name="reason" defaultValue={r.reason} rows={3} aria-label="Why" className={inputClass} />
              <div className="flex flex-wrap gap-2">
                {status !== "approved" && button("approve", "Approve", "border-score-great text-score-great hover:bg-score-great hover:text-accent-ink")}
                {status !== "rejected" && button("reject", "Reject", "border-line text-ink-soft hover:border-score-bad hover:text-score-bad")}
                {status !== "pending" && button("pending", "Back to waiting", "border-line text-ink-soft hover:text-ink")}
                {button("edit", "Save edits", "border-line text-ink-soft hover:border-accent hover:text-accent")}
                {button("delete", "Delete", "ml-auto border-line text-muted hover:border-score-bad hover:text-score-bad")}
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
