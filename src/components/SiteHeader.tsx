import { Link } from 'react-router-dom';
import { Logo } from './Logo';

// Public site header — boutique feel, refined in Phase 1.
export function SiteHeader() {
  return (
    <header className="border-b border-cream-dark/60 bg-cream/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:gap-0 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size={40} />
          <span className="whitespace-nowrap font-display text-2xl italic text-slate-blue-dark">
            Lucy in Stitches
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-sans text-sm sm:gap-6">
          <Link
            to="/inspiration"
            className="whitespace-nowrap text-charcoal hover:text-slate-blue"
          >
            Inspiration
          </Link>
          <Link
            to="/order"
            className="whitespace-nowrap text-charcoal hover:text-slate-blue"
          >
            Place an Order
          </Link>
          <Link
            to="/lookup"
            className="whitespace-nowrap text-charcoal hover:text-slate-blue"
          >
            Track Order
          </Link>
        </nav>
      </div>
    </header>
  );
}
