// Creates (or resets the password of) an editor account.
// Usage: npm run editor:create -- <username> <password> "<Display Name>"
import { config } from "dotenv";
import postgres from "postgres";
import bcrypt from "bcryptjs";

config({ path: ".env.local" });

const [username, password, displayName] = process.argv.slice(2);
if (!username || !password) {
  console.error('Usage: npm run editor:create -- <username> <password> "<Display Name>"');
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false, ssl: "require" });
const hash = await bcrypt.hash(password, 12);
await sql`
  insert into editors (username, password_hash, display_name)
  values (${username.toLowerCase()}, ${hash}, ${displayName || username})
  on conflict (username) do update
    set password_hash = excluded.password_hash,
        display_name  = excluded.display_name
`;
await sql.end();
console.log(`✔ Editor "${username.toLowerCase()}" is ready. Log in at /editor`);
