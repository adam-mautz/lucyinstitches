import { createClient } from '@supabase/supabase-js';

// Client-safe Supabase instance (anon key only). Subject to Row Level
// Security policies. The service key must NEVER be used here — it lives
// only in server-side Vercel functions under /api.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaced loudly in dev; real values come from .env.local / Vercel env.
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — ' +
      'set them in .env.local. Backend calls will fail until configured.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
