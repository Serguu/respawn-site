import Link from "next/link";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { getDisclaimer, getSiteSocials, SITE_SOCIALS } from "@/lib/settings";
import { SITE } from "@/lib/site";
import { SHARE_ICONS } from "./share-icons";
import { CookieSettingsButton } from "./CookieConsent";
import { Logo } from "./Logo";

export async function Footer() {
  const [disclaimer, socials] = await Promise.all([getDisclaimer(), getSiteSocials()]);
  const socialLinks = SITE_SOCIALS.filter((s) => socials[s.key]);

  const column = (title: string, links: { href: string; label: string }[]) => (
    <nav aria-label={title}>
      <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-muted">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-ink-soft transition-colors hover:text-accent">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <footer className="mt-24 border-t border-line bg-bg-deep">
      <div className="h-0.5 bg-gradient-to-r from-news via-accent to-article opacity-60" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted">{SITE.tagline}</p>
            {socialLinks.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="RespawnCentral pe rețelele sociale">
                {socialLinks.map((s) => (
                  <li key={s.key}>
                    <a
                      href={socials[s.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className="grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d={SHARE_ICONS[s.key]} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {column(
            "Secțiuni",
            CATEGORY_ORDER.map((c) => ({ href: CATEGORIES[c].path, label: CATEGORIES[c].label })),
          )}
          {column("Comunitate", [
            { href: "/recomandari", label: "Recomandări" },
            { href: "/joaca", label: "Mini-jocuri" },
            { href: "/cauta", label: "Caută" },
            { href: "/contact", label: "Echipa & contact" },
          ])}
        </div>

        {disclaimer.enabled && disclaimer.text && (
          <aside
            aria-label={disclaimer.title || "Disclaimer"}
            className="mt-10 rounded-lg border border-line border-l-4 border-l-accent bg-surface p-5 sm:p-6"
          >
            {disclaimer.title && (
              <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
                {disclaimer.title}
              </p>
            )}
            <p className="mt-2 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-soft">{disclaimer.text}</p>
          </aside>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} {SITE.name}. Un proiect al comunității, făcut cu pasiune.</p>
          <div className="flex items-center gap-5">
            <a href="/rss.xml" className="underline hover:text-accent">
              RSS
            </a>
            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
