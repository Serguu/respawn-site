import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { isBot, visitorHash } from "@/lib/visitor";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Payload =
  | { type: "view"; id: string }
  | { type: "click"; id: string }
  | { type: "impressions"; ids: string[] };

export async function POST(request: NextRequest) {
  if (isBot(request.headers.get("user-agent"))) return new NextResponse(null, { status: 204 });

  let payload: Payload;
  try {
    payload = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (payload.type === "view" && UUID.test(payload.id)) {
    // Only count the first view per anonymous visitor per day.
    const inserted = await sql`
      insert into view_events (article_id, visitor_hash)
      select id, ${visitorHash(request.headers)} from articles
      where id = ${payload.id} and status = 'published'
      on conflict do nothing
      returning article_id
    `;
    if (inserted.length) {
      await sql`update articles set view_count = view_count + 1 where id = ${payload.id}`;
    }
  } else if (payload.type === "click" && UUID.test(payload.id)) {
    await sql`update articles set home_click_count = home_click_count + 1 where id = ${payload.id}`;
  } else if (payload.type === "impressions" && Array.isArray(payload.ids)) {
    const ids = [...new Set(payload.ids.filter((id) => typeof id === "string" && UUID.test(id)))].slice(0, 50);
    if (ids.length) {
      await sql`update articles set home_impression_count = home_impression_count + 1 where id in ${sql(ids)}`;
    }
  } else {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  return new NextResponse(null, { status: 204 });
}
