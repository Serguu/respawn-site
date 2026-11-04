import "server-only";
import { sql } from "./db";
import type { TeamMember } from "./types";

export const SOCIAL_PLATFORMS = [
  { key: "x", label: "X / Twitter" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "twitch", label: "Twitch" },
  { key: "tiktok", label: "TikTok" },
  { key: "discord", label: "Discord" },
  { key: "steam", label: "Steam" },
  { key: "website", label: "Website" },
] as const;

export async function getTeamMembers(): Promise<TeamMember[]> {
  return sql<TeamMember[]>`
    select id, name, role, bio, avatar_url, socials, sort_order
    from team_members
    order by sort_order asc, created_at asc
  `;
}
