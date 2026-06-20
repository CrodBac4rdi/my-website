'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Camera, LogOut, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      setProfile(profileData || { username: '', bio: '', avatar_url: '', banner_url: '' });

      const { data: watchData } = await supabase
        .from('user_watchlist')
        .select(`
          id, status, rating, media (id, title, cover_url, type)
        `)
        .eq('user_id', user.id)
        .limit(6);
        
      if (watchData) setWatchlist(watchData);

      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleSave = async () => {
    if (!supabase || !profile) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        username: profile.username,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        banner_url: profile.banner_url,
        updated_at: new Date().toISOString()
      });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="animate-spin text-blue-500" size={64} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* BANNER */}
      <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 group">
        {profile?.banner_url ? (
          <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-blue-900 to-purple-900 opacity-50"></div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <label className="cursor-pointer bg-black/60 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 hover:bg-black/80">
             <Camera size={16} /> Banner URL ändern
             <input type="text" className="hidden" /> {/* TODO: Better UI for image uploads */}
           </label>
        </div>
      </div>

      <div className="px-4 md:px-12 flex flex-col md:flex-row gap-8 relative -mt-20 z-10">
        {/* AVATAR */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#020205] bg-slate-800 overflow-hidden group shrink-0 shadow-2xl">
          {profile?.avatar_url ? (
             <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-slate-500 text-4xl font-black uppercase">
               {profile?.username?.charAt(0) || '?'}
             </div>
          )}
        </div>

        {/* INFO FORM */}
        <div className="flex-1 space-y-6 pt-4 md:pt-24 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-md">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Profil bearbeiten</h2>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-xl">
                <LogOut size={16} /> Logout
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Benutzername</label>
               <input 
                 value={profile?.username || ''} 
                 onChange={e => setProfile({...profile, username: e.target.value})}
                 className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" 
                 placeholder="Dein Name"
               />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Avatar URL</label>
               <input 
                 value={profile?.avatar_url || ''} 
                 onChange={e => setProfile({...profile, avatar_url: e.target.value})}
                 className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" 
                 placeholder="https://..."
               />
             </div>
             <div className="space-y-2 md:col-span-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Banner URL</label>
               <input 
                 value={profile?.banner_url || ''} 
                 onChange={e => setProfile({...profile, banner_url: e.target.value})}
                 className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" 
                 placeholder="https://..."
               />
             </div>
             <div className="space-y-2 md:col-span-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Bio</label>
               <textarea 
                 value={profile?.bio || ''} 
                 onChange={e => setProfile({...profile, bio: e.target.value})}
                 className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 min-h-[100px]" 
                 placeholder="Erzähl etwas über dich..."
               />
             </div>
           </div>

           <div className="pt-4">
             <button 
               onClick={handleSave}
               disabled={saving}
               className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
             >
               {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
               Profil speichern
             </button>
           </div>
        </div>
      </div>

      {/* PUBLIC FAVORITES PREVIEW */}
      <div className="px-4 md:px-0 space-y-6 pt-12">
        <h3 className="text-2xl font-bold">Zuletzt zur Watchlist hinzugefügt</h3>
        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchlist.map((item, i) => (
               <AnimeCard 
                 key={item.id} 
                 index={i}
                 media={{
                   id: item.media?.id,
                   title: item.media?.title,
                   poster_path: item.media?.cover_url?.replace('https://image.tmdb.org/t/p/w500', ''),
                   media_type: item.media?.type,
                   vote_average: item.rating || 0
                 }}
               />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Noch keine Titel vorhanden.</p>
        )}
      </div>

    </div>
  );
}
