import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { sql } from "./db";
import { ifTableExists } from "./migrations";

export type GameId = "snake" | "aim" | "trivia";
export type Period = "week" | "all";
export type LeaderboardEntry = { name: string; score: number; duration_ms: number; created_at: Date };

export const GAME_IDS: GameId[] = ["snake", "aim", "trivia"];
export const isGameId = (v: unknown): v is GameId => GAME_IDS.includes(v as GameId);

/**
 * What a believable run looks like for each game. Scores come from the visitor's browser, so this
 * can't stop a determined cheater, but it stops made-up numbers and replayed requests; the editor
 * can hide anything that slips through.
 */
const RULES: Record<GameId, (score: number, durationMs: number) => boolean> = {
  // 10 points per gem; at top speed a step takes 60 ms and every gem needs at least one step.
  snake: (s, d) => s > 0 && s % 10 === 0 && s <= 3970 && d >= Math.max(1000, (s / 10) * 60),
  // The round lasts 30 s; more than ~6 hits a second isn't human.
  aim: (s, d) => s > 0 && s <= 200 && d >= 29_000,
  // 10 questions; nobody reads and answers one in under 0.8 s.
  trivia: (s, d) => s > 0 && s <= 10 && d >= 8_000,
};

const MAX_RUN_AGE_MS = 2 * 60 * 60 * 1000;

function sign(payload: string) {
  return createHmac("sha256", `scores|${process.env.SESSION_SECRET}`).update(payload).digest("base64url");
}

/** A signed, single-use ticket handed out when a game starts: game.startedAt.nonce.signature */
export function createRunToken(game: GameId) {
  const payload = `${game}.${Date.now()}.${randomBytes(9).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyRunToken(token: string, game: GameId): { runId: string; startedAt: number } | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [g, started, nonce, signature] = parts;
  const expected = Buffer.from(sign(`${g}.${started}.${nonce}`));
  const given = Buffer.from(signature);
  if (g !== game || given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  const startedAt = Number(started);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt > MAX_RUN_AGE_MS) return null;
  return { runId: `${started}.${nonce}`, startedAt };
}

/**
 * Checks a finished run. The client says how long it played (it knows when the round ended, the
 * server only sees when the score was sent), so that claim must fit inside the time the server saw.
 */
export function isPlausible(game: GameId, score: number, claimedMs: number, startedAt: number) {
  const serverMs = Date.now() - startedAt;
  return (
    Number.isInteger(score) &&
    Number.isInteger(claimedMs) &&
    claimedMs > 0 &&
    claimedMs <= serverMs + 2000 && // small allowance for clock jitter
    RULES[game](score, claimedMs)
  );
}

/** Monday 00:00 in Romania, as the start of "this week". */
const weekStart = () => sql`(date_trunc('week', now() at time zone 'Europe/Bucharest') at time zone 'Europe/Bucharest')`;

/** Each player's best run (by name), ranked: higher score first, then faster, then earlier. */
const bestPerPlayer = (game: GameId, period: Period) => sql`
  select distinct on (lower(name)) name, score, duration_ms, created_at
  from game_scores
  where game = ${game} and not hidden ${period === "week" ? sql`and created_at >= ${weekStart()}` : sql``}
  order by lower(name), score desc, duration_ms asc, created_at asc
`;

export async function getLeaderboard(game: GameId, period: Period, limit = 10): Promise<LeaderboardEntry[]> {
  return ifTableExists(
    () => sql<LeaderboardEntry[]>`
      select * from (${bestPerPlayer(game, period)}) best
      order by score desc, duration_ms asc, created_at asc
      limit ${limit}
    `,
    [],
  );
}

/** Where a score would place among other players' bests (1 = first). */
export async function rankOf(game: GameId, period: Period, name: string, score: number, durationMs: number) {
  const [row] = await sql<{ ahead: string }[]>`
    select count(*) as ahead from (${bestPerPlayer(game, period)}) best
    where lower(name) <> lower(${name})
      and (score > ${score} or (score = ${score} and duration_ms < ${durationMs}))
  `;
  return Number(row.ahead) + 1;
}

export async function getRecentScores(game: GameId, limit = 100) {
  return ifTableExists(
    () => sql<{ id: string; name: string; score: number; duration_ms: number; hidden: boolean; created_at: Date }[]>`
      select id, name, score, duration_ms, hidden, created_at from game_scores
      where game = ${game} order by created_at desc limit ${limit}
    `,
    [],
  );
}
