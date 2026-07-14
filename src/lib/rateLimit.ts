import { prisma } from './db';

/**
 * Basic abuse protection for public POST endpoints. DB-backed rather than
 * in-memory — an in-memory counter resets on every serverless cold start,
 * which gives a false sense of protection on Vercel. This is intentionally
 * simple (good enough for a single restaurant's traffic); if you outgrow
 * it, swap for Upstash Redis + @upstash/ratelimit, which is the standard
 * choice on Vercel for higher-traffic rate limiting.
 */
export async function checkRateLimit(
  identifier: string,
  opts: { windowMs: number; max: number }
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const windowStart = new Date(Date.now() - opts.windowMs);

  const recentHits = await prisma.rateLimitHit.count({
    where: { key: identifier, createdAt: { gte: windowStart } }
  });

  if (recentHits >= opts.max) {
    return { allowed: false, retryAfterSeconds: Math.ceil(opts.windowMs / 1000) };
  }

  await prisma.rateLimitHit.create({ data: { key: identifier } });
  return { allowed: true };
}

/** Best-effort client IP extraction behind Vercel's proxy. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}
