'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Loader2, LogOut, CheckCircle2, Activity, Trash2, AlertTriangle,
  Pencil, Star, Bookmark, Play, Clock, ListChecks, Globe, Lock, Copy,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';
import ActivityFeed from '@/components/ActivityFeed';
import AvatarPicker from '@/components/AvatarPicker';
import BannerPicker from '@/components/BannerPicker';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from '@/lib/toast';
import { updateProfileAction, updateVisibilityAction } from '@/lib/actions/profile';
import { deleteAccountAction } from '@/lib/actions/account';

type PublicFields = { stats?: boolean; bio?: boolean; activity?: boolean };

type Profile = {
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  is_public?: boolean;
  public_fields?: PublicFields | null;
};

export type WatchlistStats = {
  completed_count: number | null;
  watching_count: number | null;
  planned_count: number | null;
  dropped_count: number | null;
  on_hold_count: number | null;
  avg_rating: number | null;
  total_count: number | null;
};

function StatTile({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent: string;
}) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-1">
      <div className={`flex items-center gap-2 ${accent}`}>{icon}</div>
      <div className="text-2xl font-display font-bold text-fg leading-none">{value}</div>
      <div className="text-[11px] font-bold text-faint uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function ProfileClient({
  initialProfile,
  initialWatchlist,
  stats,
  email,
}: {
  initialProfile: Profile;
  initialWatchlist: any[];
  stats: WatchlistStats | null;
  email: string;
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean>(initialProfile.is_public ?? false);
  const [publicFields, setPublicFields] = useState<PublicFields>(initialProfile.public_fields ?? {});
  const savingRef = useRef(false);
  const router = useRouter();

  // Sichtbarkeit speichert sofort (GitHub-artig, kein „bist du sicher?").
  const saveVisibility = async (nextPublic: boolean, nextFields: PublicFields) => {
    const prevPublic = isPublic;
    const prevFields = publicFields;
    setIsPublic(nextPublic);
    setPublicFields(nextFields);
    const res = await updateVisibilityAction({ isPublic: nextPublic, publicFields: nextFields });
    if (!res.ok) {
      toast.error(res.error);
      setIsPublic(prevPublic);
      setPublicFields(prevFields);
    }
  };

  const toggleField = (key: keyof PublicFields) =>
    saveVisibility(isPublic, { ...publicFields, [key]: !publicFields[key] });

  const profileUrl = profile.username
    ? (typeof window !== 'undefined' ? window.location.origin : '') + `/u/${profile.username}`
    : '';

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const res = await deleteAccountAction();
    if (res.ok) {
      if (supabase) await supabase.auth.signOut();
      toast.success('Account gelöscht.');
      router.push('/');
    } else {
      toast.error(res.error);
      setDeleting(false);
    }
  };

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
      if (res.ok) {
        toast.success('Profil gespeichert!');
        setEditing(false);
      } else {
        toast.error(res.error);
      }
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

  const total = stats?.total_count ?? 0;
  const inputClass =
    'w-full bg-white/[.04] border border-line rounded-md px-4 py-3 text-sm text-fg placeholder:text-faint focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition';

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      {/* ===== IDENTITY HEADER ===== */}
      <div>
        <div className="relative h-56 md:h-72 rounded-3xl overflow-hidden border border-line bg-elev">
          {profile?.banner_url ? (
            <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-primary-700/40 to-primary-500/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
        </div>

        <div className="px-4 md:px-10 -mt-16 relative z-10 flex flex-col md:flex-row md:items-end gap-5">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-bg bg-surface-3 overflow-hidden shrink-0 shadow-2xl">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-faint text-4xl font-black uppercase">
                {profile?.username?.charAt(0) || '?'}
              </div>
            )}
          </div>

          <div className="flex-1 md:pb-2">
            <h1 className="font-display text-3xl font-bold text-fg">
              {profile?.username || 'Unbenannt'}
            </h1>
            <p className="text-faint text-sm">{email}</p>
            {profile?.bio && <p className="text-muted mt-2 max-w-xl leading-relaxed">{profile.bio}</p>}
          </div>

          <div className="flex gap-2 md:pb-2">
            <button
              onClick={() => setEditing((e) => !e)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-semibold bg-white/[.06] hover:bg-white/[.1] border border-line text-fg transition"
            >
              <Pencil size={15} /> {editing ? 'Schließen' : 'Bearbeiten'}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-semibold bg-danger/12 text-danger border border-line hover:bg-danger/20 transition"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* ===== STATS ===== */}
      {total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatTile icon={<ListChecks size={16} />} accent="text-primary-400" value={total} label="Titel gesamt" />
          <StatTile icon={<CheckCircle2 size={16} />} accent="text-success" value={stats?.completed_count ?? 0} label="Abgeschlossen" />
          <StatTile icon={<Play size={16} />} accent="text-primary-400" value={stats?.watching_count ?? 0} label="Schaut" />
          <StatTile icon={<Clock size={16} />} accent="text-muted" value={stats?.planned_count ?? 0} label="Geplant" />
          <StatTile
            icon={<Star size={16} className="fill-gold" />}
            accent="text-gold"
            value={stats?.avg_rating != null ? Number(stats.avg_rating).toFixed(1) : '–'}
            label="Ø Rating"
          />
        </div>
      )}

      {/* ===== SICHTBARKEIT ===== */}
      <section className="glass rounded-2xl p-6 md:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isPublic ? 'bg-success/10 border-success/30 text-success' : 'bg-surface-2 border-line text-faint'}`}>
              {isPublic ? <Globe size={20} /> : <Lock size={20} />}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-fg">
                Profil ist {isPublic ? 'öffentlich' : 'privat'}
              </h2>
              <p className="text-muted text-sm">
                {isPublic
                  ? 'Username, Profilbild und Watchlist sind für alle sichtbar.'
                  : 'Nur du siehst dein Profil.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => saveVisibility(!isPublic, publicFields)}
            className={`inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-semibold transition active:scale-[.98] ${
              isPublic
                ? 'bg-white/[.06] border border-line text-fg hover:bg-white/[.1]'
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow'
            }`}
          >
            {isPublic ? <><Lock size={15} /> Privat machen</> : <><Globe size={15} /> Öffentlich machen</>}
          </button>
        </div>

        {isPublic && (
          <>
            {/* Optionale Felder */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-bold text-faint uppercase tracking-wider w-full">Zusätzlich öffentlich zeigen</span>
              {([['stats', 'Statistiken'], ['bio', 'Bio'], ['activity', 'Aktivität']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => toggleField(key)}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition ${
                    publicFields[key]
                      ? 'bg-primary-500/15 border-primary-500 text-primary-400'
                      : 'bg-white/[.06] border-line text-muted hover:text-fg'
                  }`}
                >
                  {label}: {publicFields[key] ? 'an' : 'aus'}
                </button>
              ))}
            </div>

            {/* Öffentlicher Link */}
            {profile.username && (
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/u/${profile.username}`} className="text-primary-400 hover:underline text-sm font-medium break-all">
                  /u/{profile.username}
                </Link>
                <button
                  onClick={() => { if (profileUrl) { navigator.clipboard?.writeText(profileUrl); toast.success('Link kopiert.'); } }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-fg transition"
                >
                  <Copy size={13} /> Link kopieren
                </button>
              </div>
            )}
            {!profile.username && (
              <p className="text-warning text-sm">Setz zuerst einen Benutzernamen, damit dein Profil unter /u/… erreichbar ist.</p>
            )}
          </>
        )}
      </section>

      {/* ===== EDIT FORM (ausklappbar) ===== */}
      {editing && (
        <section className="glass rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="font-display text-xl font-bold text-fg">Profil bearbeiten</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-bold text-faint uppercase tracking-wider">
                Benutzername <span className="normal-case font-normal">· 3–30 Zeichen, a-z 0-9 _</span>
              </label>
              <input
                value={profile?.username || ''}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className={inputClass}
                placeholder="Dein Name"
                maxLength={30}
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-[11px] font-bold text-faint uppercase tracking-wider">Profilbild</label>
              <AvatarPicker
                value={profile?.avatar_url || null}
                onSelect={(url) => setProfile({ ...profile, avatar_url: url })}
              />
              <input
                value={profile?.avatar_url || ''}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                className={inputClass}
                placeholder="oder eigene Bild-URL (DiceBear, TMDB, Gravatar, GitHub)"
                type="url"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-[11px] font-bold text-faint uppercase tracking-wider">Banner</label>
              <BannerPicker
                value={profile?.banner_url || null}
                onSelect={(url) => setProfile({ ...profile, banner_url: url })}
              />
              <input
                value={profile?.banner_url || ''}
                onChange={(e) => setProfile({ ...profile, banner_url: e.target.value })}
                className={inputClass}
                placeholder="oder eigene Bild-URL (z.B. von TMDB)"
                type="url"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-bold text-faint uppercase tracking-wider">
                Bio · {(profile?.bio || '').length}/500
              </label>
              <textarea
                value={profile?.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className={`${inputClass} min-h-[100px] resize-none`}
                placeholder="Erzähl etwas über dich..."
                maxLength={500}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 h-11 rounded-md transition shadow-glow disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98]"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            Speichern
          </button>
        </section>
      )}

      {/* ===== RECENT WATCHLIST ===== */}
      <div className="space-y-6">
        <h3 className="font-display text-2xl font-bold flex items-center gap-3">
          <Bookmark className="text-primary-500" size={24} /> Zuletzt hinzugefügt
        </h3>
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
          <p className="text-faint">Noch keine Titel auf der Watchlist.</p>
        )}
      </div>

      {/* ===== ACTIVITY FEED ===== */}
      <div className="space-y-6">
        <h3 className="font-display text-2xl font-bold flex items-center gap-3">
          <Activity className="text-primary-500" size={24} /> Deine Aktivität
        </h3>
        <ActivityFeed />
      </div>

      {/* ===== DANGER ZONE ===== */}
      <div className="border border-danger/30 bg-danger/[.04] rounded-2xl p-6 md:p-8 space-y-4">
        <h3 className="font-display text-xl font-bold text-danger flex items-center gap-3">
          <AlertTriangle size={22} /> Danger Zone
        </h3>
        <p className="text-muted text-sm leading-relaxed max-w-xl">
          Account löschen entfernt dein Profil, deine Watchlist, Listen, Reviews und
          Benachrichtigungen <strong className="text-fg font-semibold">unwiderruflich</strong>.
        </p>
        <button
          onClick={() => setConfirmDelete(true)}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-md text-sm font-semibold bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25 transition active:scale-[.98]"
        >
          <Trash2 size={16} /> Account löschen
        </button>
      </div>

      <ConfirmModal
        open={confirmDelete}
        danger
        title="Account endgültig löschen?"
        message="Alle deine Daten (Profil, Watchlist, Listen, Reviews, Benachrichtigungen) werden unwiderruflich gelöscht. Das kann nicht rückgängig gemacht werden."
        confirmLabel="Account löschen"
        requireText="LÖSCHEN"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
