'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { followUserAction, unfollowUserAction } from '@/lib/actions/follows';

type Props = {
  targetId: string;
  username: string;
  isOwn: boolean;
  isAuthed: boolean;
  initialIsFollowing: boolean;
  followers: number;
  following: number;
};

function Stat({ value, label, href }: { value: number; label: string; href: string }) {
  return (
    <Link href={href} className="text-center group">
      <div className="text-xl font-display font-bold text-fg leading-none group-hover:text-primary-400 transition-colors">{value}</div>
      <div className="text-[10px] font-bold text-faint uppercase tracking-wider mt-1 group-hover:text-muted transition-colors">{label}</div>
    </Link>
  );
}

export default function FollowSection({ targetId, username, isOwn, isAuthed, initialIsFollowing, followers, following }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(followers);
  const [loading, setLoading] = useState(false);
  const guard = useRef(false);

  const toggle = async () => {
    if (guard.current) return;
    guard.current = true;

    const was = isFollowing;
    // Optimistisch umschalten.
    setIsFollowing(!was);
    setFollowerCount((c) => c + (was ? -1 : 1));
    setLoading(true);
    try {
      const res = was
        ? await unfollowUserAction({ targetId })
        : await followUserAction({ targetId });
      if (!res.ok) {
        setIsFollowing(was);
        setFollowerCount((c) => c + (was ? 1 : -1));
        toast.error(res.error);
      }
    } catch {
      setIsFollowing(was);
      setFollowerCount((c) => c + (was ? 1 : -1));
      toast.error('Unbekannter Fehler.');
    } finally {
      guard.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <Stat value={followerCount} label="Follower" href={`/u/${username}/followers`} />
      <Stat value={following} label="Folgt" href={`/u/${username}/following`} />

      {!isOwn &&
        (isAuthed ? (
          <button
            onClick={toggle}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 ${
              isFollowing
                ? 'bg-surface-2 border border-line text-muted hover:border-danger/40 hover:text-danger'
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow'
            }`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isFollowing ? (
              <UserCheck size={16} />
            ) : (
              <UserPlus size={16} />
            )}
            {isFollowing ? 'Folgst du' : 'Folgen'}
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary-600 hover:bg-primary-500 text-white shadow-glow transition-colors"
          >
            <UserPlus size={16} /> Folgen
          </Link>
        ))}
    </div>
  );
}
