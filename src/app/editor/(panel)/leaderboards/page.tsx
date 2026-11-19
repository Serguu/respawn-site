import Link from "next/link";
import { formatDate } from "@/lib/format";
import { GAME_IDS, getRecentScores, isGameId } from "@/lib/scores";
import { requireEditor } from "@/lib/session";
import { moderateScore } from "./actions";

const LABEL = { snake: "Snake", aim: "Aim trainer", trivia: "Trivia" } as const;

export default async function LeaderboardsAdminPage({ searchParams }: PageProps<"/editor/leaderboards">) {
  await requireEditor();
  const raw = (await searchParams).game;
  const game = isGameId(raw) ? raw : "snake";
  const scores = await getRecentScores(game);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-ink">Leaderboards</h1>
        <p className="mt-1 text-sm text-muted">
          Latest scores saved from{" "}
          <Link href="/joaca" target="_blank" className="text-accent hover:underline">
            /joaca ↗
          </Link>
          . Hide rude names or scores that look cheated; hidden ones disappear from the public boards.
        </p>
      </div>

      <nav className="flex gap-2" aria-label="Game">
        {GAME_IDS.map((g) => (
          <Link
            key={g}
            href={`/editor/leaderboards?game=${g}`}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              g === game ? "bg-accent text-accent-ink" : "text-ink-soft hover:bg-surface hover:text-ink"
            }`}
          >
            {LABEL[g]}
          </Link>
        ))}
      </nav>

      {scores.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">No scores yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Score</th>
                <th className="px-4 py-3 font-bold">Time</th>
                <th className="px-4 py-3 font-bold">When</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s.id} className={`border-t border-line ${s.hidden ? "opacity-50" : ""}`}>
                  <td className="px-4 py-2.5 font-semibold text-ink">
                    {s.name} {s.hidden && <span className="ml-1 text-xs font-normal text-score-bad">hidden</span>}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-ink">{s.score}</td>
                  <td className="px-4 py-2.5 tabular-nums text-muted">{Math.round(s.duration_ms / 1000)}s</td>
                  <td className="px-4 py-2.5 text-muted">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-2.5">
                    <form action={moderateScore} className="flex justify-end gap-2">
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" name="action" value={s.hidden ? "show" : "hide"} className="rounded-md border border-line px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink-soft hover:text-ink">
                        {s.hidden ? "Show" : "Hide"}
                      </button>
                      <button type="submit" name="action" value="delete" className="rounded-md border border-line px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-muted hover:border-score-bad hover:text-score-bad">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
