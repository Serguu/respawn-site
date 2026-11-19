import Link from "next/link";
import { getDisclaimer } from "@/lib/settings";
import { NAV_LINKS, SITE } from "@/lib/site";
import { CookieSettingsButton } from "./CookieConsent";
import { Logo } from "./Logo";

export async function Footer() {
  const disclaimer = await getDisclaimer();

  return (
    <footer className="mt-24 border-t border-line bg-bg-deep">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted">{SITE.tagline}</p>
          </div>
          <nav aria-label="Subsol">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-display text-sm font-bold uppercase tracking-wider text-ink-soft hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
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
          <CookieSettingsButton />
        </div>
      </div>
    </footer>
  );
}
