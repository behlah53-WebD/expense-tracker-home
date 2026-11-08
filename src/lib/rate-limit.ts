/**
 * Lightweight in-process rate limiter (no Redis dependency).
 *
 * Uses a sliding-window token-bucket approach stored in a Map.
 * Good enough for a single-server / Vercel serverless deployment where
 * per-function instances are short-lived.  For multi-region, swap the Map
 * for an Upstash Redis client.
 *
 * Usage:
 *   const limiter = createRateLimiter({ max: 10, windowMs: 60_000 });
 *   const result  = limiter.check(ip);
 *   if (!result.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function createRateLimiter({
  max,
  windowMs,
}: {
  max: number;
  windowMs: number;
}) {
  const store = new Map<string, Bucket>();

  // Prune expired buckets every 5 minutes to prevent memory leak
  if (typeof setInterval !== "undefined") {
    setInterval(() => {
      const now = Date.now();
      for (const [key, bucket] of store) {
        if (bucket.resetAt < now) store.delete(key);
      }
    }, 5 * 60_000).unref?.();
  }

  function check(key: string): RateLimitResult {
    const now = Date.now();
    let bucket = store.get(key);

    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + windowMs };
      store.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);
    return { ok: bucket.count <= max, remaining, resetAt: bucket.resetAt };
  }

  return { check };
}

// ── Shared limiters ─────────────────────────────────────────────────────────

/** Auth routes: 10 requests per minute per IP */
export const authLimiter = createRateLimiter({ max: 10, windowMs: 60_000 });

/** General API routes: 120 requests per minute per IP */
export const apiLimiter = createRateLimiter({ max: 120, windowMs: 60_000 });

/** Helper: extract IP from Next.js request */
export function getClientIp(req: Request): string {
  const headers = req instanceof Request ? req.headers : (req as any).headers;
  return (
    (headers.get?.("x-forwarded-for") ?? "").split(",")[0].trim() ||
    (headers.get?.("x-real-ip") ?? "") ||
    "unknown"
  );
}

