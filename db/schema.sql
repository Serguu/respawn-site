-- Schema for the gaming articles site.
-- Safe to run multiple times (npm run db:setup).

create extension if not exists pgcrypto;

create table if not exists editors (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  password_hash text not null,
  display_name  text not null,
  created_at    timestamptz not null default now()
);

create table if not exists articles (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  title                 text not null,
  excerpt               text not null default '',
  content_json          jsonb,
  content_html          text not null default '',
  cover_image           text,
  category              text not null check (category in ('news', 'review')),
  status                text not null default 'draft' check (status in ('draft', 'published')),
  author_id             uuid references editors(id) on delete set null,
  published_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  view_count            integer not null default 0,
  home_impression_count integer not null default 0,
  home_click_count      integer not null default 0,
  -- Review-only fields
  review_score          numeric(3, 1) check (review_score is null or (review_score >= 0 and review_score <= 10)),
  review_verdict        text,
  review_pros           jsonb not null default '[]'::jsonb,
  review_cons           jsonb not null default '[]'::jsonb,
  review_platform       text
);

create index if not exists articles_published_idx on articles (status, published_at desc);
create index if not exists articles_category_idx on articles (category, status, published_at desc);

create table if not exists view_events (
  article_id   uuid not null references articles(id) on delete cascade,
  visitor_hash text not null,
  day          date not null default current_date,
  primary key (article_id, visitor_hash, day)
);

create table if not exists team_members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text not null default '',
  bio        text not null default '',
  avatar_url text,
  socials    jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- The app talks to Postgres directly (server-side only). Enabling RLS with no
-- policies blocks Supabase's public REST API from reading or writing these tables.
alter table editors      enable row level security;
alter table articles     enable row level security;
alter table view_events  enable row level security;
alter table team_members enable row level security;
