import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, List as ListIcon, Compass } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getPopularProfiles, getPublicLists } from '@/lib/services/community';
import ProfileCard from '@/components/ProfileCard';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Entdecke öffentliche Profile und Listen anderer HORIZON-Nutzer.',
};

export default async function CommunityPage() {
  const supabase = await createClient();
  const [profiles, lists] = await Promise.all([
    getPopularProfiles(supabase, 24),
    getPublicLists(supabase, 18),
  ]);

  return (
    <div className="max-w-5xl mx-auto pb-24 pt-8 space-y-12">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-primary-400 font-bold uppercase tracking-[0.2em] text-xs">
          <Compass size={16} /> Community
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg tracking-tight">Entdecke andere</h1>
        <p className="text-muted max-w-xl">Öffentliche Profile und geteilte Listen aus der HORIZON-Community.</p>
      </header>

      {/* PROFILE */}
      <section className="space-y-5">
        <h2 className="font-display text-2xl font-bold flex items-center gap-3">
          <Users className="text-primary-500" size={24} /> Beliebte Profile
        </h2>
        {profiles.length === 0 ? (
          <p className="text-faint">Noch keine öffentlichen Profile. Stell deins in den Profil-Einstellungen öffentlich.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <ProfileCard key={p.id as string} profile={p} />
            ))}
          </div>
        )}
      </section>

      {/* LISTEN */}
      <section className="space-y-5">
        <h2 className="font-display text-2xl font-bold flex items-center gap-3">
          <ListIcon className="text-primary-500" size={24} /> Öffentliche Listen
        </h2>
        {lists.length === 0 ? (
          <p className="text-faint">Noch keine öffentlichen Listen.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lists.map((l: any) => (
              <Link
                key={l.id}
                href={`/lists/${l.id}`}
                className="glass rounded-2xl p-5 hover:border-primary-500/50 transition-colors flex flex-col justify-between h-36"
              >
                <div>
                  <h3 className="font-bold text-fg truncate">{l.name}</h3>
                  <p className="text-faint text-sm line-clamp-2 mt-1">{l.description || 'Keine Beschreibung'}</p>
                </div>
                <div className="flex items-center justify-between text-faint text-xs mt-2">
                  <span>{l.item_count} Titel</span>
                  {l.author_username && <span>von @{l.author_username}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
