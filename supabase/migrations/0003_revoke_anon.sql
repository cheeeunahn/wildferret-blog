-- Close the old door: after this, the publishable key alone can neither read
-- nor write comments. Every request has to come through /api/comments.
--
-- Apply only once the Worker from 0002 is deployed and comments are confirmed
-- working on /, /kr and /en — until then the old browser bundle still calls
-- PostgREST as anon. See "Comments > Cutover" in CLAUDE.md.
--
-- Rollback: re-run the "Row level security" grants and policies for anon from
-- 0001 (both `create policy ... to anon` statements and the two `grant`s).

drop policy if exists "read visible comments" on public.blog_user_comments;
drop policy if exists "anyone may comment"    on public.blog_user_comments;

revoke all on public.blog_user_comments from anon, authenticated;
revoke all on public.moderation_terms  from anon, authenticated;

notify pgrst, 'reload schema';
