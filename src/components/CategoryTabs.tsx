import Link from "next/link";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import type { Category } from "@/lib/types";

const TABS: { value: Category | undefined; label: string; href: string }[] = [
  { value: undefined, label: "Toate", href: "/" },
  ...CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORIES[c].label, href: `/?category=${c}` })),
];

/** Homepage filter: keeps News and Reviews clearly separated. */
export function CategoryTabs({ active }: { active?: Category }) {
  return (
    <nav aria-label="Filtrează după categorie" className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = tab.value === active;
        const dot = tab.value ? CATEGORIES[tab.value].bg : "bg-ink";
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
