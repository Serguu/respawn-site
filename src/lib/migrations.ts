import "server-only";
import { sql } from "./db";

/**
 * Brings an existing database up to date with db/schema.sql. Every statement is idempotent.
 * It runs by itself (once per server instance) the first time a newer table or column is needed,
 * so deploying is enough; `npm run db:setup` does the same thing by hand.
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

  create table if not exists site_settings (
    key        text primary key,
    value      jsonb not null,
    updated_at timestamptz not null default now()
  );

  create table if not exists recommendations (
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
  create index if not exists recommendations_status_idx on recommendations (status, votes desc, created_at desc);

  create table if not exists recommendation_votes (
    recommendation_id uuid not null references recommendations(id) on delete cascade,
    visitor_hash      text not null,
    primary key (recommendation_id, visitor_hash)
  );

  create table if not exists trivia_questions (
    id         uuid primary key default gen_random_uuid(),
    question   text not null,
    answers    jsonb not null,
    correct    smallint not null check (correct between 0 and 3),
    active     boolean not null default true,
    created_at timestamptz not null default now()
  );

  alter table site_settings        enable row level security;
  alter table recommendations      enable row level security;
  alter table recommendation_votes enable row level security;
  alter table trivia_questions     enable row level security;
`;

let pending: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  pending ??= sql.unsafe(MIGRATIONS).then(
    () => undefined,
    (error) => {
      pending = null; // try again next time
      throw error;
    },
  );
  return pending;
}

/** Runs a query; if it failed because a newer table doesn't exist yet, migrates and retries once. */
export async function withSchema<T>(query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if ((error as { code?: string }).code !== "42P01") throw error; // 42P01 = undefined_table
    await ensureSchema();
    return query();
  }
}


