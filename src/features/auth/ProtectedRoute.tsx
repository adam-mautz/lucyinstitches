import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

// Guards admin routes. Waits for the session to initialize, then
// redirects to login if the owner isn't signed in.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const initializing = useAuthStore((s) => s.initializing);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-body text-charcoal-light">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
