"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SaveScore, useRun } from "./Leaderboard";
import { primaryButton, ShareScore, Stat, useBestScore } from "./shared";

// Logical canvas size; it's scaled to fit the page width.
const W = 800;
const H = 240;
const GROUND = 205;
const PLAYER_X = 70;
const GRAVITY = 0.62;
const JUMP_VELOCITY = -11.6;
const START_SPEED = 6.2; // px per frame at 60 fps
const MAX_SPEED = 15;

type Phase = "ready" | "playing" | "over";
type Obstacle = { kind: "bug" | "spike" | "drone"; x: number; y: number; w: number; h: number };

function makeObstacle(speed: number): Obstacle {
  const roll = Math.random();
  // Drones (duck under or jump over) only once the run has picked up a bit of speed.
  if (speed > 8 && roll < 0.25) return { kind: "drone", x: W + 20, y: GROUND - 58, w: 40, h: 22 };
  if (roll < 0.6) return { kind: "bug", x: W + 20, y: GROUND - 30, w: 24, h: 30 };
  const w = 26 + Math.floor(Math.random() * 3) * 16; // 1–3 spikes
  return { kind: "spike", x: W + 20, y: GROUND - 36, w, h: 36 };
}

/** The player's hitbox: shorter and wider while ducking on the ground. */
function playerBox(s: { y: number; ducking: boolean }) {
  const low = s.ducking && s.y >= GROUND;
  const h = low ? 24 : 40;
  const w = low ? 46 : 36;
  return { x: PLAYER_X, y: s.y - h, w, h };
}

export function RunnerGame() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const state = useRef({
    y: GROUND,
    vy: 0,
    ducking: false,
    obstacles: [] as Obstacle[],
    speed: START_SPEED,
    distance: 0,
    nextGap: 300,
    frame: 0,
    last: 0,
  });
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(false);
  const { best, submit } = useBestScore("runner");
  const run = useRun("runner");
  const { begin: beginRun, end: endRun } = run;

  const shown = useRef(0);

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

    // Sky with slow parallax "stars".
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#161716");
    sky.addColorStop(1, "#202120");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff22";
    for (let i = 0; i < 40; i++) {
      const x = (((i * 137) % W) - ((s.distance * 0.15) % W) + W) % W;
      ctx.fillRect(x, (i * 53) % (GROUND - 40), 2, 2);
    }

    // Ground line with moving dashes.
    ctx.fillStyle = "#3a3d3a";
    ctx.fillRect(0, GROUND, W, 2);
    ctx.fillStyle = "#3a3d3a";
    for (let x = -(s.distance % 40); x < W; x += 40) ctx.fillRect(x, GROUND + 10, 14, 2);
    for (let x = -((s.distance * 0.6) % 90); x < W; x += 90) ctx.fillRect(x + 30, GROUND + 22, 6, 2);

    // Obstacles.
    for (const o of s.obstacles) {
      if (o.kind === "bug") {
        ctx.fillStyle = "#f2695c";
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.w, o.h, 6);
        ctx.fill();
        // glitch lines + eyes
        ctx.fillStyle = "#1e1f1e";
        ctx.fillRect(o.x + 5, o.y + 9, 4, 5);
        ctx.fillRect(o.x + o.w - 9, o.y + 9, 4, 5);
        ctx.fillStyle = "#ff9d93";
        ctx.fillRect(o.x - 3, o.y + 18, o.w + 6, 2);
        // legs
        ctx.fillStyle = "#f2695c";
        const step = Math.floor(s.frame / 6) % 2;
        ctx.fillRect(o.x + 3 + step * 2, o.y + o.h, 3, 4);
        ctx.fillRect(o.x + o.w - 6 - step * 2, o.y + o.h, 3, 4);
      } else if (o.kind === "spike") {
        ctx.fillStyle = "#c38bff";
        const n = Math.max(1, Math.round(o.w / 16) - 1);
        const sw = o.w / n;
        for (let i = 0; i < n; i++) {
          ctx.beginPath();
          ctx.moveTo(o.x + i * sw, GROUND);
          ctx.lineTo(o.x + i * sw + sw / 2, o.y);
          ctx.lineTo(o.x + (i + 1) * sw, GROUND);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        // Drone: body + spinning rotors
        ctx.fillStyle = "#6ea8fe";
        ctx.beginPath();
        ctx.roundRect(o.x + 6, o.y + 8, o.w - 12, o.h - 8, 5);
        ctx.fill();
        const spin = (s.frame % 6) < 3 ? 14 : 8;
        ctx.fillRect(o.x + 10 - spin / 2, o.y + 2, spin, 3);
        ctx.fillRect(o.x + o.w - 10 - spin / 2, o.y + 2, spin, 3);
        ctx.fillStyle = "#1e1f1e";
        ctx.fillRect(o.x + o.w / 2 - 3, o.y + 13, 6, 4);
      }
    }

    // Player: the "R" block with little running legs.
    const p = playerBox(s);
    const onGround = s.y >= GROUND;
    ctx.save();
    ctx.shadowColor = accent;
    ctx.shadowBlur = 14;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h - 6, 7);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = accent;
    const stride = onGround ? Math.floor(s.frame / 5) % 2 : 0;
    ctx.fillRect(p.x + 7, p.y + p.h - 6, 5, 6 - stride * 3);
    ctx.fillRect(p.x + p.w - 12, p.y + p.h - 6, 5, 3 + stride * 3);
    ctx.fillStyle = "#1e1f1e";
    ctx.font = `900 ${p.h > 30 ? 24 : 17}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("R", p.x + p.w / 2, p.y + (p.h - 6) / 2 + 1);

    // Distance counter.
    ctx.fillStyle = "#a3a29b";
    ctx.font = `800 16px ${font}`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.floor(s.distance / 10)} m`, W - 16, 24);
  }, []);

  const reset = useCallback(() => {
    state.current = {
      y: GROUND,
      vy: 0,
      ducking: false,
      obstacles: [],
      speed: START_SPEED,
      distance: 0,
      nextGap: 320,
      frame: 0,
      last: 0,
    };
    draw();
  }, [draw]);

  const start = useCallback(() => {
    reset();
    shown.current = 0;
    setScore(0);
    setRecord(false);
    beginRun();
    setPhase("playing");
    wrap.current?.focus();
  }, [reset, beginRun]);

  const jump = useCallback(() => {
    const s = state.current;
    if (s.y >= GROUND) s.vy = JUMP_VELOCITY;
  }, []);

  const setDuck = useCallback((on: boolean) => {
    const s = state.current;
    s.ducking = on;
    if (on && s.y < GROUND) s.vy = Math.max(s.vy, 6); // fast fall
  }, []);

  // Game loop, normalised to 60 fps so speed doesn't depend on the screen's refresh rate.
  useEffect(() => {
    if (phase !== "playing") return;
    let frame = 0;
    const tick = (t: number) => {
      const s = state.current;
      const dt = s.last ? Math.min(3, (t - s.last) / (1000 / 60)) : 1;
      s.last = t;
      s.frame += dt;

      s.vy += GRAVITY * dt;
      s.y = Math.min(GROUND, s.y + s.vy * dt);
      if (s.y >= GROUND) s.vy = 0;

      s.speed = Math.min(MAX_SPEED, s.speed + 0.0016 * dt);
      const dx = s.speed * dt;
      s.distance += dx;
      for (const o of s.obstacles) o.x -= dx;
      s.obstacles = s.obstacles.filter((o) => o.x + o.w > -10);

      s.nextGap -= dx;
      if (s.nextGap <= 0) {
        s.obstacles.push(makeObstacle(s.speed));
        // Gaps grow with speed so every obstacle stays clearable.
        s.nextGap = s.speed * 38 + Math.random() * 260;
      }

      const p = playerBox(s);
      const inset = 5;
      const hit = s.obstacles.some(
        (o) =>
          p.x + inset < o.x + o.w - inset &&
          p.x + p.w - inset > o.x + inset &&
          p.y + inset < o.y + o.h - (o.kind === "spike" ? 0 : inset) &&
          p.y + p.h - inset > o.y + (o.kind === "spike" ? 10 : inset),
      );

      const meters = Math.floor(s.distance / 10);
      if (meters !== shown.current) {
        shown.current = meters;
        setScore(meters);
      }
      draw();

      if (hit) {
        endRun();
        setScore(meters);
        setRecord(submit(meters));
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
      if (phase === "playing") jump();
    } else if (k === "arrowdown" || k === "s") {
      e.preventDefault();
      if (phase === "playing") setDuck(true);
    }
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === "arrowdown" || k === "s") setDuck(false);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3">
        <Stat label="Distanță" value={`${score} m`} />
        <Stat label="Record" value={`${best} m`} />
      </div>

      <div
        ref={wrap}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPointerDown={(e) => {
          // Tap/click the track to jump (not when tapping the overlay's buttons or field).
          if (phase === "playing" && e.target === canvas.current) jump();
        }}
        aria-label="Respawn Run. Space sau săgeată sus = sari, săgeată jos = te apleci."
        className="relative w-full max-w-[800px] select-none rounded-xl outline-none ring-accent/60 focus-visible:ring-2"
      >
        <canvas ref={canvas} className="aspect-[10/3] w-full touch-manipulation rounded-xl border border-line" />
        {phase !== "playing" && (
          // On phones the track is short, so the panel sits below it instead of covering it.
          <div className="mt-3 rounded-xl border border-line bg-surface p-4 text-center sm:absolute sm:inset-0 sm:mt-0 sm:grid sm:place-items-center sm:overflow-y-auto sm:border-0 sm:bg-bg-deep/80 sm:backdrop-blur-[2px]">
            <div>
              {phase === "over" ? (
                <>
                  <p className="font-display text-3xl font-black text-accent sm:text-4xl">{score} m</p>
                  {record && <p className="font-bold text-score-great">Record nou!</p>}
                </>
              ) : (
                <>
                  <p className="font-display text-2xl font-black text-ink sm:text-3xl">Respawn Run</p>
                  <p className="mt-1 max-w-sm text-sm text-ink-soft">
                    Sari peste bug-uri și lag spikes, apleacă-te sub drone. Space / ↑ = sari, ↓ = jos. Pe telefon: atinge
                    pista.
                  </p>
                </>
              )}
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                <button type="button" className={primaryButton} onClick={start}>
                  {phase === "over" ? "Încă o dată" : "Start"}
                </button>
                {phase === "over" && score > 0 && (
                  <ShareScore text={`Am alergat ${score} m în Respawn Run pe RespawnCentral. Mă bați?`} />
                )}
              </div>
              {phase === "over" && score > 0 && (
                <SaveScore game="runner" score={score} durationMs={run.duration} token={run.token} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Touch controls for phones. */}
      <div className="flex gap-3 md:hidden">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (phase === "playing") jump();
            else start();
          }}
          className="h-14 w-32 rounded-xl border border-line bg-surface font-display text-sm font-extrabold uppercase text-ink active:bg-accent active:text-accent-ink"
        >
          ↑ Sari
        </button>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            setDuck(true);
          }}
          onPointerUp={() => setDuck(false)}
          onPointerLeave={() => setDuck(false)}
          className="h-14 w-32 rounded-xl border border-line bg-surface font-display text-sm font-extrabold uppercase text-ink active:bg-accent active:text-accent-ink"
        >
          ↓ Jos
        </button>
      </div>
    </div>
  );
}
