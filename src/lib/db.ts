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
  // prepare:false is required by Supabase's transaction pooler.
  const client = postgres(url, { prepare: false, ssl: "require", max: 5 });
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
