"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { startRun, submitScore, type SubmitResult } from "@/app/(site)/joaca/actions";
import { Skeleton } from "../Loading";
import type { GameKey } from "./games";

type Entry = { name: string; score: number; duration_ms: number; created_at: string };
type Period = "week" | "all";

const NAME_KEY = "respawn-player-name";
const SAVED_EVENT = "respawn-score-saved";

function readName() {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}
function subscribeName(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(SAVED_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(SAVED_EVENT, cb);
  };
}
/** The nickname this browser last saved a score with (to highlight it and prefill the form). */
export function usePlayerName() {
  return useSyncExternalStore(subscribeName, readName, () => "");
}

export function formatScore(game: GameKey, score: number, durationMs: number) {
  if (game === "aim") return `${score} ${score === 1 ? "țintă" : score < 20 ? "ținte" : "de ținte"}`;
  if (game === "trivia") return `${score}/10 · ${Math.round(durationMs / 1000)}s`;
  if (game === "runner") return `${score} m`;
  if (game === "flyer") return `${score} ${score === 1 ? "zid" : score < 20 ? "ziduri" : "de ziduri"}`;
  return `${score} p`;
}

/**
 * Tracks one round: asks the server for a signed ticket when it starts and measures how long it
 * lasted, so the score can be submitted to the leaderboard afterwards.
 */
export function useRun(game: GameKey) {
  const token = useRef<Promise<string | null> | null>(null);
  const startedAt = useRef(0);
  const [duration, setDuration] = useState(0);

  const begin = useCallback(() => {
    token.current = startRun(game).catch(() => null);
    startedAt.current = performance.now();
    setDuration(0);
  }, [game]);

  const end = useCallback(() => {
    const ms = Math.round(performance.now() - startedAt.current);
    setDuration(ms);
    return ms;
  }, []);

  return { begin, end, duration, token };
}

export function SaveScore({
  game,
  score,
  durationMs,
  token,
}: {
  game: GameKey;
  score: number;
  durationMs: number;
  token: React.RefObject<Promise<string | null> | null>;
}) {
  const remembered = usePlayerName();
  const [name, setName] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "saving" | SubmitResult>("idle");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = (name ?? remembered).trim();
    setState("saving");
    const ticket = (await token.current) ?? "";
    const result = await submitScore({ game, token: ticket, score, durationMs, name: finalName }).catch(
      (): SubmitResult => ({ ok: false, error: "Nu am putut salva scorul. Încearcă din nou." }),
    );
    if (result.ok) {
      try {
        localStorage.setItem(NAME_KEY, finalName);
      } catch {
        // not remembered, that's fine
      }
      window.dispatchEvent(new Event(SAVED_EVENT));
    }
    setState(result);
  };

  if (typeof state === "object" && state.ok) {
    return (
      <p role="status" className="mt-4 text-sm font-semibold text-score-great">
        Salvat! Locul #{state.rankWeek} săptămâna asta · #{state.rankAll} din toate timpurile.
      </p>
    );
  }

  return (
    <form onSubmit={save} className="mx-auto mt-4 flex max-w-xs flex-col gap-2 text-left">
      <label htmlFor={`lb-name-${game}`} className="font-display text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-muted">
        Intră în clasament
      </label>
      <div className="flex gap-2">
        <input
          id={`lb-name-${game}`}
          value={name ?? remembered}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={20}
          placeholder="Nickname"
          className="min-w-0 flex-1 rounded-md border border-line bg-bg px-3 py-2 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "saving"}
          className="rounded-md border border-accent px-3 py-2 font-display text-xs font-extrabold uppercase tracking-wider text-accent hover:bg-accent hover:text-accent-ink disabled:opacity-60"
        >
          {state === "saving" ? "…" : "Salvează"}
        </button>
      </div>
      {typeof state === "object" && !state.ok && (
        <p role="alert" className="text-xs text-score-bad">
          {state.error}
        </p>
      )}
    </form>
  );
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "week", label: "Săptămâna asta" },
  { value: "all", label: "Tot timpul" },
];

export function Leaderboard({ game, title }: { game: GameKey; title: string }) {
  const me = usePlayerName().toLowerCase();
  const [period, setPeriod] = useState<Period>("week");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(SAVED_EVENT, bump);
    return () => window.removeEventListener(SAVED_EVENT, bump);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // After saving a score, skip the short CDN cache so the new entry shows up right away.
    const bust = version ? `&v=${Date.now()}` : "";
    fetch(`/api/leaderboard?game=${game}&period=${period}${bust}`)
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data: { entries: Entry[] }) => !cancelled && setEntries(data.entries))
      .catch(() => !cancelled && setEntries([]));
    return () => {
      cancelled = true;
    };
  }, [game, period, version]);

  return (
    <section aria-labelledby={`lb-${game}`} className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id={`lb-${game}`} className="flex items-center gap-2 font-display text-lg font-black uppercase text-ink">
          <span className="text-accent" aria-hidden>
            ★
          </span>
          Clasament {title}
        </h2>
      </div>
      <div className="mt-3 flex gap-1 rounded-lg bg-bg p-1" role="tablist" aria-label="Perioada">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            role="tab"
            aria-selected={period === p.value}
            onClick={() => {
              setEntries(null);
              setPeriod(p.value);
            }}
            className={`flex-1 rounded-md px-2 py-1.5 font-display text-[0.7rem] font-extrabold uppercase tracking-wider ${
              period === p.value ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {entries === null ? (
        <div className="mt-3 space-y-2" role="status" aria-label="Se încarcă clasamentul">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-1.5">
              <Skeleton className="h-5 w-6" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          {period === "week" ? "Nimeni săptămâna asta. Locul 1 e liber!" : "Fii primul în clasament!"}
        </p>
      ) : (
        <ol className="mt-3 space-y-1">
          {entries.map((e, i) => {
            const mine = me && e.name.toLowerCase() === me;
            return (
              <li
                key={e.name}
                className={`flex items-center gap-3 rounded-md px-2 py-1.5 ${mine ? "bg-accent/15 ring-1 ring-accent/50" : ""}`}
              >
                <span
                  className={`w-6 shrink-0 text-center font-display font-black ${
                    i === 0 ? "text-accent" : i === 1 ? "text-ink-soft" : i === 2 ? "text-[#d9925b]" : "text-muted"
                  }`}
                >
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">
                  {e.name}
                  {mine && <span className="ml-1 text-xs font-normal text-accent">(tu)</span>}
                </span>
                <span className="shrink-0 font-display text-sm font-black tabular-nums text-ink-soft">
                  {formatScore(game, e.score, e.duration_ms)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
