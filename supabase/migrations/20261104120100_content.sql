-- Content tables.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  content text not null default '',
  cover_image_url text,
  category_id uuid not null references public.categories (id) on delete restrict,
  author_id uuid references public.profiles (id) on delete set null,
  reading_time_minutes integer not null default 1 check (reading_time_minutes > 0),
  difficulty public.difficulty_level,
  seo_title text,
  seo_description text,
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  published_at timestamptz,
  search tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, title), 'A')
    || setweight(to_tsvector('english'::regconfig, description), 'B')
    || setweight(to_tsvector('english'::regconfig, content), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_published_needs_date check (status <> 'published' or published_at is not null)
);

create table public.article_tags (
  article_id uuid not null references public.articles (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id)
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  article_id uuid not null references public.articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, article_id)
);

create table public.article_views (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  -- A salted hash at most. Never store an IP address or user agent here.
  visitor_hash text,
  viewed_at timestamptz not null default now()
);

create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 300),
  category_id uuid not null references public.categories (id) on delete restrict,
  technology text not null,
  topic text not null,
  interview_category text,
  difficulty public.difficulty_level not null,
  short_answer text not null,
  detailed_explanation text not null default '',
  practical_example text not null default '',
  code_example text,
  code_language text,
  related_question_ids uuid[] not null default '{}',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  search tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, title), 'A')
    || setweight(to_tsvector('english'::regconfig, short_answer), 'B')
    || setweight(to_tsvector('english'::regconfig, detailed_explanation), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interview_questions_published_needs_date
    check (status <> 'published' or published_at is not null)
);

create table public.dsa_problems (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 200),
  category_id uuid not null references public.categories (id) on delete restrict,
  topic text not null,
  difficulty public.difficulty_level not null,
  problem_statement text not null,
  examples jsonb not null default '[]' check (jsonb_typeof(examples) = 'array'),
  problem_constraints text[] not null default '{}',
  brute_force_approach text not null default '',
  optimized_approach text not null default '',
  explanation text not null default '',
  time_complexity text not null default '',
  space_complexity text not null default '',
  dry_run text not null default '',
  -- Keyed by language: javascript, typescript, java, go.
  solutions jsonb not null default '{}' check (jsonb_typeof(solutions) = 'object'),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  search tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, title), 'A')
    || setweight(to_tsvector('english'::regconfig, problem_statement), 'B')
    || setweight(to_tsvector('english'::regconfig, explanation), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dsa_problems_published_needs_date
    check (status <> 'published' or published_at is not null)
);

-- Triggers
create trigger categories_set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger tags_set_updated_at before update on public.tags
  for each row execute function public.set_updated_at();
create trigger articles_set_updated_at before update on public.articles
  for each row execute function public.set_updated_at();
create trigger interview_questions_set_updated_at before update on public.interview_questions
  for each row execute function public.set_updated_at();
create trigger dsa_problems_set_updated_at before update on public.dsa_problems
  for each row execute function public.set_updated_at();

create trigger articles_set_published_at before insert or update on public.articles
  for each row execute function public.set_published_at();
create trigger interview_questions_set_published_at before insert or update on public.interview_questions
  for each row execute function public.set_published_at();
create trigger dsa_problems_set_published_at before insert or update on public.dsa_problems
  for each row execute function public.set_published_at();

-- Indexes. Unique slugs and primary keys already have their own.
create index articles_listing_idx on public.articles (published_at desc) where status = 'published';
create index articles_featured_idx on public.articles (published_at desc)
  where status = 'published' and is_featured;
create index articles_category_idx on public.articles (category_id, published_at desc);
create index articles_author_idx on public.articles (author_id);
create index articles_search_idx on public.articles using gin (search);
create index articles_title_trgm_idx on public.articles using gin (title extensions.gin_trgm_ops);
create index article_tags_tag_idx on public.article_tags (tag_id);
create index bookmarks_article_idx on public.bookmarks (article_id);
create index article_views_article_idx on public.article_views (article_id, viewed_at desc);
create index interview_questions_category_idx on public.interview_questions (category_id);
create index interview_questions_filter_idx on public.interview_questions (technology, topic, difficulty)
  where status = 'published';
create index interview_questions_search_idx on public.interview_questions using gin (search);
create index dsa_problems_category_idx on public.dsa_problems (category_id);
create index dsa_problems_filter_idx on public.dsa_problems (topic, difficulty) where status = 'published';
create index dsa_problems_search_idx on public.dsa_problems using gin (search);

-- Published article counts. security_invoker keeps RLS in force for whoever queries it.
create view public.category_summaries
with (security_invoker = true)
as
select
  c.id,
  c.slug,
  c.name,
  c.description,
  c.sort_order,
  count(a.id) filter (where a.status = 'published' and a.published_at <= now())::integer as article_count
from public.categories c
left join public.articles a on a.category_id = c.id
group by c.id;
