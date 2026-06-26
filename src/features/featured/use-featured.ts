import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface FeaturedWork {
  id: string;
  title: string;
  description?: string;
  imagePath: string;
  imageUrl: string; // resolved public URL
  createdAt: string;
}

// 'featured' is a public bucket, so images resolve to plain public URLs.
function publicUrl(path: string): string {
  return supabase.storage.from('featured').getPublicUrl(path).data.publicUrl;
}

// Public read — the curated "Inspiration & Recent Creations" feed.
export function useFeaturedWorks() {
  return useQuery<FeaturedWork[]>({
    queryKey: ['featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_works')
        .select('id, title, description, image_path, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description ?? undefined,
        imagePath: r.image_path,
        imageUrl: publicUrl(r.image_path),
        createdAt: r.created_at,
      }));
    },
  });
}

// Admin: upload an image to the public bucket, then create the row.
export function useAddFeaturedWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
    }: {
      file: File;
      title: string;
      description: string;
    }) => {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('featured')
        .upload(path, file);
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from('featured_works').insert({
        title: title.trim(),
        description: description.trim() || null,
        image_path: path,
      });
      if (insErr) throw insErr;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['featured'] }),
  });
}

// Admin: delete the row, then best-effort remove the image from storage.
export function useDeleteFeaturedWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, imagePath }: { id: string; imagePath: string }) => {
      const { error } = await supabase
        .from('featured_works')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await supabase.storage.from('featured').remove([imagePath]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['featured'] }),
  });
}
