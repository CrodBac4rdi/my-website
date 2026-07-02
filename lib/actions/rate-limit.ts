import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type Client = SupabaseClient<Database>;

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

/**
 * Prüft serverseitig ein Rate-Limit für den aktuellen Nutzer (DB-Funktion
 * check_rate_limit, SECURITY DEFINER). Liefert zusätzlich zurück, in wie
 * vielen Sekunden die Aktion wieder erlaubt ist (für eine hilfreiche
 * Fehlermeldung statt eines generischen "warte kurz"). Fehler -> fail-open
 * (allowed: true), damit ein DB-Hickup keine legitime Aktion blockiert.
 */
export async function rateLimit(
  supabase: Client,
  action: string,
  max: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_action: action,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error('rateLimit error:', error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { allowed: row?.allowed === true, retryAfterSeconds: row?.retry_after_seconds ?? 0 };
}

/** Formatiert die Wartezeit für eine Fehlermeldung ("in 12 Sekunden" / "in 2 Minuten"). */
export function formatRetryAfter(seconds: number): string {
  if (seconds <= 0) return '';
  if (seconds < 60) return `in ${seconds} Sekunde${seconds === 1 ? '' : 'n'}`;
  const minutes = Math.ceil(seconds / 60);
  return `in ${minutes} Minute${minutes === 1 ? '' : 'n'}`;
}
