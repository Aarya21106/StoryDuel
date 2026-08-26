// ── Shared in-memory rate limiter ──
// One small utility reused anywhere a per-key action needs a hard cap
// (login attempts, story creation, etc). Not distributed — fine for a
// single-process deployment; revisit if this ever runs multi-instance.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Returns true if `key` is still under `max` actions within `windowMs`,
 * and records this attempt. Returns false (and does NOT count it) once
 * the caller is over the limit.
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) return false;
  bucket.count++;
  return true;
}
