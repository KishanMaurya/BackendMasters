-- Row Level Security and privileges.
--
-- Supabase grants broad table privileges to anon and authenticated by default, leaving RLS
-- as the only barrier. Here they are revoked and granted back explicitly, so a mistake
-- would have to get past both. New tables must follow the same pattern. A pgTAP test
-- fails if a public table has RLS turned off.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;
alter table public.bookmarks enable row level security;
alter table public.article_views enable row level security;
alter table public.interview_questions enable row level security;
alter table public.dsa_problems enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

-- Policies call this, so both roles need it. It only reveals the caller's own status.
grant execute on function public.is_admin() to anon, authenticated;

-- Profiles: public display fields only. The role column is never directly readable or writable.
grant select (id, display_name, avatar_url) on public.profiles to anon, authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

create policy profiles_public_read on public.profiles
  for select to anon, authenticated using (true);
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Reference data: public read, admin write.
grant select on public.categories, public.tags, public.category_summaries to anon, authenticated;
grant insert, update, delete on public.categories, public.tags to authenticated;

create policy categories_public_read on public.categories
  for select to anon, authenticated using (true);
create policy categories_admin_insert on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy categories_admin_update on public.categories
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy categories_admin_delete on public.categories
  for delete to authenticated using ((select public.is_admin()));

create policy tags_public_read on public.tags
  for select to anon, authenticated using (true);
create policy tags_admin_insert on public.tags
  for insert to authenticated with check ((select public.is_admin()));
create policy tags_admin_update on public.tags
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy tags_admin_delete on public.tags
  for delete to authenticated using ((select public.is_admin()));

-- Publishable content: the public sees only what is published and due. Admins see everything.
grant select on public.articles, public.interview_questions, public.dsa_problems to anon, authenticated;
grant insert, update, delete on public.articles, public.interview_questions, public.dsa_problems to authenticated;

create policy articles_public_read on public.articles
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy articles_admin_read on public.articles
  for select to authenticated using ((select public.is_admin()));
create policy articles_admin_insert on public.articles
  for insert to authenticated with check ((select public.is_admin()));
create policy articles_admin_update on public.articles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy articles_admin_delete on public.articles
  for delete to authenticated using ((select public.is_admin()));

create policy interview_questions_public_read on public.interview_questions
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy interview_questions_admin_read on public.interview_questions
  for select to authenticated using ((select public.is_admin()));
create policy interview_questions_admin_insert on public.interview_questions
  for insert to authenticated with check ((select public.is_admin()));
create policy interview_questions_admin_update on public.interview_questions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy interview_questions_admin_delete on public.interview_questions
  for delete to authenticated using ((select public.is_admin()));

create policy dsa_problems_public_read on public.dsa_problems
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy dsa_problems_admin_read on public.dsa_problems
  for select to authenticated using ((select public.is_admin()));
create policy dsa_problems_admin_insert on public.dsa_problems
  for insert to authenticated with check ((select public.is_admin()));
create policy dsa_problems_admin_update on public.dsa_problems
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy dsa_problems_admin_delete on public.dsa_problems
  for delete to authenticated using ((select public.is_admin()));

-- Article tags follow their article. The subquery runs under the caller's RLS on articles.
grant select on public.article_tags to anon, authenticated;
grant insert, delete on public.article_tags to authenticated;

create policy article_tags_read on public.article_tags
  for select to anon, authenticated
  using (exists (select 1 from public.articles a where a.id = article_id));
create policy article_tags_admin_insert on public.article_tags
  for insert to authenticated with check ((select public.is_admin()));
create policy article_tags_admin_delete on public.article_tags
  for delete to authenticated using ((select public.is_admin()));

-- Bookmarks: private to their owner, and only for articles the owner is able to see.
grant select, insert, delete on public.bookmarks to authenticated;

create policy bookmarks_owner_read on public.bookmarks
  for select to authenticated using (user_id = (select auth.uid()));
create policy bookmarks_owner_insert on public.bookmarks
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.articles a where a.id = article_id)
  );
create policy bookmarks_owner_delete on public.bookmarks
  for delete to authenticated using (user_id = (select auth.uid()));

-- Views: written only by the API's server key, which bypasses RLS. Readable by admins.
grant select on public.article_views to authenticated;

create policy article_views_admin_read on public.article_views
  for select to authenticated using ((select public.is_admin()));
