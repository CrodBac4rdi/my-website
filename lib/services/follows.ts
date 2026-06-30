import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type Client = SupabaseClient<Database>;

/** Folgt targetId. RLS erzwingt: nur eigene Beziehung + nur öffentliche Profile. */
export async function followUser(supabase: Client, userId: string, targetId: string) {
  return await supabase.from('follows').insert({ follower_id: userId, following_id: targetId });
}

/** Entfolgt targetId. */
export async function unfollowUser(supabase: Client, userId: string, targetId: string) {
  return await supabase
    .from('follows')
    .delete()
    .eq('follower_id', userId)
    .eq('following_id', targetId);
}

/** Folgt userId bereits targetId? */
export async function isFollowing(supabase: Client, userId: string, targetId: string) {
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', userId)
    .eq('following_id', targetId)
    .maybeSingle();
  return !!data;
}

/** Follower- und Following-Zähler eines Profils (Follow-Graph ist öffentlich lesbar). */
export async function getFollowCounts(supabase: Client, profileId: string) {
  const [followers, following] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileId),
  ]);
  return { followers: followers.count ?? 0, following: following.count ?? 0 };
}

/** Social-Feed: Aktivitäten der gefolgten Nutzer (RLS gated Sichtbarkeit der Activity). */
export async function getSocialFeed(supabase: Client, userId: string, limit = 30) {
  const { data: rels } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const ids = (rels ?? []).map((r) => r.following_id);
  if (ids.length === 0) return { items: [], followingCount: 0 };

  const { data } = await supabase
    .from('social_feed')
    .select('*')
    .in('user_id', ids)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { items: data ?? [], followingCount: ids.length };
}
