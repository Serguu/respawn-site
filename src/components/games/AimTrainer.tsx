"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SaveScore, useRun } from "./Leaderboard";
import { primaryButton, ShareScore, Stat, useBestScore } from "./shared";

const DURATION = 30; // seconds
const TARGETS_ON_SCREEN = 3;

type Target = { id: number; x: number; y: number; size: number; born: number };
type Phase = "ready" | "playing" | "over";

let nextId = 1;
/** Timing helper (event handlers and timers only). */
const now = () => performance.now();

function newTarget(elapsed: number): Target {
  // Targets shrink as the round goes on: 64px at the start, 34px at the end.
  const size = Math.round(64 - (30 * Math.min(elapsed, DURATION)) / DURATION);
  return { id: nextId++, x: 6 + Math.random() * 88, y: 8 + Math.random() * 84, size, born: now() };
}

export function AimTrainer() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [targets, setTargets] = useState<Target[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [pops, setPops] = useState<{ id: number; x: number; y: number }[]>([]);
  const [record, setRecord] = useState(false);
  const reactionTimes = useRef<number[]>([]);
  const hitsRef = useRef(0);
  const [avgReaction, setAvgReaction] = useState(0);
  const startedAt = useRef(0);
  const { best, submit } = useBestScore("aim");
  const run = useRun("aim");
  const { begin: beginRun, end: endRun } = run;

  const start = () => {
    reactionTimes.current = [];
    hitsRef.current = 0;
    startedAt.current = now();
    setHits(0);
    setMisses(0);
    setRecord(false);
    setTimeLeft(DURATION);
    setTargets(Array.from({ length: TARGETS_ON_SCREEN }, () => newTarget(0)));
    beginRun();
    setPhase("playing");
  };

  const finish = useCallback(
    (finalHits: number) => {
      const times = reactionTimes.current;
      setAvgReaction(times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0);
      endRun();
      setRecord(submit(finalHits));
      setTargets([]);
      setPhase("over");
    },
    [submit, endRun],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = setInterval(() => {
      const left = Math.max(0, DURATION - Math.floor((now() - startedAt.current) / 1000));
      setTimeLeft(left);
      if (left === 0) {
        clearInterval(timer);
        finish(hitsRef.current);
      }
    }, 200);
    return () => clearInterval(timer);
  }, [phase, finish]);

  const hit = (e: React.PointerEvent, t: Target) => {
    e.stopPropagation();
    reactionTimes.current.push(now() - t.born);
    hitsRef.current += 1;
    setHits(hitsRef.current);
    setPops((p) => [...p.slice(-6), { id: t.id, x: t.x, y: t.y }]);
    const elapsed = (now() - startedAt.current) / 1000;
    setTargets((list) => list.map((x) => (x.id === t.id ? newTarget(elapsed) : x)));
  };

  const accuracy = hits + misses === 0 ? 0 : Math.round((hits / (hits + misses)) * 100);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap justify-center gap-3">
        <Stat label="Timp" value={`${timeLeft}s`} />
        <Stat label="Lovite" value={hits} />
        <Stat label="Precizie" value={`${accuracy}%`} />
        <Stat label="Record" value={best} />
      </div>

      <div
        onPointerDown={() => phase === "playing" && setMisses((m) => m + 1)}
        className="relative aspect-[4/3] w-full max-w-[720px] cursor-crosshair touch-none select-none overflow-hidden rounded-xl border border-line bg-[radial-gradient(circle_at_50%_40%,#262826,#161716_70%)]"
        aria-label="Zona de țintă"
      >
        {/* Crosshair grid lines for atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(#ffffff08_1px,transparent_1px),linear-gradient(90deg,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

        {targets.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-label="Țintă"
            onPointerDown={(e) => hit(e, t)}
            style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.size, height: t.size }}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-[target-in_120ms_ease-out] rounded-full bg-[radial-gradient(circle,#f8d435_0_18%,#1e1f1e_19%_34%,#f2695c_35%_52%,#1e1f1e_53%_68%,#f8d435_69%)] shadow-[0_0_24px_#f8d43555]"
          />
        ))}
        {pops.map((p) => (
          <span
            key={p.id}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 animate-[pop_400ms_ease-out_forwards] font-display text-sm font-black text-accent"
          >
            +1
          </span>
        ))}

        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center bg-bg-deep/75 p-6 text-center backdrop-blur-[2px]">
            <div>
              {phase === "over" ? (
                <>
                  <p className="font-display text-4xl font-black text-accent">{hits} ținte</p>
                  <p className="mt-2 text-ink-soft">
                    Precizie {accuracy}% · reacție medie {avgReaction} ms
                    {record && <span className="mt-1 block font-bold text-score-great">Record nou!</span>}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-3xl font-black text-ink">Aim trainer</p>
                  <p className="mt-2 max-w-sm text-sm text-ink-soft">
                    Lovește cât mai multe ținte în {DURATION} de secunde. Țintele se micșorează, iar ratările îți
                    scad precizia.
                  </p>
                </>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" className={primaryButton} onClick={start}>
                  {phase === "over" ? "Încă o rundă" : "Start"}
                </button>
                {phase === "over" && hits > 0 && (
                  <ShareScore text={`Am lovit ${hits} ținte în 30 de secunde (${accuracy}% precizie) pe RespawnCentral. Mă bați?`} />
                )}
              </div>
              {phase === "over" && hits > 0 && (
                <SaveScore game="aim" score={hits} durationMs={run.duration} token={run.token} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
