import "server-only";

// Simple in-memory limiter for the login form. Good enough for a single
// editor; on serverless each instance keeps its own counters.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryInMinutes: 0 };
  }
  entry.count += 1;
  if (entry.count > max) {
    return { allowed: false, retryInMinutes: Math.ceil((entry.resetAt - now) / 60000) };
  }
  return { allowed: true, retryInMinutes: 0 };
}

export function resetRateLimit(key: string) {
  attempts.delete(key);
}
