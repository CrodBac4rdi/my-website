import { createClient } from '@/lib/supabase/server';

/**
 * Liefert einen Server-Supabase-Client + den aktuell authentifizierten User.
 * In jeder Server Action am Anfang aufrufen — Actions sind per POST direkt
 * erreichbar, daher MUSS Auth pro Action geprüft werden (nicht nur im Proxy).
 */
export async function getAuthedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
