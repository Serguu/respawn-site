export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

export function timeAgo(date: Date | string | null): string {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Chiar acum";
  // Intl handles Romanian plurals ("acum 1 oră", "acum 3 ore", "acum 20 de ore", "ieri").
  const rtf = new Intl.RelativeTimeFormat("ro", { numeric: "auto" });
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 7) return rtf.format(-days, "day");
  return formatDate(date);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("ro-RO", { notation: n >= 10000 ? "compact" : "standard" }).format(n);
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
  if (score >= 9) return "Capodoperă";
  if (score >= 8) return "Excelent";
  if (score >= 7) return "Bun";
  if (score >= 5) return "Mediocru";
  if (score >= 3) return "Slab";
  return "De evitat";
}
