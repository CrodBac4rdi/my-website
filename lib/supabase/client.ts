import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

/**
 * Browser-Supabase-Client für Client Components.
 *
 * Verwendet cookie-basierte Sessions (über @supabase/ssr), damit Browser und
 * Server (Server Components, Server Actions, Proxy) dieselbe Session teilen.
 * createBrowserClient memoisiert intern → mehrfaches Aufrufen erzeugt keine
 * doppelten GoTrueClient-Instanzen.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
