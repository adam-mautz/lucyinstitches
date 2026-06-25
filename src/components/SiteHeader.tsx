import { Link } from 'react-router-dom';

// Public site header — boutique feel, refined in Phase 1.
export function SiteHeader() {
  return (
    <header className="border-b border-cream-dark/60 bg-cream/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="font-display text-2xl italic text-slate-blue-dark"
        >
          Lucy in Stitches
        </Link>
        <nav className="flex items-center gap-6 font-sans text-sm">
          <Link to="/order" className="text-charcoal hover:text-slate-blue">
            Place an Order
          </Link>
          <Link to="/lookup" className="text-charcoal hover:text-slate-blue">
            Track Order
          </Link>
        </nav>
      </div>
    </header>
  );
}
