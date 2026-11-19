"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SaveScore, useRun } from "./Leaderboard";
import { primaryButton, ShareScore, Stat, useBestScore } from "./shared";

// Logical canvas size (portrait); scaled to fit.
const W = 480;
const H = 640;
const FLOOR = H - 40;
const PLAYER_X = 120;
const SIZE = 34;
const GRAVITY = 0.42;
const THRUST = -7.4;
const WALL_W = 64;
const SPACING = 240; // px between walls

type Phase = "ready" | "playing" | "over";
type Wall = { x: number; gapY: number; gap: number; passed: boolean };

function newWall(x: number, score: number): Wall {
  // The gap starts generous and tightens to 132 px; its position wanders but stays reachable.
  const gap = Math.max(132, 190 - score * 2.5);
  const min = 80;
  const max = FLOOR - gap - 60;
  return { x, gapY: min + Math.random() * (max - min), gap, passed: false };
}

export function FlyerGame() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const state = useRef({ y: H / 2.4, vy: 0, walls: [] as Wall[], speed: 2.8, score: 0, frame: 0, last: 0, scroll: 0 });
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(false);
  const { best, submit } = useBestScore("flyer");
  const run = useRun("flyer");
  const { begin: beginRun, end: endRun } = run;

  const draw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const scale = c.clientWidth / W;
    if (c.width !== Math.round(c.clientWidth * dpr)) {
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientWidth * (H / W) * dpr);
    }
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue("--color-accent").trim() || "#f8d435";
    const font = css.getPropertyValue("--font-archivo").trim() || "sans-serif";
    const s = state.current;

    // Night sky with a far skyline drifting slowly.
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#141514");
    sky.addColorStop(1, "#232523");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff1c";
    for (let i = 0; i < 50; i++) ctx.fillRect((i * 97 - s.scroll * 0.1 + W * 4) % W, (i * 61) % (FLOOR - 120), 2, 2);
    ctx.fillStyle = "#1b1c1b";
    for (let i = 0; i < 12; i++) {
      const bw = 50 + ((i * 37) % 40);
      const bh = 60 + ((i * 53) % 110);
      const x = ((i * 70 - s.scroll * 0.3) % (W + 120) + W + 120) % (W + 120) - 60;
      ctx.fillRect(x, FLOOR - bh, bw, bh);
    }

    // Firewalls: neon brick columns.
    for (const w of s.walls) {
      for (const [y0, y1] of [
        [0, w.gapY],
        [w.gapY + w.gap, FLOOR],
      ]) {
        ctx.save();
        ctx.shadowColor = "#f2695c";
        ctx.shadowBlur = 16;
        ctx.fillStyle = "#3a1714";
        ctx.fillRect(w.x, y0, WALL_W, y1 - y0);
        ctx.restore();
        ctx.strokeStyle = "#f2695c";
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x + 1, y0 + 1, WALL_W - 2, y1 - y0 - 2);
        ctx.strokeStyle = "#f2695c55";
        ctx.lineWidth = 1;
        for (let y = y0 + 14, row = 0; y < y1; y += 14, row++) {
          ctx.beginPath();
          ctx.moveTo(w.x + 2, y);
          ctx.lineTo(w.x + WALL_W - 2, y);
          ctx.stroke();
          const off = row % 2 ? WALL_W / 2 : WALL_W / 4;
          ctx.beginPath();
          ctx.moveTo(w.x + off, y - 14);
          ctx.lineTo(w.x + off, y);
          ctx.stroke();
        }
      }
      // Edge caps around the gap.
      ctx.fillStyle = "#f2695c";
      ctx.fillRect(w.x - 4, w.gapY - 10, WALL_W + 8, 10);
      ctx.fillRect(w.x - 4, w.gapY + w.gap, WALL_W + 8, 10);
    }

    // Floor.
    ctx.fillStyle = "#161716";
    ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.fillStyle = "#3a3d3a";
    ctx.fillRect(0, FLOOR, W, 2);
    for (let x = -(s.scroll % 32); x < W; x += 32) ctx.fillRect(x, FLOOR + 14, 16, 2);

    // Player: the "R" with a jetpack flame, tilting with its speed.
    ctx.save();
    ctx.translate(PLAYER_X + SIZE / 2, s.y + SIZE / 2);
    ctx.rotate(Math.max(-0.45, Math.min(0.9, s.vy / 12)));
    const flame = 8 + ((s.frame / 3) % 2) * 6 + (s.vy < 0 ? 8 : 0);
    ctx.fillStyle = "#6ea8fe";
    ctx.beginPath();
    ctx.moveTo(-SIZE / 2 + 4, SIZE / 2 - 4);
    ctx.lineTo(-SIZE / 2 - flame, SIZE / 2 + 2);
    ctx.lineTo(-SIZE / 2 + 4, SIZE / 2 - 14);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = accent;
    ctx.shadowBlur = 14;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.roundRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#1e1f1e";
    ctx.font = `900 24px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("R", 0, 2);
    ctx.restore();

    // Score.
    ctx.fillStyle = "#faf9f6";
    ctx.font = `900 44px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText(String(s.score), W / 2, 70);
  }, []);

  const reset = useCallback(() => {
    state.current = { y: H / 2.4, vy: 0, walls: [], speed: 2.8, score: 0, frame: 0, last: 0, scroll: 0 };
    draw();
  }, [draw]);

  const flap = useCallback(() => {
    state.current.vy = THRUST;
  }, []);

  const start = useCallback(() => {
    reset();
    const s = state.current;
    s.walls = [newWall(W + 80, 0)];
    s.vy = THRUST;
    setScore(0);
    setRecord(false);
    beginRun();
    setPhase("playing");
    wrap.current?.focus();
  }, [reset, beginRun]);

  useEffect(() => {
    if (phase !== "playing") return;
    let frame = 0;
    const tick = (t: number) => {
      const s = state.current;
      const dt = s.last ? Math.min(3, (t - s.last) / (1000 / 60)) : 1;
      s.last = t;
      s.frame += dt;
      s.vy = Math.min(11, s.vy + GRAVITY * dt);
      s.y += s.vy * dt;
      // The sky is a ceiling, not a wall: bump against it instead of losing the run.
      if (s.y < 0) {
        s.y = 0;
        s.vy = Math.max(0, s.vy);
      }
      s.speed = Math.min(4.2, 2.8 + s.score * 0.04);
      const dx = s.speed * dt;
      s.scroll += dx;
      for (const w of s.walls) w.x -= dx;
      s.walls = s.walls.filter((w) => w.x + WALL_W > -10);
      const lastWall = s.walls.at(-1);
      if (!lastWall || lastWall.x < W - SPACING) s.walls.push(newWall(W + 20, s.score));

      for (const w of s.walls) {
        if (!w.passed && w.x + WALL_W < PLAYER_X) {
          w.passed = true;
          s.score += 1;
          setScore(s.score);
        }
      }

      const pad = 4;
      const top = s.y + pad;
      const bottom = s.y + SIZE - pad;
      const left = PLAYER_X + pad;
      const right = PLAYER_X + SIZE - pad;
      const hitWall = s.walls.some(
        (w) => right > w.x - 4 && left < w.x + WALL_W + 4 && (top < w.gapY || bottom > w.gapY + w.gap),
      );
      const hitEdge = bottom >= FLOOR;

      draw();
      if (hitWall || hitEdge) {
        endRun();
        setRecord(submit(s.score));
        setPhase("over");
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, draw, submit, endRun]);

  useEffect(() => {
    reset();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [reset, draw]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return; // typing the nickname, pressing a button
    const k = e.key.toLowerCase();
    if (k === " " || k === "arrowup" || k === "w") {
      e.preventDefault();
      if (phase === "playing") flap();
      // else if (!e.repeat) start();
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3">
        <Stat label="Ziduri" value={score} />
        <Stat label="Record" value={best} />
      </div>

      <div
        ref={wrap}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          if (phase === "playing" && e.target === canvas.current) {
            e.preventDefault();
            flap();
          }
        }}
        aria-label="Respawn Fly. Space, săgeată sus sau click ca să urci."
        className="relative w-full max-w-[min(420px,calc(68vh*0.75))] select-none rounded-xl outline-none ring-accent/60 focus-visible:ring-2"
      >
        <canvas ref={canvas} className="aspect-[3/4] w-full touch-none rounded-xl border border-line" />
        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center overflow-y-auto rounded-xl bg-bg-deep/75 p-5 text-center backdrop-blur-[2px]">
            <div>
              {phase === "over" ? (
                <>
                  <p className="font-display text-4xl font-black text-accent">
                    {score} {score === 1 ? "zid" : score < 20 ? "ziduri" : "de ziduri"}
                  </p>
                  {record && <p className="mt-1 font-bold text-score-great">Record nou!</p>}
                </>
              ) : (
                <>
                  <p className="font-display text-3xl font-black text-ink">Respawn Fly</p>
                  <p className="mt-2 max-w-xs text-sm text-ink-soft">
                    Pornește jetpack-ul și strecoară-te prin firewall-uri. Space / ↑ / click = urci. Pe telefon: atinge
                    ecranul.
                  </p>
                </>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" className={primaryButton} onClick={start}>
                  {phase === "over" ? "Încă o dată" : "Start"}
                </button>
                {phase === "over" && score > 0 && (
                  <ShareScore text={`Am trecut de ${score} firewall-uri în Respawn Fly pe RespawnCentral. Mă bați?`} />
                )}
              </div>
              {phase === "over" && score > 0 && (
                <SaveScore game="flyer" score={score} durationMs={run.duration} token={run.token} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
