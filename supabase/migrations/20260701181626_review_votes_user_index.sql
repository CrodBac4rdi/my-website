-- Advisor-Hinweis: FK review_votes.user_id war ohne Index (relevant für die
-- "meine Votes"-Abfrage: .eq('user_id', ...).in('review_id', ...)).
create index if not exists review_votes_user_idx on public.review_votes(user_id);
