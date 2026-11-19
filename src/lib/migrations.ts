import "server-only";
import { sql } from "./db";

/**
 * Brings an existing database up to date with db/schema.sql.
 *
 * Runs from `npm run db:setup` and from the editor (opening it, or saving), never while rendering
 * public pages: schema changes need short table locks, and on a busy production database a waiting
 * lock makes every reader queue behind it. So the whole thing is one transaction that gives up
 * after 2 s of waiting for a lock (and 20 s overall) instead of taking the site down, and each step
 * is skipped when it's already done, so a migrated database takes no locks at all.
 */
const MIGRATIONS = `
  -- 2026-11: third article category ("article" = opinions, analysis, guides).
  do $$ begin
    if not exists (
      select 1 from pg_constraint
      where conname = 'articles_category_check' and pg_get_constraintdef(oid) like '%''article''%'
    ) then
      alter table articles drop constraint if exists articles_category_check;
      alter table articles add constraint articles_category_check check (category in ('news', 'review', 'article'));
    end if;
  end $$;

  do $$ begin
    if to_regclass('public.site_settings') is null then
      create table site_settings (
        key        text primary key,
        value      jsonb not null,
        updated_at timestamptz not null default now()
      );
    end if;

    if to_regclass('public.recommendations') is null then
      create table recommendations (
        id           uuid primary key default gen_random_uuid(),
        game         text not null,
        platform     text not null default '',
        reason       text not null,
        author_name  text not null default '',
        status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
        votes        integer not null default 0,
        visitor_hash text not null default '',
        created_at   timestamptz not null default now(),
        reviewed_at  timestamptz
      );
      create index recommendations_status_idx on recommendations (status, votes desc, created_at desc);
    end if;

    if to_regclass('public.recommendation_votes') is null then
      create table recommendation_votes (
        recommendation_id uuid not null references recommendations(id) on delete cascade,
        visitor_hash      text not null,
        primary key (recommendation_id, visitor_hash)
      );
    end if;

    if to_regclass('public.trivia_questions') is null then
      create table trivia_questions (
        id         uuid primary key default gen_random_uuid(),
        question   text not null,
        answers    jsonb not null,
        correct    smallint not null check (correct between 0 and 3),
        active     boolean not null default true,
        created_at timestamptz not null default now()
      );
    end if;
  end $$;

  -- 2026-11: mini-game leaderboards.
  do $$ begin
    if to_regclass('public.game_scores') is null then
      create table game_scores (
        id           uuid primary key default gen_random_uuid(),
        game         text not null check (game in ('snake', 'aim', 'trivia')),
        name         text not null,
        score        integer not null check (score >= 0),
        duration_ms  integer not null default 0,
        run_id       text not null unique,
        visitor_hash text not null default '',
        hidden       boolean not null default false,
        created_at   timestamptz not null default now()
      );
      create index game_scores_board_idx on game_scores (game, hidden, created_at desc);
    end if;
  end $$;

  -- RLS with no policies keeps Supabase's public REST API out (only where it isn't on yet).
  do $$
  declare t text;
  begin
    foreach t in array array['site_settings', 'recommendations', 'recommendation_votes', 'trivia_questions', 'game_scores'] loop
      if not (select relrowsecurity from pg_class where oid = ('public.' || t)::regclass) then
        execute format('alter table %I enable row level security', t);
      end if;
    end loop;
  end $$;
`;

let pending: Promise<void> | null = null;

/** Applies MIGRATIONS once per server instance. Editor/db:setup only — never call it from a public page. */
export function ensureSchema(): Promise<void> {
  pending ??= sql
    .begin(async (tx) => {
      // Give up instead of queueing: a waiting ALTER would make every page read wait behind it.
      await tx.unsafe("set local lock_timeout = '2s'");
      await tx.unsafe("set local statement_timeout = '20s'");
      await tx.unsafe(MIGRATIONS);
    })
    .then(
    () => undefined,
    (error) => {
      pending = null; // try again next time
      throw error;
    },
  );
  return pending;
}

/** True when the error means a newer table doesn't exist yet (the editor hasn't been opened since deploying). */
export function isMissingTable(error: unknown) {
  return (error as { code?: string })?.code === "42P01"; // undefined_table
}

/** Runs a read on a newer table; if that table doesn't exist yet, returns `fallback` instead of failing. */
export async function ifTableExists<R, F>(query: () => Promise<R>, fallback: F): Promise<R | F> {
  try {
    return await query();
  } catch (error) {
    if (isMissingTable(error)) return fallback;
    throw error;
  }
}
