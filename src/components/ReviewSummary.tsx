import type { Article } from "@/lib/types";
import { ScoreRing } from "./Badges";

export function ReviewSummary({ article }: { article: Article }) {
  if (article.review_score === null) return null;
  const { review_pros: pros, review_cons: cons } = article;

  return (
    <section aria-labelledby="verdict-heading" className="mt-14 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-col items-center gap-6 border-b border-line p-6 sm:flex-row sm:items-center sm:p-8">
        <ScoreRing score={article.review_score} size="xl" />
        <div className="text-center sm:text-left">
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-accent">The Verdict</p>
          <h2 id="verdict-heading" className="mt-1 font-display text-2xl font-black text-ink">
            {article.title}
          </h2>
          {article.review_platform && (
            <p className="mt-1 text-sm text-muted">Reviewed on {article.review_platform}</p>
          )}
          {article.review_verdict && (
            <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-soft">{article.review_verdict}</p>
          )}
        </div>
      </div>

      {(pros.length > 0 || cons.length > 0) && (
        <div className="grid sm:grid-cols-2">
          <ProsCons title="Pros" items={pros} tone="pro" />
          <ProsCons title="Cons" items={cons} tone="con" />
        </div>
      )}
    </section>
  );
}

function ProsCons({ title, items, tone }: { title: string; items: string[]; tone: "pro" | "con" }) {
  const color = tone === "pro" ? "text-score-great" : "text-score-bad";
  return (
    <div className={`p-6 sm:p-8 ${tone === "con" ? "border-t border-line sm:border-l sm:border-t-0" : ""}`}>
      <h3 className={`font-display text-sm font-extrabold uppercase tracking-[0.18em] ${color}`}>{title}</h3>
      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 text-ink-soft">
              <span className={`mt-0.5 font-display text-lg font-black leading-none ${color}`} aria-hidden>
                {tone === "pro" ? "+" : "−"}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">None listed.</p>
      )}
    </div>
  );
}
