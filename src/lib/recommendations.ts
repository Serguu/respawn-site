import "server-only";
import { sql } from "./db";
import { withSchema } from "./migrations";
import type { Recommendation, RecommendationStatus } from "./types";

export const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobil", "Multi-platformă"] as const;

const columns = () => sql`id, game, platform, reason, author_name, status, votes, created_at`;

export async function getApprovedRecommendations(opts: { sort: "top" | "new"; limit: number }): Promise<Recommendation[]> {
  return withSchema(
    () => sql<Recommendation[]>`
      select ${columns()} from recommendations
      where status = 'approved'
      order by ${opts.sort === "top" ? sql`votes desc, created_at desc` : sql`created_at desc`}
      limit ${opts.limit}
    `,
  );
}

/** For the homepage: never let a recommendations problem break the main page. */
export async function getTopRecommendationsSafe(limit: number): Promise<Recommendation[]> {
  return getApprovedRecommendations({ sort: "top", limit }).catch(() => []);
}

export async function getVotedIds(voter: string): Promise<Set<string>> {
  const rows = await withSchema(
    () => sql<{ recommendation_id: string }[]>`
      select recommendation_id from recommendation_votes where visitor_hash = ${voter}
    `,
  );
  return new Set(rows.map((r) => r.recommendation_id));
}

export async function getRecommendationsForEditor(status: RecommendationStatus): Promise<Recommendation[]> {
  return withSchema(
    () => sql<Recommendation[]>`
      select ${columns()} from recommendations where status = ${status}
      order by ${status === "approved" ? sql`votes desc, created_at desc` : sql`created_at desc`}
      limit 200
    `,
  );
}

export async function countPendingRecommendations(): Promise<number> {
  try {
    const [row] = await withSchema(
      () => sql<{ count: string }[]>`select count(*) from recommendations where status = 'pending'`,
    );
    return Number(row.count);
  } catch {
    return 0;
  }
}
