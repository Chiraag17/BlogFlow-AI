/**
 * In-Memory Sliding Window Rate Limiter
 * Protects authentication and AI generation routes from brute-force and cost exhaustion.
 */

interface RateLimitBucket {
  timestamps: number[];
}

const buckets = new Map<string, RateLimitBucket>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleBuckets(maxWindowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, bucket] of buckets.entries()) {
    const valid = bucket.timestamps.filter((ts) => now - ts < maxWindowMs);
    if (valid.length === 0) {
      buckets.delete(key);
    } else {
      bucket.timestamps = valid;
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanupStaleBuckets(Math.max(windowMs, 15 * 60 * 1000));

  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };

  // Keep only timestamps within the sliding window
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterSeconds: 0,
  };
}

export function getClientIdentifier(req: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return `ip:${firstIp}`;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return `ip:${realIp}`;
  return 'ip:anonymous';
}
