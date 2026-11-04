import "server-only";
import { createHash } from "node:crypto";

const BOT_PATTERN = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;

export function isBot(userAgent: string | null) {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}

/** Anonymous, daily-rotating visitor id. The raw IP is never stored. */
export function visitorHash(headers: Headers) {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${clientIp(headers)}|${headers.get("user-agent") ?? ""}|${day}|${process.env.SESSION_SECRET}`)
    .digest("hex");
}
