"use server";

import { headers } from "next/headers";
import { sql } from "@/lib/db";
import { isMissingTable } from "@/lib/migrations";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRunToken, isGameId, isPlausible, rankOf, verifyRunToken } from "@/lib/scores";
import { isBot, stableVisitorHash } from "@/lib/visitor";

/** Called when a round starts; the ticket must come back with the score. */
export async function startRun(game: string): Promise<string | null> {
  return isGameId(game) ? createRunToken(game) : null;
}

export type SubmitResult = { ok: true; rankWeek: number; rankAll: number } | { ok: false; error: string };

const NAME = /^[\p{L}\p{N} _.\-]{2,20}$/u;

export async function submitScore(input: {
  game: string;
  token: string;
  score: number;
  durationMs: number;
  name: string;
}): Promise<SubmitResult> {
  const { game, token, score, durationMs } = input;
  const name = String(input.name ?? "").replace(/\s+/g, " ").trim();
  if (!isGameId(game)) return { ok: false, error: "Joc necunoscut." };
  if (!NAME.test(name)) return { ok: false, error: "Numele trebuie să aibă 2–20 de caractere (litere, cifre, spațiu, - _ .)." };

  const h = await headers();
  if (isBot(h.get("user-agent"))) return { ok: false, error: "Nu am putut salva scorul." };
  const visitor = stableVisitorHash(h);
  if (!checkRateLimit(`score:${visitor}`, 20, 10 * 60 * 1000).allowed) {
    return { ok: false, error: "Prea multe scoruri trimise. Mai încearcă în câteva minute." };
  }

  const run = verifyRunToken(String(token ?? ""), game);
  if (!run || !isPlausible(game, score, durationMs, run.startedAt)) {
    return { ok: false, error: "Scorul ăsta nu pare dintr-o rundă reală, așa că nu l-am salvat." };
  }

  try {
    const inserted = await sql`
      insert into game_scores (game, name, score, duration_ms, run_id, visitor_hash)
      values (${game}, ${name}, ${score}, ${durationMs}, ${run.runId}, ${visitor})
      on conflict (run_id) do nothing
      returning id
    `;
    if (inserted.length === 0) return { ok: false, error: "Scorul acestei runde e deja salvat." };
    const rankWeek = await rankOf(game, "week", name, score, durationMs);
    const rankAll = await rankOf(game, "all", name, score, durationMs);
    return { ok: true, rankWeek, rankAll };
  } catch (error) {
    if (isMissingTable(error)) return { ok: false, error: "Clasamentele nu sunt disponibile momentan." };
    throw error;
  }
}
