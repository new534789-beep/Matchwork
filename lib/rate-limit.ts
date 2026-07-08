import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// En production multi-instance (Vercel), un rate limit en mémoire locale ne
// compte que les requêtes vues par CETTE instance — la limite réelle explose
// avec plusieurs régions/instances. Si Upstash est configuré, on l'utilise ;
// sinon on retombe sur la mémoire locale (suffisant en dev mono-instance).
const upstashConfigure = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = upstashConfigure ? Redis.fromEnv() : null;
const limiteursUpstash = new Map<string, Ratelimit>();

function getLimiteurUpstash(maxRequests: number, windowMs: number): Ratelimit {
  const cle = `${maxRequests}:${windowMs}`;
  let l = limiteursUpstash.get(cle);
  if (!l) {
    l = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
      prefix: "matchwork-ratelimit",
    });
    limiteursUpstash.set(cle, l);
  }
  return l;
}

// Fallback mémoire (dev / pas d'Upstash configuré)
const hits = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of hits) {
    if (val.resetAt <= now) hits.delete(key);
  }
}, 60_000);

function rateLimitMemoire(
  key: string,
  maxRequests: number,
  windowMs: number
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  return { ok: entry.count <= maxRequests, remaining };
}

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ ok: boolean; remaining: number }> {
  if (!upstashConfigure) return rateLimitMemoire(key, maxRequests, windowMs);

  const { success, remaining } = await getLimiteurUpstash(maxRequests, windowMs).limit(key);
  return { ok: success, remaining };
}
