"use client";

import { useState } from "react";
import { AimTrainer } from "./AimTrainer";
import { FlyerGame } from "./FlyerGame";
import { RunnerGame } from "./RunnerGame";
import { GAMES, type GameKey } from "./games";
import { Leaderboard } from "./Leaderboard";
import { SnakeGame } from "./SnakeGame";
import { TriviaGame, type TriviaItem } from "./TriviaGame";


export function GameHub({ initial, trivia }: { initial: GameKey; trivia: TriviaItem[] }) {
  const [game, setGame] = useState<GameKey>(initial);

  const pick = (key: GameKey) => {
    setGame(key);
    // Shareable link to the current game, without a navigation.
    window.history.replaceState(null, "", `/joaca?joc=${key}`);
  };
  const random = () => {
    const others = GAMES.filter((g) => g.key !== game);
    pick(others[Math.floor(Math.random() * others.length)].key);
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Alege jocul">
        {GAMES.map((g) => (
          <button
            key={g.key}
            type="button"
            role="tab"
            aria-selected={game === g.key}
            onClick={() => pick(g.key)}
            className={`rounded-full border px-4 py-2 font-display text-xs font-extrabold uppercase tracking-wider transition-colors ${
              game === g.key ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-soft hover:border-ink-soft hover:text-ink"
            }`}
          >
            {g.label}
          </button>
        ))}
        <button
          type="button"
          onClick={random}
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-line px-4 py-2 font-display text-xs font-extrabold uppercase tracking-wider text-muted hover:border-accent hover:text-accent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
          </svg>
          Joc random
        </button>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div role="tabpanel" className="min-w-0">
          {game === "snake" && <SnakeGame />}
          {game === "aim" && <AimTrainer />}
          {game === "trivia" && <TriviaGame bank={trivia} />}
          {game === "runner" && <RunnerGame />}
          {game === "flyer" && <FlyerGame />}
        </div>
        <Leaderboard game={game} title={GAMES.find((g) => g.key === game)!.label} />
      </div>
    </div>
  );
}
