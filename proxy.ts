import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (ehemals `middleware.ts` — in v16 umbenannt zu `proxy.ts`,
 * Funktion `proxy`). Hält die Supabase-Session frisch: bei jedem passenden
 * Request wird das Auth-Token validiert/erneuert und die aktualisierten Cookies
 * werden an Request und Response durchgereicht.
 *
 * WICHTIG: NICHT allein auf den Proxy für Autorisierung verlassen. Server
 * Functions/Actions laufen als POST auf ihre eigene Route und können je nach
 * Matcher übersprungen werden. Jede Server Action / jeder Service prüft Auth
 * selbst via supabase.auth.getUser(). RLS ist die DB-seitige Absicherung.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Ohne Env-Variablen kann/soll der Proxy nichts tun.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validiert das Token serverseitig und triggert ggf. einen Token-Refresh,
  // dessen Set-Cookie-Header über setAll an die Response gehängt werden.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Alle Request-Pfade außer:
     * - _next/static, _next/image (Build-Assets)
     * - favicon.ico, manifest.json (Metadaten)
     * - sw.js, workbox-* (next-pwa Service Worker)
     * - Bilddateien
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw\\.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
