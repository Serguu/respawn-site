"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SaveScore, useRun } from "./Leaderboard";
import { primaryButton, ShareScore, Stat, useBestScore } from "./shared";

const GRID = 20;
const START_SPEED = 130; // ms per step
const MIN_SPEED = 60;

type Point = { x: number; y: number };
type Phase = "ready" | "playing" | "paused" | "over";

const DIRS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function randomFood(snake: Point[]): Point {
  while (true) {
    const p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

export function SnakeGame() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const game = useRef({
    snake: [] as Point[],
    dir: { x: 1, y: 0 },
    queue: [] as Point[],
    food: { x: 0, y: 0 },
    speed: START_SPEED,
    last: 0,
    score: 0,
  });
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(false);
  const { best, submit } = useBestScore("snake");
  const run = useRun("snake");

  const draw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const size = c.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    if (c.width !== Math.round(size * dpr)) {
      c.width = Math.round(size * dpr);
      c.height = Math.round(size * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cell = size / GRID;
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue("--color-accent").trim() || "#f8d435";
    const font = css.getPropertyValue("--font-archivo").trim() || "sans-serif";

    // Board with a subtle checkerboard.
    ctx.fillStyle = "#161716";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#1c1d1c";
    for (let y = 0; y < GRID; y++)
      for (let x = (y % 2); x < GRID; x += 2) ctx.fillRect(x * cell, y * cell, cell, cell);

    const g = game.current;

    // Food: a glowing gem.
    const fx = g.food.x * cell + cell / 2;
    const fy = g.food.y * cell + cell / 2;
    ctx.save();
    ctx.shadowColor = "#6ea8fe";
    ctx.shadowBlur = cell * 0.8;
    ctx.fillStyle = "#6ea8fe";
    ctx.beginPath();
    ctx.moveTo(fx, fy - cell * 0.38);
    ctx.lineTo(fx + cell * 0.32, fy);
    ctx.lineTo(fx, fy + cell * 0.38);
    ctx.lineTo(fx - cell * 0.32, fy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Body, fading towards the tail.
    for (let i = g.snake.length - 1; i >= 1; i--) {
      const s = g.snake[i];
      ctx.globalAlpha = 0.35 + 0.55 * (1 - i / g.snake.length);
      ctx.fillStyle = accent;
      const pad = cell * 0.12;
      roundRect(ctx, s.x * cell + pad, s.y * cell + pad, cell - pad * 2, cell - pad * 2, cell * 0.25);
    }
    ctx.globalAlpha = 1;

    // Head: the RespawnCentral "R" logo.
    const h = g.snake[0];
    if (h) {
      const pad = cell * 0.02;
      ctx.save();
      ctx.shadowColor = accent;
      ctx.shadowBlur = cell * 0.6;
      ctx.fillStyle = accent;
      roundRect(ctx, h.x * cell + pad, h.y * cell + pad, cell - pad * 2, cell - pad * 2, cell * 0.22);
      ctx.restore();
      ctx.fillStyle = "#1e1f1e";
      ctx.font = `900 ${Math.round(cell * 0.72)}px ${font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("R", h.x * cell + cell / 2, h.y * cell + cell / 2 + cell * 0.04);
    }
  }, []);

  /** Puts a fresh snake on the board and draws it (no React state involved). */
  const setupBoard = useCallback(() => {
    const mid = Math.floor(GRID / 2);
    const snake = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];
    game.current = { snake, dir: { x: 1, y: 0 }, queue: [], food: randomFood(snake), speed: START_SPEED, last: 0, score: 0 };
    draw();
  }, [draw]);

  const reset = useCallback(() => {
    setupBoard();
    setScore(0);
    setRecord(false);
  }, [setupBoard]);

  const { begin: beginRun, end: endRun } = run;
  const start = useCallback(() => {
    reset();
    beginRun();
    setPhase("playing");
    wrap.current?.focus();
  }, [reset, beginRun]);

  const turn = useCallback((d: Point) => {
    const g = game.current;
    const lastDir = g.queue.at(-1) ?? g.dir;
    if (d.x === -lastDir.x && d.y === -lastDir.y) return; // no instant reverse
    if (d.x === lastDir.x && d.y === lastDir.y) return;
    if (g.queue.length < 3) g.queue.push(d);
  }, []);

  // Game loop.
  useEffect(() => {
    if (phase !== "playing") return;
    let frame = 0;
    const tick = (t: number) => {
      const g = game.current;
      if (!g.last) g.last = t;
      if (t - g.last >= g.speed) {
        g.last = t;
        if (g.queue.length) g.dir = g.queue.shift()!;
        const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
        const ate = head.x === g.food.x && head.y === g.food.y;
        const body = ate ? g.snake : g.snake.slice(0, -1);
        const dead =
          head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID || body.some((s) => s.x === head.x && s.y === head.y);
        if (dead) {
          draw();
          endRun();
          setRecord(submit(g.score));
          setPhase("over");
          return;
        }
        g.snake = [head, ...body];
        if (ate) {
          g.score += 10;
          g.speed = Math.max(MIN_SPEED, g.speed - 3);
          g.food = randomFood(g.snake);
          setScore(g.score);
        }
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, draw, submit, endRun]);

  // First paint + redraw on resize.
  useEffect(() => {
    setupBoard();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setupBoard, draw]);

  const onKey = (e: React.KeyboardEvent) => {
    // Keys typed into the nickname field (or pressed on a button) inside the board aren't game controls.
    if (e.target !== e.currentTarget) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (DIRS[key]) {
      e.preventDefault();
      if (phase === "ready") start();
      turn(DIRS[key]);
    } else if (key === " " || key === "p") {
      e.preventDefault();
      if (phase === "playing") setPhase("paused");
      else if (phase === "paused") {
        game.current.last = 0;
        setPhase("playing");
      } else start();
    }
  };

  // Swipe controls.
  const touch = useRef<Point | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    turn(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
  };

  const pad = (label: string, d: Point, arrow: string) => (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        if (phase !== "playing") start();
        turn(d);
      }}
      className="grid size-14 place-items-center rounded-xl border border-line bg-surface text-2xl text-ink active:bg-accent active:text-accent-ink"
    >
      {arrow}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3">
        <Stat label="Scor" value={score} />
        <Stat label="Record" value={best} />
      </div>

      <div
        ref={wrap}
        tabIndex={0}
        onKeyDown={onKey}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label="Tabla de joc Snake. Folosește săgețile sau WASD."
        className="relative w-full max-w-[min(480px,62vh)] touch-none rounded-xl outline-none ring-accent/60 focus-visible:ring-2"
      >
        <canvas ref={canvas} className="aspect-square w-full rounded-xl border border-line" />
        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center rounded-xl bg-bg-deep/75 p-6 text-center backdrop-blur-[2px]">
            <div>
              {phase === "over" ? (
                <>
                  <p className="font-display text-4xl font-black text-accent">Game over</p>
                  <p className="mt-2 text-ink-soft">
                    Ai făcut <span className="font-bold text-ink">{score}</span> puncte.
                    {record && <span className="mt-1 block font-bold text-score-great">Record nou!</span>}
                  </p>
                </>
              ) : phase === "paused" ? (
                <p className="font-display text-4xl font-black text-ink">Pauză</p>
              ) : (
                <>
                  <p className="font-display text-3xl font-black text-ink">Snake</p>
                  <p className="mt-2 max-w-xs text-sm text-ink-soft">
                    Adună cristalele, nu te lovi de margini sau de coadă. Săgeți / WASD, Space = pauză. Pe telefon:
                    glisează.
                  </p>
                </>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  className={primaryButton}
                  onClick={() => {
                    if (phase === "paused") {
                      game.current.last = 0;
                      setPhase("playing");
                      wrap.current?.focus();
                    } else start();
                  }}
                >
                  {phase === "over" ? "Încă o dată" : phase === "paused" ? "Continuă" : "Start"}
                </button>
                {phase === "over" && score > 0 && (
                  <ShareScore text={`Am făcut ${score} puncte la Snake pe RespawnCentral. Mă bați?`} />
                )}
              </div>
              {phase === "over" && score > 0 && (
                <SaveScore game="snake" score={score} durationMs={run.duration} token={run.token} />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 md:hidden" aria-label="Controale">
        <span />
        {pad("Sus", { x: 0, y: -1 }, "↑")}
        <span />
        {pad("Stânga", { x: -1, y: 0 }, "←")}
        {pad("Jos", { x: 0, y: 1 }, "↓")}
        {pad("Dreapta", { x: 1, y: 0 }, "→")}
      </div>
    </div>
  );
}
