// Creates the database tables and the public "media" storage bucket.
// Usage: npm run db:setup
import { readFile } from "node:fs/promises";
import { config } from "dotenv";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const { DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false, ssl: "require" });
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
await sql.unsafe(schema);
await sql.end();
console.log("✔ Database schema is up to date");

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data: existing } = await supabase.storage.getBucket("media");
  if (existing) {
    console.log("✔ Storage bucket 'media' already exists");
  } else {
    const { error } = await supabase.storage.createBucket("media", {
      public: true,
      fileSizeLimit: 8 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
    });
    if (error) {
      console.error("✖ Could not create storage bucket:", error.message);
      process.exit(1);
    }
    console.log("✔ Created public storage bucket 'media'");
  }
} else {
  console.warn("! SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing - skipped storage bucket setup");
}
