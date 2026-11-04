import Link from "next/link";

export function SectionHeading({
  title,
  href,
  accent = "accent",
}: {
  title: string;
  href?: string;
  accent?: "accent" | "news" | "review";
}) {
  const bar = { accent: "bg-accent", news: "bg-news", review: "bg-review" }[accent];
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-3">
      <h2 className="flex items-center gap-3 font-display text-2xl font-black uppercase tracking-tight text-ink">
        <span className={`h-6 w-1.5 rounded-full ${bar}`} aria-hidden />
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="font-display text-xs font-extrabold uppercase tracking-wider text-muted transition-colors hover:text-accent"
        >
          View all →
        </Link>
      )}
    </div>
  );
}
