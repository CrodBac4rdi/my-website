import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

/**
 * Server-Supabase-Client für Server Components, Server Actions und Route Handlers.
 *
 * Liest/schreibt die Session aus den Request-Cookies. In Next.js 16 ist
 * cookies() asynchron → die Funktion ist async und muss awaited werden.
 *
 * Auth-Hinweis: RLS bleibt die DB-seitige Verteidigung. Server Actions müssen
 * zusätzlich getUser() prüfen (nicht auf den Proxy verlassen).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Wird aus einer Server Component aufgerufen, wo Cookies nicht
            // gesetzt werden dürfen. Unkritisch: der Proxy (proxy.ts) refresht
            // die Session bei jedem passenden Request.
          }
        },
      },
    }
  );
}
