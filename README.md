# RESPAWN – gaming news & reviews

Next.js 16 + Tailwind 4 + Supabase (Postgres + Storage). Design tokens live in
`src/app/globals.css` (palette from `design/context.txt`). Site name/tagline/disclaimer
live in `src/lib/site.ts`.

## First-time setup

1. Fill in `.env.local` (template: `.env.example`):
   - `DATABASE_URL` – Supabase → Project Settings → Database → Connection string → **Transaction pooler** (port 6543), with your DB password.
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` – Supabase → Project Settings → API.
   - `SESSION_SECRET` – already generated, keep it secret.
2. Create tables + the public `media` image bucket:
   ```bash
   npm run db:setup
   ```
3. Create the editor account (password ≥ 10 chars):
   ```bash
   npm run editor:create -- yourusername "your-strong-password" "Your Name"
   ```
4. Run it:
   ```bash
   npm run dev
   ```
   Public site: http://localhost:3000 · Editor (hidden, not linked anywhere): http://localhost:3000/editor

## Structure

| Path | What |
| --- | --- |
| `src/app/(site)` | Public pages: home, `/news`, `/reviews`, `/article/[slug]`, `/contact` |
| `src/app/editor` | Hidden CMS: login, dashboard, articles, team, preview |
| `src/app/api/track` | View / homepage impression / click tracking |
| `src/app/api/editor/upload` | Authenticated image upload to Supabase Storage |
| `db/schema.sql` | Database schema (RLS on, so Supabase's public API can't read it) |

## Stats

- **Views**: counted once per anonymous visitor per day (hash of IP + browser + date, raw IP never stored).
- **Homepage CTR**: clicks on a homepage card ÷ times that card was ≥50% visible on the homepage.

## Deploy (Vercel)

Import the project, add the same env vars plus `NEXT_PUBLIC_SITE_URL=https://your-domain`, deploy.
