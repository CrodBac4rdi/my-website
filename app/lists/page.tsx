import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLists } from '@/lib/services/lists';
import ListsClient from '@/components/ListsClient';

export default async function CustomListsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await getLists(supabase, user.id);

  return <ListsClient initialLists={data ?? []} />;
}
