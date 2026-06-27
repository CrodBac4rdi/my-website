import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Watchlist and Auth features will be disabled.'
  );
}

/**
 * Backward-Compat-Singleton für bestehende Client Components
 * (`import { supabase } from '@/lib/supabase'`).
 *
 * Nutzt jetzt den cookie-basierten SSR-Browser-Client → konsistente Session
 * mit Server Components / Server Actions / Proxy, und kein "Multiple
 * GoTrueClient instances" mehr.
 *
 * @deprecated Für neuen Code: `createClient()` aus '@/lib/supabase/client'
 * (Browser) bzw. '@/lib/supabase/server' (Server) verwenden. Mutations sollen
 * perspektivisch über die Service-/Action-Schicht laufen (siehe docs/ARCHITECTURE.md).
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = () => !!supabase;
