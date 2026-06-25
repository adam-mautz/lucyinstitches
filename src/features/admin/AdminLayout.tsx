import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/orders', label: 'Orders', end: false },
  { to: '/admin/capacity', label: 'Capacity', end: false },
];

// Shell for the admin dashboard — sidebar nav + content outlet.
export function AdminLayout() {
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream md:flex-row">
      <aside className="border-b border-cream-dark/60 bg-slate-blue p-4 md:w-56 md:border-b-0 md:border-r">
        <Link
          to="/admin"
          className="block font-display text-xl italic text-cream"
        >
          Lucy · Admin
        </Link>
        <nav className="mt-6 flex gap-2 md:flex-col">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 font-sans text-sm transition-colors',
                  isActive
                    ? 'bg-cream text-slate-blue-dark'
                    : 'text-cream/90 hover:bg-slate-blue-dark'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleSignOut}
          className="mt-6 font-sans text-xs text-cream/70 hover:text-cream"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
