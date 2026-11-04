export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(date),
  );
}

export function timeAgo(date: Date | string | null): string {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: n >= 10000 ? "compact" : "standard" }).format(n);
}

export function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type ScoreTone = "great" | "good" | "bad";

export function scoreTone(score: number): ScoreTone {
  if (score >= 7.5) return "great";
  if (score >= 5) return "good";
  return "bad";
}

export function scoreLabel(score: number): string {
  if (score >= 9) return "Masterpiece";
  if (score >= 8) return "Great";
  if (score >= 7) return "Good";
  if (score >= 5) return "Mixed";
  if (score >= 3) return "Poor";
  return "Avoid";
}
