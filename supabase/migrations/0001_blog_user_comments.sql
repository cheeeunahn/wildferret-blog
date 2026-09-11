-- Anonymous comments for wildferret-blog.
--
-- The site is a static Cloudflare worker with no server runtime, so the browser
-- talks to PostgREST directly with the publishable key. That key is public: it
-- ships inlined in the built JS and anyone can POST to the REST endpoint without
-- going through the React form. So every rule that matters is enforced HERE, in
-- Postgres. Nothing in the frontend is a security control.

create table if not exists public.blog_user_comments (
  id            uuid primary key default gen_random_uuid(),
  article_slug  text        not null check (article_slug ~ '^[a-z0-9-]{1,80}$'),
  nickname      text        not null check (char_length(btrim(nickname)) between 1 and 24),
  body          text        not null check (char_length(btrim(body)) between 2 and 2000),
  created_at    timestamptz not null default now(),
  is_hidden     boolean     not null default false,
  -- Unused today. Reserved so that adding Supabase auth later (which would let
  -- rate limiting key on a real visitor identity instead of the article) is a
  -- policy change rather than a migration.
  author_id     uuid
);

-- The only query shape the site issues.
create index if not exists blog_user_comments_slug_created_idx
  on public.blog_user_comments (article_slug, created_at);

-- The blocklist. Editable from the dashboard without a redeploy. It is
-- deliberately NOT readable by anon (see grants below), so the list of banned
-- words never ships to the browser.
create table if not exists public.moderation_terms (
  term text primary key,
  kind text not null default 'profanity'
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.blog_user_comments enable row level security;
-- RLS on with zero policies = no row is ever visible or writable to anon.
alter table public.moderation_terms  enable row level security;

drop policy if exists "read visible comments" on public.blog_user_comments;
create policy "read visible comments" on public.blog_user_comments
  for select to anon using (is_hidden = false);

drop policy if exists "anyone may comment" on public.blog_user_comments;
create policy "anyone may comment" on public.blog_user_comments
  for insert to anon with check (true);

-- No update or delete policy exists, so anon can never edit or remove a comment
-- -- including its own. Deletion is the site owner's, from the dashboard.

-- Column-level grants sit BENEATH RLS. Without them a crafted request could
-- clear is_hidden on a hidden row or backdate created_at, since the insert
-- policy itself says nothing about which columns were supplied.
revoke all on public.blog_user_comments from anon, authenticated;
revoke all on public.moderation_terms  from anon, authenticated;
grant select on public.blog_user_comments to anon;
grant insert (article_slug, nickname, body) on public.blog_user_comments to anon;

-- ---------------------------------------------------------------------------
-- Moderation trigger
-- ---------------------------------------------------------------------------

-- security definer is what lets this read moderation_terms even though the
-- caller cannot. search_path is pinned because a security definer function with
-- a mutable search_path can be hijacked by a caller who shadows an object in an
-- earlier schema -- the classic Postgres privilege-escalation vector.
--
-- Note there is no dynamic SQL here, and there must never be: an EXECUTE built
-- from new.body would run with owner privileges.
--
-- This is NOT an XSS filter. <script> passes straight through and is stored as
-- text, which is correct -- storage was never the vulnerability, rendering is.
-- See the escaping rules in CLAUDE.md before touching the frontend.
create or replace function public.moderate_comment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_body  text;
  v_links int;
begin
  new.nickname := btrim(new.nickname);
  new.body     := btrim(new.body);

  -- Collapse whitespace so "b a d" evasion of the blocklist is a little harder,
  -- and lowercase once for every case-insensitive check below.
  v_body := lower(regexp_replace(new.body, '\s+', ' ', 'g'));

  -- Personal information. Card is checked before phone: a card number can
  -- contain a "016" run that the mobile pattern would otherwise claim, and the
  -- reader deserves the accurate reason.
  if v_body ~ '[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}' then
    raise exception 'comment_rejected' using errcode = 'P0001', hint = 'pii_card';
  end if;

  if v_body ~ '[0-9]{6}[ -][1-4][0-9]{6}' then
    raise exception 'comment_rejected' using errcode = 'P0001', hint = 'pii_rrn';
  end if;

  if v_body ~ '01[016-9][ .-]?[0-9]{3,4}[ .-]?[0-9]{4}' then
    raise exception 'comment_rejected' using errcode = 'P0001', hint = 'pii_phone';
  end if;

  if v_body ~ '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}' then
    raise exception 'comment_rejected' using errcode = 'P0001', hint = 'pii_email';
  end if;

  -- position(), not LIKE: a term containing % or _ would act as a wildcard in a
  -- LIKE pattern and silently start matching every comment.
  if exists (
    select 1 from public.moderation_terms t
    where t.term <> '' and position(t.term in v_body) > 0
  ) then
    raise exception 'comment_rejected' using errcode = 'P0001', hint = 'profanity';
  end if;

  v_links := (length(v_body) - length(replace(v_body, 'http', ''))) / 4;
  if v_links >= 2 then
    raise exception 'comment_rejected' using errcode = 'P0001', hint = 'link_spam';
  end if;

  if exists (
    select 1 from public.blog_user_comments c
    where c.article_slug = new.article_slug and c.body = new.body
  ) then
    raise exception 'comment_rejected' using errcode = 'P0001', hint = 'duplicate';
  end if;

  -- Rate limiting without auth has no per-visitor identity to key on, so the
  -- cooldown is per-ARTICLE. Fine at this traffic; two readers colliding within
  -- 20s is the accepted cost. Real per-person limiting is what author_id is for.
  if exists (
    select 1 from public.blog_user_comments c
    where c.article_slug = new.article_slug
      and c.created_at > now() - interval '20 seconds'
  ) then
    raise exception 'comment_rejected' using errcode = 'P0001', hint = 'too_fast';
  end if;

  -- Table-wide brake. The per-article rule above does nothing against an
  -- attacker rotating slugs; this bounds total insert rate regardless.
  -- It caps how many rows a flood can land -- it is not DoS protection, since
  -- rejected requests still burn quota.
  if (select count(*) from public.blog_user_comments
      where created_at > now() - interval '1 minute') >= 20 then
    raise exception 'comment_rejected' using errcode = 'P0001', hint = 'too_fast';
  end if;

  return new;
end;
$$;

drop trigger if exists moderate_comment on public.blog_user_comments;
create trigger moderate_comment
  before insert on public.blog_user_comments
  for each row execute function public.moderate_comment();

-- ---------------------------------------------------------------------------
-- Hardening
-- ---------------------------------------------------------------------------

-- No single crafted request can pin a connection.
alter role anon set statement_timeout = '3s';

-- Seed. Add to this from the dashboard; no redeploy needed.
insert into public.moderation_terms (term) values
  ('시발'), ('씨발'), ('개새끼'), ('병신'), ('좆'), ('니미'), ('썅'),
  ('fuck'), ('shit'), ('bitch'), ('asshole'), ('cunt')
on conflict (term) do nothing;
