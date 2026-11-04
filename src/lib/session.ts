import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { sql } from "./db";

type SessionData = { editorId?: string };

export type Editor = { id: string; username: string; display_name: string };

function sessionOptions() {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long.");
  }
  return {
    password,
    cookieName: "editor_session",
    ttl: 60 * 60 * 24 * 7, // 7 days
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}

export async function getCurrentEditor(): Promise<Editor | null> {
  const session = await getSession();
  if (!session.editorId) return null;
  const [editor] = await sql<Editor[]>`
    select id, username, display_name from editors where id = ${session.editorId}
  `;
  return editor ?? null;
}

/** Use at the top of every editor page, server action and route handler. */
export async function requireEditor(): Promise<Editor> {
  const editor = await getCurrentEditor();
  if (!editor) redirect("/editor");
  return editor;
}
