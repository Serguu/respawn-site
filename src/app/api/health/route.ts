import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Deployment health check. Reports only whether each setting exists
 * (never its value) and whether the database answers.
 */
export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const env = {
    DATABASE_URL: Boolean(url),
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    SESSION_SECRET: (process.env.SESSION_SECRET?.length ?? 0) >= 32,
  };
  const hints = {
    databaseUrlHasQuotes: /^["']|["']$/.test(url),
    databaseUrlHasSpaces: url !== url.trim(),
    databaseUrlStartsCorrectly: url.trim().replace(/^["']/, "").startsWith("postgresql://"),
    databaseUrlUsesPort6543: url.includes(":6543/"),
  };

  let database = "ok";
  if (env.DATABASE_URL) {
    try {
      await sql`select 1`;
    } catch (error) {
      database = String((error as Error).message)
        .replace(/postgres(ql)?:\/\/\S+/gi, "[url]")
        .slice(0, 200);
    }
  } else {
    database = "skipped: DATABASE_URL missing";
  }

  const healthy = Object.values(env).every(Boolean) && database === "ok";
  return NextResponse.json(
    { healthy, env, hints, database },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
