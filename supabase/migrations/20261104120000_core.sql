-- Extensions, shared types, helpers, and profiles.

create extension if not exists pg_trgm with schema extensions;

create type public.user_role as enum ('reader', 'admin');
create type public.content_status as enum ('draft', 'published');
create type public.difficulty_level as enum ('easy', 'medium', 'hard');

-- Keeps updated_at current on every table that has one.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Stamps published_at the first time content is published without an explicit date.
create function public.set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Anonymous' check (char_length(display_name) between 1 and 100),
  avatar_url text,
  -- Changed only by SQL with elevated rights. See the column grants in the RLS migration.
  role public.user_role not null default 'reader',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Creates a profile for each new auth user. The role is never read from user-supplied metadata.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 100), ''), 'Anonymous')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Used by RLS policies. SECURITY DEFINER because callers can't read the role column themselves.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
