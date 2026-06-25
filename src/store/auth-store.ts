import { create } from 'zustand';

// Admin session state. Wired to Supabase Auth in Phase 3 — for now
// this just holds session shape so guarded routes can compile.
interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  setSession: (email: string | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  email: null,
  setSession: (email) => set({ isAuthenticated: !!email, email }),
  signOut: () => set({ isAuthenticated: false, email: null }),
}));
