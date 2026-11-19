# RespawnCentral – gaming news, reviews & community

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

## Sections

| URL | What |
| --- | --- |
| `/stiri`, `/recenzii`, `/articole` | The three article categories (`news`, `review`, `article` = opinions/analysis/guides). Defined in `src/lib/categories.ts`. |
| `/recomandari` | Games recommended by visitors. Submissions wait in Editor → Recommendations until approved; visitors can upvote (one vote each, anonymous hash, no cookie). Honeypot + rate limit against spam. |
| `/joaca` | Mini-games (Snake with the "R" head, aim trainer, trivia), one picked at random per visit; `?joc=snake|aim|trivia` links to one. Personal bests stay in the visitor's browser; scores can also be saved to weekly/all-time leaderboards (best per nickname, `game_scores` table) — each round gets a signed single-use ticket and the server checks the score is plausible for the time played; Editor → Leaderboards hides or deletes entries. Trivia questions are managed in Editor → Trivia (built-in set until there are 5 of your own). |
| `/cauta` | Search over published articles, diacritics-insensitive (`noindex`). |
| `/rss.xml` | RSS feed of the latest 30 articles. |

## Database changes

New tables and the third category are applied by `src/lib/migrations.ts`, automatically the first time they're needed (and by `npm run db:setup`). Nothing to run by hand after deploying.

## Editor

Articles: text styles (H2–H4), highlight, small text, alignment, quotes with 4 styles (classic, big pull quote, box, speech bubble) and an author line, and a "Sources" box for references in small print. Settings: footer disclaimer and the site's social accounts.

## SEO

- `robots.txt` and `sitemap.xml` (all published articles) are generated automatically; the editor is `noindex`.
- The public site is in Romanian (`<html lang="ro">`, `og:locale ro_RO`, `latin-ext` fonts for ș/ț).
- Every public page has a canonical URL. The homepage has `WebSite` + `Organization` JSON-LD; articles have Open Graph data and JSON-LD (`NewsArticle`, or `Review` with the score) plus a breadcrumb trail.
- Articles have share buttons (Facebook, WhatsApp, X, Reddit, Telegram, copy link, and the phone's own share sheet where available). Shared links carry `utm_source=<network>` so GA shows which network brought the visit; each share is pushed to the dataLayer as a `share` event.
- The footer disclaimer is edited (or hidden) from Editor → Settings; it's stored in the `site_settings` table, which is created on first save if `db:setup` wasn't re-run.
- `src/app/favicon.ico` (16/32/48px) plus a 96px icon, Apple icon and the default social preview image generated in `src/app/icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx`; articles with a cover use it as their preview.
- Google only finds a new site once it is told about it: verify the domain in Google Search Console and submit `/sitemap.xml`.
