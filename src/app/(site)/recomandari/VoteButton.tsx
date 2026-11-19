"use client";

import { useState, useTransition } from "react";
import { toggleVote } from "./actions";

export function VoteButton({ id, votes, voted }: { id: string; votes: number; voted: boolean }) {
  const [state, setState] = useState({ votes, voted });
  const [pending, start] = useTransition();

  const click = () =>
    start(async () => {
      // Optimistic: flip right away, then settle on what the server says.
      setState((s) => ({ voted: !s.voted, votes: s.votes + (s.voted ? -1 : 1) }));
      const result = await toggleVote(id);
      if (result) setState(result);
      else setState({ votes, voted });
    });

  return (
    <button
      type="button"
      onClick={click}
      disabled={pending}
      aria-pressed={state.voted}
      aria-label={state.voted ? "Retrage votul" : "Votează recomandarea"}
      className={`flex shrink-0 flex-col items-center rounded-lg border px-3 py-2 font-display transition-colors ${
        state.voted
          ? "border-accent bg-accent text-accent-ink"
          : "border-line bg-bg text-ink-soft hover:border-accent hover:text-accent"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 15l6-6 6 6" />
      </svg>
      <span className="text-lg font-black leading-none">{state.votes}</span>
    </button>
  );
}
