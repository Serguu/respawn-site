import Link from "next/link";
import { DISCLAIMER, NAV_LINKS, SITE } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-bg-deep">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted">{SITE.tagline}</p>
          </div>
          <nav aria-label="Footer">
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

        <aside
          aria-label="Disclaimer"
          className="mt-10 rounded-lg border border-line border-l-4 border-l-accent bg-surface p-5 sm:p-6"
        >
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-accent">Disclaimer</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{DISCLAIMER}</p>
        </aside>

        <p className="mt-8 text-xs text-muted">
          © {new Date().getFullYear()} {SITE.name}. A community project made with passion.
        </p>
      </div>
    </footer>
  );
}
