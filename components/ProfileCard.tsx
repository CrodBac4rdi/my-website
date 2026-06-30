import Link from 'next/link';
import { Globe, Lock, Users } from 'lucide-react';

type ProfileLite = {
  id?: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public?: boolean | null;
  followers?: number | null;
};

export default function ProfileCard({ profile }: { profile: ProfileLite }) {
  const name = profile.username || 'Unbenannt';
  return (
    <Link
      href={`/u/${profile.username ?? ''}`}
      className="glass rounded-2xl p-4 flex items-center gap-4 hover:border-primary-500/50 transition-colors"
    >
      <div className="w-14 h-14 rounded-full bg-surface-3 overflow-hidden shrink-0 border border-line-strong">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-faint text-xl font-black uppercase">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-fg truncate">{name}</span>
          {profile.is_public === false && <Lock size={12} className="text-faint shrink-0" />}
          {profile.is_public === true && <Globe size={12} className="text-success shrink-0" />}
        </div>
        {profile.bio ? (
          <p className="text-muted text-sm line-clamp-1 mt-0.5">{profile.bio}</p>
        ) : (
          <p className="text-faint text-sm mt-0.5">Kein Bio</p>
        )}
        {typeof profile.followers === 'number' && (
          <p className="text-faint text-[11px] mt-1 flex items-center gap-1">
            <Users size={11} /> {profile.followers} Follower
          </p>
        )}
      </div>
    </Link>
  );
}
