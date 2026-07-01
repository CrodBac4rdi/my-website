create table if not exists public.review_votes (
  review_id  uuid not null references public.reviews(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);
create index if not exists review_votes_review_idx on public.review_votes(review_id);

alter table public.review_votes enable row level security;

create policy review_votes_select_all on public.review_votes for select using (true);
create policy review_votes_insert_own on public.review_votes for insert with check (user_id = (select auth.uid()));
create policy review_votes_delete_own on public.review_votes for delete using (user_id = (select auth.uid()));

create or replace view public.review_vote_counts
with (security_invoker = true) as
select review_id, count(*) as helpful_count
from public.review_votes
group by review_id;
