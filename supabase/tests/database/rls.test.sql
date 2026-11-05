-- Proves the access rules from docs/ARCHITECTURE.md §4. Run with: npm run db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(46);

-- Fixtures, created as the privileged test role.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@test.local', '{"display_name":"Ada"}'),
  ('00000000-0000-0000-0000-00000000000b', 'reader@test.local', '{"display_name":"Reed","role":"admin"}'),
  ('00000000-0000-0000-0000-00000000000c', 'other@test.local', '{}');

update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-00000000000a';

insert into public.tags (id, slug, name) values
  ('00000000-0000-0000-0000-0000000000d1', 'test-tag', 'Test Tag');

insert into public.articles (id, slug, title, category_id, status, published_at) values
  ('00000000-0000-0000-0000-000000000001', 'test-published', 'Published',
    (select id from public.categories where slug = 'dsa'), 'published', now() - interval '1 hour'),
  ('00000000-0000-0000-0000-000000000002', 'test-draft', 'Draft',
    (select id from public.categories where slug = 'dsa'), 'draft', null),
  ('00000000-0000-0000-0000-000000000003', 'test-scheduled', 'Scheduled',
    (select id from public.categories where slug = 'dsa'), 'published', now() + interval '1 day');

insert into public.article_tags (article_id, tag_id) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000d1'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000d1');

insert into public.dsa_problems (slug, title, category_id, topic, difficulty, problem_statement, status) values
  ('test-dsa-draft', 'Draft problem', (select id from public.categories where slug = 'dsa'), 'Arrays', 'easy', 'x', 'draft');

insert into public.interview_questions (slug, title, category_id, technology, topic, difficulty, short_answer, status) values
  ('test-q-draft', 'Draft question', (select id from public.categories where slug = 'dsa'), 'Java', 'JVM', 'easy', 'x', 'draft');

insert into public.article_views (article_id) values ('00000000-0000-0000-0000-000000000001');

insert into public.bookmarks (user_id, article_id) values
  ('00000000-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-000000000001');

-- Structure
select is_empty(
  $$ select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity $$,
  'every public table has RLS enabled'
);
select is(
  (select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000b'),
  'Reed', 'a new auth user gets a profile'
);
select is(
  (select role::text from public.profiles where id = '00000000-0000-0000-0000-00000000000b'),
  'reader', 'a role in sign-up metadata is ignored'
);
select is(
  (select count(*)::int from public.categories where slug in
    ('dsa','lld','hld','system-design','aws','observability','backend-engineering','interview-questions')),
  8, 'all eight categories exist'
);

-- Data rules
select throws_ok(
  $$ insert into public.articles (slug, title, category_id)
     values ('Bad Slug!', 'x', (select id from public.categories where slug = 'dsa')) $$,
  '23514', null, 'an invalid slug is rejected'
);
select throws_ok(
  $$ insert into public.articles (slug, title, category_id)
     values ('test-published', 'x', (select id from public.categories where slug = 'dsa')) $$,
  '23505', null, 'a duplicate slug is rejected'
);
insert into public.articles (id, slug, title, category_id, status) values
  ('00000000-0000-0000-0000-000000000004', 'test-auto-date', 'Auto', (select id from public.categories where slug = 'dsa'), 'published');
select isnt(
  (select published_at from public.articles where id = '00000000-0000-0000-0000-000000000004'),
  null, 'publishing without a date stamps published_at'
);
delete from public.articles where id = '00000000-0000-0000-0000-000000000004';

-- Anonymous visitor
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

select results_eq(
  $$ select slug from public.articles where slug like 'test-%' $$,
  $$ values ('test-published'::text) $$,
  'anon sees published articles, not drafts or scheduled ones'
);
select is_empty($$ select 1 from public.dsa_problems where status = 'draft' $$, 'anon sees no draft DSA problems');
select is_empty($$ select 1 from public.interview_questions where status = 'draft' $$, 'anon sees no draft questions');
select is(
  (select count(*)::int from public.article_tags where tag_id = '00000000-0000-0000-0000-0000000000d1'),
  1, 'anon sees tag links for published articles only'
);
select throws_ok(
  $$ insert into public.articles (slug, title, category_id)
     values ('anon-write', 'x', (select id from public.categories where slug = 'dsa')) $$,
  '42501', null, 'anon cannot insert articles'
);
select throws_ok($$ update public.articles set title = 'x' $$, '42501', null, 'anon cannot update articles');
select throws_ok($$ delete from public.articles $$, '42501', null, 'anon cannot delete articles');
select throws_ok($$ update public.categories set name = 'x' $$, '42501', null, 'anon cannot update categories');
select throws_ok($$ delete from public.tags $$, '42501', null, 'anon cannot delete tags');
select throws_ok($$ select role from public.profiles $$, '42501', null, 'anon cannot read roles');
select throws_ok($$ select * from public.article_views $$, '42501', null, 'anon cannot read views');
select throws_ok($$ select * from public.bookmarks $$, '42501', null, 'anon cannot read bookmarks');
select is(public.is_admin(), false, 'anon is not an admin');

reset role;

-- Signed-in reader
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select is_empty($$ select 1 from public.articles where slug = 'test-draft' $$, 'a reader cannot see drafts');
select throws_ok(
  $$ insert into public.articles (slug, title, category_id)
     values ('reader-write', 'x', (select id from public.categories where slug = 'dsa')) $$,
  '42501', null, 'a reader cannot insert articles'
);
select is_empty(
  $$ update public.articles set title = 'hacked' where slug = 'test-published' returning id $$,
  'a reader cannot update articles'
);
select is_empty(
  $$ delete from public.articles where slug = 'test-published' returning id $$,
  'a reader cannot delete articles'
);
select throws_ok(
  $$ update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-00000000000b' $$,
  '42501', null, 'a reader cannot make themselves an admin'
);
select lives_ok(
  $$ update public.profiles set display_name = 'Reed 2' where id = '00000000-0000-0000-0000-00000000000b' $$,
  'a reader can edit their own display name'
);
select is_empty(
  $$ update public.profiles set display_name = 'x' where id = '00000000-0000-0000-0000-00000000000c' returning id $$,
  'a reader cannot edit another profile'
);
select is_empty($$ select 1 from public.bookmarks $$, 'a reader cannot see another reader''s bookmarks');
select throws_ok(
  $$ insert into public.bookmarks (user_id, article_id)
     values ('00000000-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-000000000001') $$,
  '42501', null, 'a reader cannot bookmark for someone else'
);
select throws_ok(
  $$ insert into public.bookmarks (user_id, article_id)
     values ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-000000000002') $$,
  '42501', null, 'a reader cannot bookmark a draft they cannot see'
);
select is_empty($$ select 1 from public.article_views $$, 'a reader cannot read view records');

reset role;

-- Admin
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select is(public.is_admin(), true, 'an admin is recognised');
select is(
  (select count(*)::int from public.articles where slug like 'test-%'),
  3, 'an admin sees drafts and scheduled articles'
);
select results_eq(
  $$ update public.articles set title = 'Edited' where slug = 'test-draft' returning title $$,
  $$ values ('Edited'::text) $$,
  'an admin can update an article'
);
select results_eq(
  $$ delete from public.articles where slug = 'test-draft' returning slug $$,
  $$ values ('test-draft'::text) $$,
  'an admin can delete an article'
);

reset role;

-- Phase 5: saving articles, the reserved slug, and image storage.
reset role;
select set_config('request.jwt.claims', '', true);

select throws_ok(
  $$ insert into public.articles (slug, title, category_id)
     values ('slugs', 'Reserved', (select id from public.categories where slug = 'dsa')) $$,
  '23514', null, 'the reserved slug is refused by the database'
);

select is(
  (select public from storage.buckets where id = 'article-covers'), true,
  'the image bucket is public to read'
);
select ok(
  not (select allowed_mime_types @> array['image/svg+xml'] from storage.buckets where id = 'article-covers'),
  'the image bucket refuses SVG'
);

insert into public.articles (id, slug, title, category_id) values
  ('00000000-0000-0000-0000-00000000000f', 'test-stale', 'Stale',
    (select id from public.categories where slug = 'dsa'));

prepare save_as_caller(uuid, timestamptz, text) as
  select public.save_article(
    $1, $2, $3, 'Saved', '', '', null,
    (select id from public.categories where slug = 'dsa'),
    1, null, null, null, false,
    array['00000000-0000-0000-0000-0000000000d1']::uuid[]
  );

-- Anonymous callers can't call it at all.
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$ execute save_as_caller(null, null, 'anon-save') $$,
  '42501', null, 'anonymous callers cannot save an article'
);

-- A signed-in reader can call it and is refused.
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-0000-0000-00000000000b"}', true);
select throws_ok(
  $$ execute save_as_caller(null, null, 'reader-save') $$,
  '42501', null, 'a reader cannot save an article'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('article-covers', 'reader.png') $$,
  '42501', null, 'a reader cannot add an image'
);

-- An administrator can, with the author taken from their session and tags saved alongside.
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-0000-0000-00000000000a"}', true);
select lives_ok(
  $$ execute save_as_caller(null, null, 'admin-save') $$,
  'an administrator can save a new article'
);
select results_eq(
  $$ select a.author_id::text, a.status::text, count(t.tag_id)::int
     from public.articles a left join public.article_tags t on t.article_id = a.id
     where a.slug = 'admin-save' group by a.id $$,
  $$ values ('00000000-0000-0000-0000-00000000000a', 'draft', 1) $$,
  'a saved article is a draft, by its author, with its tags'
);
select throws_ok(
  $$ execute save_as_caller('00000000-0000-0000-0000-00000000000f', '2000-01-01T00:00:00Z', 'test-stale') $$,
  'BM409', null, 'a stale save is refused'
);
select throws_ok(
  $$ execute save_as_caller('00000000-0000-0000-0000-0000000000ff', now(), 'missing') $$,
  'BM404', null, 'saving a missing article reports it'
);
select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('article-covers', 'admin.png') $$,
  'an administrator can add an image'
);

select * from finish();
rollback;
