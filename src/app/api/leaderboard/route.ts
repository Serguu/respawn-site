import { NextResponse, type NextRequest } from "next/server";
import { getLeaderboard, isGameId } from "@/lib/scores";

/** Top 10 for a game: ?game=snake|aim|trivia&period=week|all */
export async function GET(request: NextRequest) {
  const game = request.nextUrl.searchParams.get("game");
  const period = request.nextUrl.searchParams.get("period") === "all" ? "all" : "week";
  if (!isGameId(game)) return NextResponse.json({ error: "Unknown game" }, { status: 400 });

  const entries = await getLeaderboard(game, period);
  return NextResponse.json(
    { entries },
    // Short CDN cache: the board stays fresh, but a busy page doesn't query the database every time.
    { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" } },
  );
}
