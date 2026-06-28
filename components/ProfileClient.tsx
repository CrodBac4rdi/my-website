'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, LogOut, CheckCircle2, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';
import ActivityFeed from '@/components/ActivityFeed';
import { toast } from '@/lib/toast';
import { updateProfileAction } from '@/lib/actions/profile';

type Profile = {
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
};

export default function ProfileClient({
  initialProfile,
  initialWatchlist,
}: {
  initialProfile: Profile;
  initialWatchlist: any[];
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const router = useRouter();

  const handleSave = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const res = await updateProfileAction({
        username: profile.username || null,
        bio: profile.bio || null,
        avatarUrl: profile.avatar_url || null,
        bannerUrl: profile.banner_url || null,
      });
      if (res.ok) toast.success('Profil gespeichert!');
      else toast.error(res.error);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* BANNER */}
      <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900">
        {profile?.banner_url ? (
          <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-blue-900 to-purple-900 opacity-50" />
        )}
      </div>

      <div className="px-4 md:px-12 flex flex-col md:flex-row gap-8 relative -mt-20 z-10">
        {/* AVATAR */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#060711] bg-slate-800 overflow-hidden shrink-0 shadow-2xl">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-4xl font-black uppercase">
              {profile?.username?.charAt(0) || '?'}
            </div>
          )}
        </div>

        {/* FORM */}
        <div className="flex-1 space-y-6 pt-4 md:pt-24 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Profil bearbeiten</h2>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-xl"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Benutzername
                <span className="ml-2 text-slate-600 normal-case font-normal">3–30 Zeichen, a-z 0-9 _</span>
              </label>
              <input
                value={profile?.username || ''}
                onChange={e => setProfile({ ...profile, username: e.target.value })}
                className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="Dein Name"
                maxLength={30}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Avatar URL</label>
              <input
                value={profile?.avatar_url || ''}
                onChange={e => setProfile({ ...profile, avatar_url: e.target.value })}
                className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="https://..."
                type="url"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Banner URL</label>
              <input
                value={profile?.banner_url || ''}
                onChange={e => setProfile({ ...profile, banner_url: e.target.value })}
                className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="https://..."
                type="url"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Bio
                <span className="ml-2 text-slate-600 normal-case font-normal">
                  {(profile?.bio || '').length}/500
                </span>
              </label>
              <textarea
                value={profile?.bio || ''}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 min-h-[100px] resize-none"
                placeholder="Erzähl etwas über dich..."
                maxLength={500}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              Profil speichern
            </button>
          </div>
        </div>
      </div>

      {/* RECENT WATCHLIST */}
      <div className="px-4 md:px-0 space-y-6 pt-12">
        <h3 className="text-2xl font-bold">Zuletzt zur Watchlist hinzugefügt</h3>
        {initialWatchlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {initialWatchlist.map((item, i) => {
              const mediaObj = Array.isArray(item.media) ? item.media[0] : item.media;
              if (!mediaObj) return null;
              return (
                <AnimeCard
                  key={item.id}
                  index={i}
                  media={{
                    id: mediaObj.id,
                    title: mediaObj.title,
                    poster_path: mediaObj.cover_url,
                    media_type: mediaObj.type,
                    vote_average: item.rating || 0,
                  }}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500">Noch keine Titel vorhanden.</p>
        )}
      </div>

      {/* ACTIVITY FEED */}
      <div className="px-4 md:px-0 space-y-6 pt-12">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <Activity className="text-blue-500" size={24} /> Deine Aktivität
        </h3>
        <ActivityFeed />
      </div>
    </div>
  );
}
