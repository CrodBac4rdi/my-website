import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import type { UpdateProfileInput } from '@/lib/validation/profile';

type Client = SupabaseClient<Database>;

/** Profil upserten. id = userId erzwingt, dass nur das eigene Profil geschrieben wird. */
export async function updateProfile(supabase: Client, userId: string, input: UpdateProfileInput) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    username: input.username,
    bio: input.bio,
    avatar_url: input.avatarUrl,
    banner_url: input.bannerUrl,
    updated_at: new Date().toISOString(),
  });
  return { error };
}
