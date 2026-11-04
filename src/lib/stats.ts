export function ctr(clicks: number, impressions: number): string {
  if (!impressions) return "—";
  return `${((clicks / impressions) * 100).toFixed(1)}%`;
}
