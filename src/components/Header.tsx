"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/lib/site";
import { Logo } from "./Logo";

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (searching) searchInput.current?.focus();
  }, [searching]);

  // "/" opens search from anywhere, like on most news sites.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea|select/i.test(target.tagName) && !target.isContentEditable) {
        e.preventDefault();
        setSearching(true);
      }
      if (e.key === "Escape") setSearching(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim();
    if (!q) return;
    setSearching(false);
    setOpen(false);
    router.push(`/cauta?q=${encodeURIComponent(q)}`);
  };

  const searchForm = (id: string, className: string) => (
    <form role="search" onSubmit={submit} className={className}>
      <label htmlFor={id} className="sr-only">
        Caută pe site
      </label>
      <input
        id={id}
        ref={id === "header-q" ? searchInput : undefined}
        name="q"
        type="search"
        placeholder="Caută jocuri, știri, recenzii…"
        className="w-full rounded-md border border-line bg-bg-deep px-4 py-2.5 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none"
      />
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="h-0.5 bg-gradient-to-r from-news via-accent to-article" aria-hidden />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <div className="flex items-center gap-1">
          <nav className="hidden lg:block" aria-label="Principal">
            <ul className="flex items-center">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`relative px-3 py-2 font-display text-sm font-bold uppercase tracking-wider transition-colors xl:px-4 ${
                      isActive(link.href) ? "text-accent" : "text-ink hover:text-accent"
                    }`}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <span className="absolute inset-x-3 -bottom-[15px] h-[3px] rounded-full bg-accent xl:inset-x-4" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            className={`grid size-10 place-items-center rounded-md transition-colors hover:bg-surface ${searching ? "text-accent" : "text-ink"}`}
            aria-label={searching ? "Închide căutarea" : "Caută (tasta /)"}
            aria-expanded={searching}
            onClick={() => setSearching((v) => !v)}
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-md text-ink hover:bg-surface lg:hidden"
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {searching && (
        <div className="border-t border-line bg-bg/95">
          {searchForm("header-q", "mx-auto max-w-3xl px-4 py-3 sm:px-6")}
        </div>
      )}

      {open && (
        <nav className="border-t border-line lg:hidden" aria-label="Meniu mobil">
          <ul className="mx-auto max-w-7xl px-4 py-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block py-3 font-display text-base font-bold uppercase tracking-wider ${
                    isActive(link.href) ? "text-accent" : "text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
