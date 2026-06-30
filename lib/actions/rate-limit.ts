import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type Client = SupabaseClient<Database>;

/**
 * Prüft serverseitig ein Rate-Limit für den aktuellen Nutzer (DB-Funktion
 * check_rate_limit, SECURITY DEFINER). Gibt true zurück, wenn die Aktion
 * erlaubt ist, false bei Überschreitung. Fehler -> fail-open (true), damit
 * ein DB-Hickup keine legitime Aktion blockiert.
 */
export async function rateLimit(
  supabase: Client,
  action: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_action: action,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error('rateLimit error:', error);
    return true;
  }
  return data === true;
}
