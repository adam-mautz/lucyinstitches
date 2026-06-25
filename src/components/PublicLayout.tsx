import { Outlet } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';

// Layout wrapper for all customer-facing pages.
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-cream-dark/60 py-6 text-center font-sans text-xs text-charcoal-light">
        Handmade with care · Lucy in Stitches
      </footer>
    </div>
  );
}
