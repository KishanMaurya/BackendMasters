-- Global search and title suggestions.
--
-- Both run as the caller, so RLS limits results to published content that is due. The status
-- check is repeated only so Postgres can use the partial indexes.

create function public.search_content(
  p_query text,
  p_category text default null,
  p_tag text default null,
  p_limit integer default 12,
  p_offset integer default 0
)
returns table (
  kind text,
  slug text,
  title text,
  description text,
  category_slug text,
  category_name text,
  difficulty public.difficulty_level,
  rank real,
  total bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with query as (
    select websearch_to_tsquery('english'::regconfig, p_query) as value
  ),
  hits as (
    select 'article' as kind, a.slug, a.title, a.description, c.slug as category_slug,
           c.name as category_name, a.difficulty, ts_rank(a.search, query.value) as rank
    from public.articles a
    join public.categories c on c.id = a.category_id
    cross join query
    where a.status = 'published'
      and a.search @@ query.value
      and (p_category is null or c.slug = p_category)
      and (p_tag is null or exists (
        select 1 from public.article_tags at
        join public.tags t on t.id = at.tag_id
        where at.article_id = a.id and t.slug = p_tag
      ))
    union all
    select 'problem', p.slug, p.title, p.problem_statement, c.slug, c.name, p.difficulty,
           ts_rank(p.search, query.value)
    from public.dsa_problems p
    join public.categories c on c.id = p.category_id
    cross join query
    where p.status = 'published'
      and p.search @@ query.value
      and p_tag is null
      and (p_category is null or c.slug = p_category)
    union all
    select 'question', q.slug, q.title, q.short_answer, c.slug, c.name, q.difficulty,
           ts_rank(q.search, query.value)
    from public.interview_questions q
    join public.categories c on c.id = q.category_id
    cross join query
    where q.status = 'published'
      and q.search @@ query.value
      and p_tag is null
      and (p_category is null or c.slug = p_category)
  )
  select hits.kind, hits.slug, hits.title, hits.description, hits.category_slug,
         hits.category_name, hits.difficulty, hits.rank, count(*) over () as total
  from hits
  order by hits.rank desc, hits.title, hits.slug
  limit least(greatest(p_limit, 1), 50)
  offset greatest(p_offset, 0);
$$;

-- Titles containing what's been typed so far, with those starting with it first.
create function public.search_suggestions(p_query text, p_limit integer default 6)
returns table (kind text, slug text, title text)
language sql
stable
security invoker
set search_path = ''
as $$
  with pattern as (
    select '%' || replace(replace(replace(p_query, '\', '\\'), '%', '\%'), '_', '\_') || '%' as value
  ),
  hits as (
    select 'article' as kind, a.slug, a.title
    from public.articles a, pattern
    where a.status = 'published' and a.title ilike pattern.value
    union all
    select 'problem', p.slug, p.title
    from public.dsa_problems p, pattern
    where p.status = 'published' and p.title ilike pattern.value
    union all
    select 'question', q.slug, q.title
    from public.interview_questions q, pattern
    where q.status = 'published' and q.title ilike pattern.value
  )
  select hits.kind, hits.slug, hits.title
  from hits
  order by (lower(hits.title) like lower(p_query) || '%') desc, length(hits.title), hits.slug
  limit least(greatest(p_limit, 1), 10);
$$;

revoke all on function public.search_content(text, text, text, integer, integer) from public;
revoke all on function public.search_suggestions(text, integer) from public;
grant execute on function public.search_content(text, text, text, integer, integer) to anon, authenticated;
grant execute on function public.search_suggestions(text, integer) to anon, authenticated;
