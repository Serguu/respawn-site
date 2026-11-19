"use client";

import { useState } from "react";
import { primaryButton, ShareScore, Stat, useBestScore } from "./shared";

export type TriviaItem = { question: string; answers: string[]; correct: number };

const ROUND = 10;
const LETTERS = ["A", "B", "C", "D"];

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Picks the round's questions and shuffles each one's answers, keeping track of the right one. */
function makeRound(bank: TriviaItem[]) {
  return shuffle(bank)
    .slice(0, ROUND)
    .map((q) => {
      const order = shuffle(q.answers.map((_, i) => i));
      return { question: q.question, answers: order.map((i) => q.answers[i]), correct: order.indexOf(q.correct) };
    });
}

export function TriviaGame({ bank }: { bank: TriviaItem[] }) {
  const [round, setRound] = useState<TriviaItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(false);
  const { best, submit } = useBestScore("trivia");

  const total = Math.min(ROUND, bank.length);
  const done = round !== null && index >= round.length;

  const start = () => {
    setRound(makeRound(bank));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setRecord(false);
  };

  const choose = (i: number) => {
    if (!round || picked !== null) return;
    setPicked(i);
    if (i === round[index].correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (!round) return;
    const finalScore = score;
    setPicked(null);
    setIndex((n) => n + 1);
    if (index + 1 >= round.length) setRecord(submit(finalScore));
  };

  const card = "w-full max-w-2xl rounded-xl border border-line bg-surface p-6 sm:p-8";

  if (!round || done) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="flex gap-3">
          <Stat label="Record" value={`${best}/${total}`} />
        </div>
        <div className={`${card} text-center`}>
          {done ? (
            <>
              <p className="font-display text-5xl font-black text-accent">
                {score}/{round.length}
              </p>
              <p className="mt-2 text-ink-soft">
                {score === round.length
                  ? "Perfect! Ești o enciclopedie de gaming."
                  : score >= round.length * 0.7
                    ? "Foarte bine! Știi ce vorbești."
                    : score >= round.length * 0.4
                      ? "Nu-i rău. Mai încearcă o rundă!"
                      : "Respawn și încă o încercare?"}
                {record && <span className="mt-1 block font-bold text-score-great">Record nou!</span>}
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-3xl font-black text-ink">Trivia gaming</p>
              <p className="mt-2 text-ink-soft">
                {total} întrebări despre istoria jocurilor. Vezi câte știi.
              </p>
            </>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" className={primaryButton} onClick={start}>
              {done ? "Altă rundă" : "Start"}
            </button>
            {done && score > 0 && (
              <ShareScore text={`Am răspuns corect la ${score} din ${round.length} întrebări de gaming pe RespawnCentral. Tu câte știi?`} />
            )}
          </div>
        </div>
      </div>
    );
  }

  const q = round[index];
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3">
        <Stat label="Întrebarea" value={`${index + 1}/${round.length}`} />
        <Stat label="Corecte" value={score} />
      </div>
      <div className={card}>
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-bg" aria-hidden>
          <div className="h-full bg-accent transition-all" style={{ width: `${((index + (picked !== null ? 1 : 0)) / round.length) * 100}%` }} />
        </div>
        <h2 className="font-display text-2xl font-black leading-snug text-ink">{q.question}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {q.answers.map((a, i) => {
            const state =
              picked === null ? "idle" : i === q.correct ? "right" : i === picked ? "wrong" : "dim";
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={picked !== null}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left font-semibold transition-colors ${
                  state === "right"
                    ? "border-score-great bg-score-great/15 text-ink"
                    : state === "wrong"
                      ? "border-score-bad bg-score-bad/15 text-ink"
                      : state === "dim"
                        ? "border-line text-muted"
                        : "border-line text-ink hover:border-accent hover:bg-bg"
                }`}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-bg font-display text-sm font-black text-accent">
                  {LETTERS[i]}
                </span>
                {a}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <p role="status" className={picked === q.correct ? "font-bold text-score-great" : "font-bold text-score-bad"}>
              {picked === q.correct ? "Corect!" : `Greșit. Răspunsul corect: ${q.answers[q.correct]}`}
            </p>
            <button type="button" className={primaryButton} onClick={next} autoFocus>
              {index + 1 >= round.length ? "Vezi scorul" : "Următoarea"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
