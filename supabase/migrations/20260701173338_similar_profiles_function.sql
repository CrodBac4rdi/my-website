-- "Ähnliche Nutzer": Jaccard-Overlap der Watchlist gegen ÖFFENTLICHE Profile.
-- SECURITY DEFINER liest zwar über RLS hinweg (fremde Watchlists), gibt aber
-- ausschließlich aggregierte Overlap-Zahlen zu is_public=true Profilen zurück
-- (nie Rohdaten, nie private Profile) — gleiches Muster wie get_media_stats.
create or replace function public.get_similar_profiles(p_limit int default 10)
returns table(
  profile_id uuid,
  username text,
  avatar_url text,
  bio text,
  shared_count int,
  score numeric
)
language sql
security definer
set search_path = ''
stable
as $$
  with my_watchlist as (
    select media_id from public.user_watchlist where user_id = (select auth.uid())
  ),
  my_count as (
    select count(*)::numeric as c from my_watchlist
  ),
  candidate as (
    select
      p.id as profile_id,
      p.username,
      p.avatar_url,
      p.bio,
      count(*) filter (where uw.media_id in (select media_id from my_watchlist)) as shared_count,
      count(*) as total_count
    from public.profiles p
    join public.user_watchlist uw on uw.user_id = p.id
    where p.is_public = true and p.id <> (select auth.uid())
    group by p.id, p.username, p.avatar_url, p.bio
  )
  select
    c.profile_id, c.username, c.avatar_url, c.bio, c.shared_count,
    case when ((select c from my_count) + c.total_count - c.shared_count) <= 0 then 0
      else c.shared_count::numeric / ((select c from my_count) + c.total_count - c.shared_count)
    end as score
  from candidate c
  where c.shared_count > 0
  order by score desc, shared_count desc
  limit greatest(p_limit, 0)
$$;

revoke execute on function public.get_similar_profiles(int) from anon, public;
grant execute on function public.get_similar_profiles(int) to authenticated;
