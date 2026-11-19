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
| `src/app/(site)` | Public pages (Romanian): home, `/stiri`, `/recenzii`, `/articol/[slug]`, `/contact`. Old `/news`, `/reviews`, `/article/*` URLs 301-redirect (`next.config.ts`). |
| `src/app/editor` | Hidden CMS: login, dashboard, articles, team, preview |
| `src/app/api/track` | View / homepage impression / click tracking |
| `src/app/api/editor/upload` | Authenticated image upload to Supabase Storage |
| `db/schema.sql` | Database schema (RLS on, so Supabase's public API can't read it) |

## Stats

- **Google Analytics**: loaded through Google Tag Manager (container ID in `src/lib/site.ts`), on the public site only (not `/editor`) and only in production builds. GA4 itself is configured in the GTM container.
- **Cookie consent (GDPR)**: `src/components/CookieConsent.tsx`. GTM is loaded only after the visitor clicks *Accept* (Consent Mode v2 signals are sent with it); *Reject* loads nothing. The choice is kept in `localStorage` and can be changed from *Cookie settings* in the footer.

- **Views**: counted once per anonymous visitor per day (hash of IP + browser + date, raw IP never stored).
- **Homepage CTR**: clicks on a homepage card ÷ times that card was ≥50% visible on the homepage.

## Deploy (Vercel)

Import the project, add the same env vars, deploy. `NEXT_PUBLIC_SITE_URL=https://your-domain` is only needed once you use a custom domain; without it the sitemap, robots.txt and canonical links use the Vercel production domain.

## SEO

- `robots.txt` and `sitemap.xml` (all published articles) are generated automatically; the editor is `noindex`.
- The public site is in Romanian (`<html lang="ro">`, `og:locale ro_RO`, `latin-ext` fonts for ș/ț).
- Every public page has a canonical URL. The homepage has `WebSite` + `Organization` JSON-LD; articles have Open Graph data and JSON-LD (`NewsArticle`, or `Review` with the score) plus a breadcrumb trail.
- Favicon, Apple icon and the default social preview image are generated in `src/app/icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx`; articles with a cover use it as their preview.
- Google only finds a new site once it is told about it: verify the domain in Google Search Console and submit `/sitemap.xml`.
