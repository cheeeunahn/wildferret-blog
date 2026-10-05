-- Make the moderate_comment() limits hold under concurrent inserts.
--
-- The duplicate check, the per-article cooldown and the table-wide brake in
-- 0001 are all "look, then insert": EXISTS / COUNT over committed rows. Two
-- transactions running at once both look before either has committed, both
-- pass, and both insert -- so a burst of parallel requests walks straight
-- through every limit.
--
-- Fix: take one transaction-scoped advisory lock before those checks run. It is
-- held until commit, so the next insert's checks see the previous one's row.
-- One lock for the whole table, not per slug, because the table-wide brake
-- counts across slugs. At this blog's traffic serializing inserts costs nothing.
--
-- The lock lives in its own BEFORE INSERT trigger rather than a re-definition of
-- moderate_comment(), so the moderation rules stay in one place (0001). Postgres
-- fires same-event triggers in name order: "blog_user_comments_serialize" sorts
-- before "moderate_comment", so the lock is taken first. Keep that true if you
-- rename either trigger.
--
-- Rollback: drop trigger blog_user_comments_serialize on public.blog_user_comments;
--           drop function public.lock_comment_inserts();

create or replace function public.lock_comment_inserts()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  perform pg_advisory_xact_lock(hashtext('public.blog_user_comments'));
  return new;
end;
$$;

drop trigger if exists blog_user_comments_serialize on public.blog_user_comments;
create trigger blog_user_comments_serialize
  before insert on public.blog_user_comments
  for each row execute function public.lock_comment_inserts();
