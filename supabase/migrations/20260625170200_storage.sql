-- Lucy in Stitches — Phase 2 storage
-- Private bucket for customer inspiration images. Customers may upload;
-- only the authenticated owner can read (admin views via signed URLs).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inspiration',
  'inspiration',
  false,                                   -- private
  5242880,                                 -- 5 MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update
  set file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types,
      public            = excluded.public;

-- Anyone may upload an inspiration image (size/type enforced by the bucket
-- and the client). They cannot list or read the bucket.
create policy "inspiration: public upload"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'inspiration');

-- Only the owner can read inspiration images (served via signed URLs).
create policy "inspiration: admin read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'inspiration');
