'use client';

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { MessageSquare, Star, Send, Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function ReviewSection({ animeId }: { animeId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchReviews();
  }, [animeId]);

  async function fetchReviews() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(username, avatar_url)')
      .eq('media_id', animeId)
      .order('created_at', { ascending: false });
    
    if (!error && data) setReviews(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newReview.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      media_id: animeId,
      rating: rating,
      content: newReview
    });

    if (!error) {
      setNewReview("");
      fetchReviews();
    } else {
      console.error("Error submitting review:", error);
    }
    setSubmitting(false);
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="bg-accent-pink border-4 border-white p-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rotate-2">
          <MessageSquare className="text-white" size={32} />
        </div>
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white">COMMUNITY FEEDBACK</h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="bento-box bg-slate-900 p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <span className="font-black uppercase italic tracking-tighter text-white">DEINE BEWERTUNG:</span>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className={`w-10 h-10 border-2 border-black font-black flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 ${
                    rating >= num ? 'bg-accent-yellow text-black' : 'bg-white text-black hover:bg-slate-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="WAS DENKST DU ÜBER DIESEN ANIME? SCHREIB ES HIER REIN..."
            className="w-full bg-white border-4 border-black p-4 font-black uppercase italic tracking-tight text-black focus:outline-none focus:bg-accent-yellow transition-colors h-40 resize-none placeholder:text-slate-500 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
          />
          <div className="flex justify-end">
            <button
              disabled={submitting}
              className="btn-brutalist btn-blue text-xl flex items-center gap-2"
            >
              {submitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
              FEEDBACK ABSCHICKEN
            </button>
          </div>
        </form>
      ) : (
        <div className="bento-box bg-accent-blue p-8 text-center">
          <p className="font-black uppercase italic tracking-tighter text-white text-xl">Logge dich ein, um deine Meinung zu teilen!</p>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent-blue" size={48} /></div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bento-box p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border-4 border-black bg-accent-pink flex items-center justify-center font-black text-white text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {review.profiles?.username?.[0] || "U"}
                  </div>
                  <div>
                    <h4 className="font-black text-white uppercase italic tracking-tighter text-lg leading-none">{review.profiles?.username || "ANONYMER USER"}</h4>
                    <p className="text-[10px] font-black uppercase opacity-60 mt-1">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="bg-accent-yellow border-2 border-black px-3 py-1 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                  <Star size={16} fill="currentColor" />
                  {review.rating}/10
                </div>
              </div>
              <p className="text-white font-bold uppercase italic leading-relaxed text-sm">{review.content}</p>
            </div>
          ))
        ) : (
          <div className="bento-box p-12 text-center opacity-50 italic font-black uppercase">Keine Reviews vorhanden. Sei der Erste!</div>
        )}
      </div>
    </section>
  );
}