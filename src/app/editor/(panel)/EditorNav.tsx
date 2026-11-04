"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/editor/dashboard", label: "Dashboard" },
  { href: "/editor/articles", label: "Articles" },
  { href: "/editor/articles/new", label: "New article" },
  { href: "/editor/team", label: "Team" },
];

export function EditorNav() {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/editor/articles"
      ? pathname === href || (pathname.startsWith("/editor/articles/") && !pathname.endsWith("/new"))
      : pathname === href;

  return (
    <nav className="mt-4 flex gap-1 overflow-x-auto md:flex-col" aria-label="Editor">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
            active(link.href) ? "bg-accent text-accent-ink" : "text-ink-soft hover:bg-surface hover:text-ink"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
