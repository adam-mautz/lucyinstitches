-- "Inspiration & Recent Creations" — owner-curated public photo feed.
-- image + title + description. Public read, owner-only write.

create table featured_works (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  image_path  text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index featured_works_created_idx on featured_works (created_at desc);

create trigger featured_works_set_updated_at
  before update on featured_works
  for each row execute function set_updated_at();

-- RLS: anyone can read; only the authenticated owner can write.
alter table featured_works enable row level security;

grant select on featured_works to anon, authenticated;
grant insert, update, delete on featured_works to authenticated;

create policy "featured: public read"
  on featured_works for select
  to anon, authenticated
  using (true);

create policy "featured: admin write"
  on featured_works for all
  to authenticated
  using (true) with check (true);

-- PUBLIC storage bucket — these images are meant to be shown publicly, so
-- they're served via plain public URLs (no signed URLs needed).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'featured', 'featured', true, 5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update
  set public            = excluded.public,
      file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read; owner-only upload/delete.
create policy "featured img: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'featured');

create policy "featured img: admin upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'featured');

create policy "featured img: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'featured');
