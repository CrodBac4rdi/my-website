import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import RecommendationsClient from '@/components/RecommendationsClient';

export const metadata: Metadata = {
  title: 'Empfehlungen',
  description: 'Personalisierte Anime- und Film-Empfehlungen auf Basis deiner Watchlist.',
};

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <RecommendationsClient />;
}
