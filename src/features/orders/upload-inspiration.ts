import { supabase } from '@/lib/supabase';

// Upload an inspiration image to the private bucket; returns its storage path.
export async function uploadInspiration(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('inspiration')
    .upload(path, file);
  if (error) throw error;
  return path;
}
