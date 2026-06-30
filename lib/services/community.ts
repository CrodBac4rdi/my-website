import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type Client = SupabaseClient<Database>;

/** Beliebte öffentliche Profile (nach Follower-Zahl) für die Community-Seite. */
export async function getPopularProfiles(supabase: Client, limit = 24) {
  const { data } = await supabase
    .from('popular_public_profiles')
    .select('*')
    .order('followers', { ascending: false })
    .order('username', { ascending: true })
    .limit(limit);
  return data ?? [];
}

/** Öffentliche Listen (community-weit) — neueste zuerst. */
export async function getPublicLists(supabase: Client, limit = 24) {
  const { data } = await supabase
    .from('public_lists_view')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}
