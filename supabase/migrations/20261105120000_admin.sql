-- Content management: atomic article saves, the reserved slug, and cover image storage.

-- GET /articles/slugs would shadow an article with this slug.
alter table public.articles
  add constraint articles_slug_not_reserved check (slug <> 'slugs');

-- Saves an article and its tags in one transaction, so a failure can't leave them out of step.
--
-- Runs as the caller, so RLS still applies. Status is not set here: publishing is a separate,
-- deliberate action. p_expected_updated_at stops a stale tab overwriting a newer save.
create function public.save_article(
  p_id uuid,
  p_expected_updated_at timestamptz,
  p_slug text,
  p_title text,
  p_description text,
  p_content text,
  p_cover_image_url text,
  p_category_id uuid,
  p_reading_time_minutes integer,
  p_difficulty public.difficulty_level,
  p_seo_title text,
  p_seo_description text,
  p_is_featured boolean,
  p_tag_ids uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can save articles' using errcode = '42501';
  end if;

  if p_id is null then
    insert into public.articles (
      slug, title, description, content, cover_image_url, category_id, author_id,
      reading_time_minutes, difficulty, seo_title, seo_description, is_featured
    )
    values (
      p_slug, p_title, p_description, p_content, p_cover_image_url, p_category_id, auth.uid(),
      p_reading_time_minutes, p_difficulty, p_seo_title, p_seo_description, p_is_featured
    )
    returning id into v_id;
  else
    update public.articles
    set slug = p_slug,
        title = p_title,
        description = p_description,
        content = p_content,
        cover_image_url = p_cover_image_url,
        category_id = p_category_id,
        reading_time_minutes = p_reading_time_minutes,
        difficulty = p_difficulty,
        seo_title = p_seo_title,
        seo_description = p_seo_description,
        is_featured = p_is_featured
    where id = p_id and updated_at = p_expected_updated_at
    returning id into v_id;

    if v_id is null then
      if exists (select 1 from public.articles where id = p_id) then
        raise exception 'The article changed since it was opened' using errcode = 'BM409';
      end if;
      raise exception 'Article not found' using errcode = 'BM404';
    end if;
  end if;

  delete from public.article_tags where article_id = v_id and tag_id <> all (p_tag_ids);
  insert into public.article_tags (article_id, tag_id)
  select v_id, unnest(p_tag_ids)
  on conflict do nothing;

  return v_id;
end;
$$;

revoke all on function public.save_article(
  uuid, timestamptz, text, text, text, text, text, uuid, integer,
  public.difficulty_level, text, text, boolean, uuid[]
) from public, anon;
grant execute on function public.save_article(
  uuid, timestamptz, text, text, text, text, text, uuid, integer,
  public.difficulty_level, text, text, boolean, uuid[]
) to authenticated;

-- Article images. Public to read. SVG is excluded because it can carry scripts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('article-covers', 'article-covers', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp']);

create policy article_covers_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'article-covers' and (select public.is_admin()));
create policy article_covers_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'article-covers' and (select public.is_admin()));
create policy article_covers_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'article-covers' and (select public.is_admin()))
  with check (bucket_id = 'article-covers' and (select public.is_admin()));
create policy article_covers_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'article-covers' and (select public.is_admin()));
