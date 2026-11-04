import Link from "next/link";
import type { Category } from "@/lib/types";

const TABS: { value: Category | undefined; label: string; href: string }[] = [
  { value: undefined, label: "All", href: "/" },
  { value: "news", label: "News", href: "/?category=news" },
  { value: "review", label: "Reviews", href: "/?category=review" },
];

/** Homepage filter: keeps News and Reviews clearly separated. */
export function CategoryTabs({ active }: { active?: Category }) {
  return (
    <nav aria-label="Filter by category" className="flex gap-2">
      {TABS.map((tab) => {
        const isActive = tab.value === active;
        const dot = tab.value === "news" ? "bg-news" : tab.value === "review" ? "bg-review" : "bg-ink";
        return (
          <Link
            key={tab.label}
            href={tab.href}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider transition-colors ${
              isActive
                ? "border-accent bg-accent text-accent-ink"
                : "border-line text-ink-soft hover:border-ink-soft hover:text-ink"
            }`}
          >
            {!isActive && <span className={`size-2 rounded-full ${dot}`} aria-hidden />}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
