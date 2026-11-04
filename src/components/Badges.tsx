import type { Category } from "@/lib/types";
import { scoreLabel, scoreTone } from "@/lib/format";

export function CategoryBadge({ category, className = "" }: { category: Category; className?: string }) {
  const isReview = category === "review";
  return (
    <span
      className={`inline-block rounded-sm px-1.5 py-0.5 align-[0.15em] font-display text-[0.7em] font-extrabold uppercase leading-none tracking-wider ${
        isReview ? "bg-review text-accent-ink" : "bg-news text-accent-ink"
      } ${className}`}
    >
      {isReview ? "Review" : "News"}
    </span>
  );
}

export function CategoryLabel({ category }: { category: Category }) {
  return (
    <span className={`font-semibold ${category === "review" ? "text-review" : "text-news"}`}>
      {category === "review" ? "Reviews" : "News"}
    </span>
  );
}

const toneClasses = {
  great: "bg-score-great text-accent-ink",
  good: "bg-score-good text-accent-ink",
  bad: "bg-score-bad text-accent-ink",
} as const;

const ringClasses = {
  great: "border-score-great text-score-great",
  good: "border-score-good text-score-good",
  bad: "border-score-bad text-score-bad",
} as const;

/** Small square chip used on cards. */
export function ScoreChip({ score, className = "" }: { score: number; className?: string }) {
  return (
    <span
      className={`grid size-11 place-items-center rounded-md font-display text-lg font-black shadow-lg ${toneClasses[scoreTone(score)]} ${className}`}
      aria-label={`Score ${score.toFixed(1)} out of 10`}
    >
      {score.toFixed(1)}
    </span>
  );
}

/** Large ring used on the review page header and verdict box. */
export function ScoreRing({ score, size = "lg" }: { score: number; size?: "lg" | "xl" }) {
  const tone = scoreTone(score);
  const dims = size === "xl" ? "size-32 border-[6px] text-5xl" : "size-24 border-[5px] text-4xl";
  return (
    <div className="flex flex-col items-center gap-2" aria-label={`Score ${score.toFixed(1)} out of 10`}>
      <div className={`grid place-items-center rounded-full bg-bg-deep font-display font-black ${dims} ${ringClasses[tone]}`}>
        {score.toFixed(1)}
      </div>
      <span className={`font-display text-xs font-extrabold uppercase tracking-[0.18em] ${ringClasses[tone].split(" ")[1]}`}>
        {scoreLabel(score)}
      </span>
    </div>
  );
}
