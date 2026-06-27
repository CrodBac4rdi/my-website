'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Star, Send, Loader2, User, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';

export default function ReviewSection({ animeId }: { animeId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(8);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());
  const submittingRef = useRef(false); // synchroner Guard gegen Doppelklick

  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }
    fetchReviews();
  }, [animeId]);

  async function fetchReviews() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(username, avatar_url)')
        .eq('media_id', Number(animeId))
        .order('created_at', { ascending: false });

      if (!error && data) setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user || !newReview.trim()) return;
    if (newReview.trim().length < 10) {
      toast.error('Review muss mindestens 10 Zeichen lang sein.');
      return;
    }

    if (submittingRef.current) return; // verhindert Doppelklick
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        media_id: Number(animeId),
        rating,
        content: newReview.trim(),
        is_spoiler: isSpoiler,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('Du hast diesen Titel bereits bewertet.');
        } else {
          toast.error('Fehler beim Abschicken.');
          console.error('Review insert error:', error);
        }
      } else {
        toast.success('Review veröffentlicht!');
        setNewReview('');
        setIsSpoiler(false);
        setRating(8);
        await fetchReviews();
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!supabase || !user) return;
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Fehler beim Löschen.');
    } else {
      toast.success('Review gelöscht.');
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    }
  }

  function toggleSpoiler(reviewId: string) {
    setRevealedSpoilers(prev => {
      const next = new Set(prev);
      next.has(reviewId) ? next.delete(reviewId) : next.add(reviewId);
      return next;
    });
  }

  return (
    <section className="space-y-12 container mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <MessageSquare className="text-pink-500" size={24} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Community Feedback</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent ml-8 hidden md:block" />
      </div>

      {/* REVIEW FORM */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] space-y-8 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Deine Wertung</span>
              <p className="text-slate-300 font-medium">Wie gefällt dir dieser Titel?</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all border flex items-center justify-center ${
                    rating >= num
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <textarea
              value={newReview}
              onChange={e => setNewReview(e.target.value)}
              placeholder="Was denkst du über diesen Anime? (mind. 10 Zeichen)"
              maxLength={5000}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl p-6 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all h-40 resize-none placeholder:text-slate-600"
            />
            <span className="absolute bottom-4 right-6 text-xs text-slate-600">
              {newReview.length}/5000
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-red-400 transition-colors">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={e => setIsSpoiler(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-red-500"
              />
              <span className="font-bold text-sm">Enthält Spoiler</span>
            </label>
            <button
              type="submit"
              disabled={submitting || newReview.trim().length < 10}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={20} />}
              Feedback abschicken
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-900/30 border border-slate-800 border-dashed p-12 rounded-[2.5rem] text-center">
          <p className="text-slate-400 font-medium text-lg">Logge dich ein, um deine Meinung zu teilen!</p>
        </div>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-6">
            {reviews.map(review => {
              const isOwn = user?.id === review.user_id;
              const spoilerRevealed = revealedSpoilers.has(review.id);

              return (
                <div key={review.id} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 overflow-hidden">
                        {review.profiles?.avatar_url ? (
                          <img src={review.profiles.avatar_url} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-slate-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-lg leading-none">
                          {review.profiles?.username || 'Anonymer User'}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">
                          {new Date(review.created_at).toLocaleDateString('de-DE')}
                          {review.updated_at !== review.created_at && ' · bearbeitet'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl text-blue-400 font-bold flex items-center gap-2">
                        <Star size={16} className="fill-blue-500" />
                        {review.rating}/10
                      </div>
                      {isOwn && (
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                          title="Review löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SPOILER HANDLING — kein innerHTML, XSS-sicher */}
                  {review.is_spoiler && !spoilerRevealed ? (
                    <div className="relative">
                      <p className="text-slate-300 font-medium leading-relaxed italic blur-md select-none pointer-events-none">
                        {review.content}
                      </p>
                      <button
                        onClick={() => toggleSpoiler(review.id)}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="bg-red-500/90 text-white font-bold px-4 py-2 rounded-xl text-sm backdrop-blur-sm">
                          ⚠ Spoiler anzeigen
                        </span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-300 font-medium leading-relaxed italic">
                      &ldquo;{review.content}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 opacity-40 italic font-medium text-slate-500">
            Noch keine Reviews vorhanden. Sei der Erste!
          </div>
        )}
      </div>
    </section>
  );
}
