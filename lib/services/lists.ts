import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { ensureMedia } from '@/lib/services/media';
import type { CreateListInput, AddListItemInput } from '@/lib/validation/lists';

type Client = SupabaseClient<Database>;

/** Listen eines Nutzers (für Server Components). */
export async function getLists(supabase: Client, userId: string) {
  return await supabase
    .from('custom_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function createList(supabase: Client, userId: string, input: CreateListInput) {
  return await supabase
    .from('custom_lists')
    .insert({ user_id: userId, name: input.name, description: input.description ?? null })
    .select()
    .single();
}

/** Listen-Sichtbarkeit (öffentlich/privat) umschalten. */
export async function setListVisibility(
  supabase: Client,
  userId: string,
  listId: string,
  isPublic: boolean
) {
  const { error } = await supabase
    .from('custom_lists')
    .update({ is_public: isPublic })
    .eq('id', listId)
    .eq('user_id', userId);
  return { error };
}

/** Öffentliche Listen eines Nutzers (für die öffentliche Profilseite). */
export async function getPublicListsByUser(supabase: Client, userId: string) {
  return await supabase
    .from('public_lists_view')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function deleteList(supabase: Client, userId: string, listId: string) {
  const { error } = await supabase
    .from('custom_lists')
    .delete()
    .eq('id', listId)
    .eq('user_id', userId);
  return { error };
}

/**
 * Item einer Liste hinzufügen. Sichert media-Cache, berechnet die nächste
 * sort_order server-seitig und gibt das angelegte Item inkl. media zurück.
 * Ownership wird durch RLS (list_items_insert_own) erzwungen.
 */
export async function addListItem(supabase: Client, input: AddListItemInput) {
  const { error: mediaError } = await ensureMedia(supabase, input);
  if (mediaError) return { data: null, error: mediaError };

  const { data: maxRow } = await supabase
    .from('custom_list_items')
    .select('sort_order')
    .eq('list_id', input.listId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxRow?.sort_order ?? 0) + 1;

  return await supabase
    .from('custom_list_items')
    .insert({ list_id: input.listId, media_id: input.mediaId, sort_order: nextOrder })
    .select('id, sort_order, added_at, media (id, title, cover_url, type)')
    .single();
}

/**
 * Item aus einer Liste entfernen. Kein user_id-Scope möglich (kein user_id auf
 * der Item-Tabelle) — Ownership wird durch RLS (list_items_delete_own über die
 * Parent-Liste) erzwungen.
 */
export async function removeListItem(supabase: Client, itemId: number) {
  const { error } = await supabase.from('custom_list_items').delete().eq('id', itemId);
  return { error };
}
