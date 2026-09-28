/**
 * Small in-process rate limiter for the unauthenticated entry points
 * (sign-in, account requests).
 *
 * LIMITATION, on purpose: the counters live in the memory of one server
 * instance. On Vercel that means a determined attacker spread across many
 * cold starts gets more attempts than the numbers below suggest. It still
 * takes credential stuffing and signup spam from "free and unlimited" to
 * "slow and awkward" with no new infrastructure. When a Redis/Postgres
 * limiter is available, replace `hit()` here and every call site keeps
 * working unchanged.
 */
import { headers } from "next/headers";

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();
let lastSweep = 0;

/** Drop expired windows occasionally so the map can't grow without bound. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export interface RateLimitResult {
  /** True when the caller is over the limit and should be turned away. */
  limited: boolean;
  /** Whole seconds until the window resets. */
  retryAfterSeconds: number;
}

/**
 * Count one attempt against `key`.
 *
 * Fixed window: the first attempt starts a window of `windowMs`; once `limit`
 * attempts land inside it, everything further is limited until it resets.
 */
export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  return {
    limited: existing.count > limit,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

/** Forget a key — call after a successful sign-in so one typo doesn't linger. */
export function reset(key: string): void {
  windows.delete(key);
}

/**
 * Best-effort client IP from the proxy headers Vercel sets. Falls back to a
 * shared bucket, which only makes the limit stricter, never looser.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/** How long to wait, phrased for a person. */
export function retryMessage(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutes > 1 ? `about ${minutes} minutes` : "a minute";
}
