-- The role the server (src/server/comments/repository.ts) connects as.
--
-- Before this migration the browser called PostgREST directly as `anon`. Now a
-- Cloudflare Worker sits in between and the browser holds no key at all. The
-- Worker deliberately does NOT use service_role: that would bypass RLS and the
-- column grants, leaving a bug in the Worker as the only thing between a
-- request and a hidden comment. `blog_api` gets exactly what anon had, so the
-- database keeps enforcing its own rules no matter what the Worker sends.
--
-- Apply this BEFORE deploying the Worker, and 0003 only AFTER the deployed
-- site is confirmed working. See "Comments > Cutover" in CLAUDE.md.
--
-- How a request becomes this role: the Worker sends a JWT whose `role` claim
-- is `blog_api` (minted by scripts/mint-api-jwt.mjs). PostgREST connects as
-- `authenticator` and switches to the role named in the claim, which it can
-- only do because of the grant below.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'blog_api') then
    create role blog_api nologin noinherit;
  end if;
end
$$;

grant blog_api to authenticator;
grant usage on schema public to blog_api;

-- Same shape as anon's grants in 0001: read every column (RLS decides which
-- rows), insert only the three user-supplied columns. is_hidden and created_at
-- are not writable, so a crafted request cannot unhide or backdate a row.
revoke all on public.blog_user_comments from blog_api;
revoke all on public.moderation_terms  from blog_api;
grant select on public.blog_user_comments to blog_api;
grant insert (article_slug, nickname, body) on public.blog_user_comments to blog_api;

drop policy if exists "api reads visible comments" on public.blog_user_comments;
create policy "api reads visible comments" on public.blog_user_comments
  for select to blog_api using (is_hidden = false);

drop policy if exists "api may comment" on public.blog_user_comments;
create policy "api may comment" on public.blog_user_comments
  for insert to blog_api with check (true);

-- No update or delete policy: the API can never edit or remove a comment.

-- Carried over from anon: no single request can pin a connection. PostgREST
-- applies an impersonated role's settings per request.
alter role blog_api set statement_timeout = '3s';

notify pgrst, 'reload schema';
