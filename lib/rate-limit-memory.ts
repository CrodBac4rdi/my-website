/**
 * Einfaches In-Memory-Rate-Limit pro IP für öffentliche, unauthentifizierte
 * API-Routen (/api/search, /api/discover). Bewusst kein DB-/RPC-basiertes
 * Limit: eine anon-aufrufbare RPC mit frei wählbarem Key wäre leicht zu
 * umgehen (Direktaufruf mit beliebigem Key) und würde eine neue öffentliche
 * Angriffsfläche schaffen. In-Memory ist pro Serverless-Instanz und setzt
 * bei Kaltstart zurück — für den Zweck (grobe Missbrauchsbremse, kein
 * hartes Sicherheitsfeature) ausreichend und proportional.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Alte Einträge gelegentlich aufräumen, damit die Map nicht unbegrenzt wächst.
let lastSweep = Date.now();
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export function ipFromRequest(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/** Erlaubt bis zu `max` Aufrufe pro `windowMs` Millisekunden für den gegebenen Key. */
export function checkMemoryRateLimit(
  key: string,
  max: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  sweep();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
