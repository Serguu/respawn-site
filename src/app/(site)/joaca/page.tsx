import type { Metadata } from "next";
import { GameHub } from "@/components/games/GameHub";
import { GAMES, type GameKey } from "@/components/games/games";
import { getTriviaForGame } from "@/lib/trivia";

export const metadata: Metadata = {
  title: "Joacă – mini-jocuri gaming",
  description: "Mini-jocuri gratuite în browser: Snake, aim trainer și trivia despre jocuri video. Bate-ți recordul și provoacă-ți prietenii.",
  alternates: { canonical: "/joaca" },
};

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export default async function PlayPage({ searchParams }: PageProps<"/joaca">) {
  const requested = (await searchParams).joc;
  const keys = GAMES.map((g) => g.key) as GameKey[];
  // A random game on every visit, unless a link asks for a specific one.
  const initial = keys.includes(requested as GameKey) ? (requested as GameKey) : pickRandom(keys);
  const trivia = await getTriviaForGame();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <header className="mb-8 text-center">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.25em] text-accent">Pauză de articole</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-ink sm:text-5xl">Joacă</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted">
          Un mini-joc ales la întâmplare. Recordul tău rămâne salvat în browser.
        </p>
      </header>
      <GameHub initial={initial} trivia={trivia} />
    </div>
  );
}
