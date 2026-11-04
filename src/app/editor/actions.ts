"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import { clientIp } from "@/lib/visitor";

// Used when the username doesn't exist, so timing doesn't reveal valid usernames.
const DUMMY_HASH = "$2b$12$FbzHDFgrjVZKDuVaXNy/KOx0Vbf2RE7QkKyzq9BDOuKR6q1RReWMG";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Enter your username and password." };

  const ip = clientIp(await headers());
  const limit = checkRateLimit(`login:${ip}`);
  if (!limit.allowed) {
    return { error: `Too many attempts. Try again in ${limit.retryInMinutes} min.` };
  }

  const [editor] = await sql<{ id: string; password_hash: string }[]>`
    select id, password_hash from editors where username = ${username}
  `;
  const valid = await bcrypt.compare(password, editor?.password_hash ?? DUMMY_HASH);
  if (!editor || !valid) return { error: "Invalid username or password." };

  resetRateLimit(`login:${ip}`);
  const session = await getSession();
  session.editorId = editor.id;
  await session.save();
  redirect("/editor/dashboard");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/editor");
}
