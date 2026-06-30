import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProfileByUsername } from '@/lib/services/profile';
import { getFollowers, getFollowingProfiles } from '@/lib/services/follows';
import ProfileCard from '@/components/ProfileCard';

export default async function FollowListView({
  username,
  mode,
}: {
  username: string;
  mode: 'followers' | 'following';
}) {
  const supabase = await createClient();
  const { data: profile } = await getProfileByUsername(supabase, username);
  if (!profile) notFound();

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();
  const isOwner = viewer?.id === profile.id;

  // Privatsphäre wie auf der Profilseite: nicht-öffentlich -> nur der Owner sieht es.
  if (!profile.is_public && !isOwner) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="p-4 rounded-2xl bg-surface-2 border border-line-strong">
          <Lock size={36} className="text-faint" />
        </div>
        <h1 className="font-display text-2xl font-bold text-fg">@{username} ist privat</h1>
        <Link href="/" className="text-primary-400 hover:underline font-semibold">Zur Startseite</Link>
      </div>
    );
  }

  const profiles = mode === 'followers' ? await getFollowers(supabase, profile.id) : await getFollowingProfiles(supabase, profile.id);
  const title = mode === 'followers' ? 'Follower' : 'Folgt';

  return (
    <div className="max-w-3xl mx-auto pb-24 pt-8 space-y-8">
      <div className="space-y-2">
        <Link href={`/u/${username}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors">
          <ArrowLeft size={15} /> @{username}
        </Link>
        <h1 className="font-display text-3xl font-bold text-fg flex items-center gap-3">
          <Users className="text-primary-500" size={28} /> {title}
        </h1>
      </div>

      {profiles.length === 0 ? (
        <p className="text-faint text-center py-16">
          {mode === 'followers' ? 'Noch keine Follower.' : 'Folgt noch niemandem.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profiles.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </div>
  );
}
