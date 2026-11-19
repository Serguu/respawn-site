import "server-only";
import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

declare global {
  var __sqlPool: { url: string; client: Sql } | undefined;
}

function getClient(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  // Reuse one pool across hot reloads, but rebuild it if .env.local changed.
  const cached = globalThis.__sqlPool;
  if (cached?.url === url) return cached.client;
  cached?.client.end({ timeout: 5 }).catch(() => {});
  // Settings for Supabase's transaction pooler (Supavisor) on serverless:
  // - prepare: false — the pooler can't keep prepared statements between transactions.
  // - max_pipeline: 1 — postgres.js otherwise sends several queries on one busy connection without
  //   waiting for answers (pipelining). Through Supavisor that left queries stuck forever (server
  //   waiting on "Client"), which hung every page that ran more than `max` queries at once.
  // - queue_timeout — a query waiting for a free connection fails after 15 s instead of hanging.
  // - idle_timeout / max_lifetime / connect_timeout — don't keep connections around for long.
  const client = postgres(url, {
    prepare: false,
    ssl: "require",
    max: 5,
    max_pipeline: 1,
    queue_timeout: 15,
    idle_timeout: 20,
    max_lifetime: 60 * 5,
    connect_timeout: 10,
  });
  globalThis.__sqlPool = { url, client };
  return client;
}

// Proxy so `sql` can be imported normally while the pool is created lazily.
export const sql = new Proxy(function () {} as unknown as Sql, {
  apply: (_t, _this, args) => (getClient() as unknown as (...a: unknown[]) => unknown)(...args),
  get: (_t, prop) => {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as Sql;
