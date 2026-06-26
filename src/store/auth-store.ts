import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

// Admin session state, populated from Supabase Auth (see AuthProvider).
interface AuthState {
  initializing: boolean; // true until the first getSession() resolves
  isAuthenticated: boolean;
  email: string | null;
  setSession: (session: Session | null) => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  initializing: true,
  isAuthenticated: false,
  email: null,
  setSession: (session) =>
    set({
      isAuthenticated: !!session,
      email: session?.user.email ?? null,
    }),
  setInitializing: (value) => set({ initializing: value }),
}));
