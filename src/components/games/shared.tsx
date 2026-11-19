"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

const BEST_EVENT = "respawn-best-change";

function subscribeBest(cb: () => void) {
  window.addEventListener("storage", cb); // other tabs
  window.addEventListener(BEST_EVENT, cb); // this tab
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(BEST_EVENT, cb);
  };
}

/** Personal best kept in this browser only (nothing is sent anywhere). */
export function useBestScore(game: string, higherIsBetter = true) {
  const key = `respawn-best-${game}`;
  const read = useCallback(() => {
    try {
      const v = Number(localStorage.getItem(key));
      return Number.isFinite(v) && v > 0 ? v : 0;
    } catch {
      return 0;
    }
  }, [key]);
  const best = useSyncExternalStore(subscribeBest, read, () => 0);

  /** Saves the score if it beats the best one. Returns true for a new record. */
  const submit = useCallback(
    (score: number) => {
      const current = read();
      const better = higherIsBetter ? score > current : score > 0 && (current === 0 || score < current);
      if (!better) return false;
      try {
        localStorage.setItem(key, String(score));
        window.dispatchEvent(new Event(BEST_EVENT));
      } catch {
        // storage blocked: the record just isn't remembered
      }
      return true;
    },
    [higherIsBetter, key, read],
  );

  return { best, submit };
}

/** "Challenge a friend" button: native share sheet on phones, copy to clipboard elsewhere. */
export function ShareScore({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}/joaca`;
    const w = window as Window & { dataLayer?: unknown[] };
    w.dataLayer?.push({ event: "share", method: "game_score", content_type: "game" });
    if (navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch {
        // cancelled
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiază:", `${text} ${url}`);
    }
  };
  return (
    <button
      type="button"
      onClick={share}
      className="rounded-md border border-line bg-surface px-4 py-2.5 font-display text-sm font-extrabold uppercase tracking-wider text-ink hover:border-accent hover:text-accent"
    >
      {copied ? "Copiat!" : "Provoacă un prieten"}
    </button>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-line bg-bg px-4 py-2 text-center">
      <p className="font-display text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="font-display text-2xl font-black tabular-nums text-ink">{value}</p>
    </div>
  );
}

export const primaryButton =
  "rounded-md bg-accent px-5 py-2.5 font-display text-sm font-extrabold uppercase tracking-wider text-accent-ink hover:bg-accent-hover";
