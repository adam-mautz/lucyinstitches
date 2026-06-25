import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: 'bg-slate-blue text-cream hover:bg-slate-blue-dark',
  secondary: 'bg-mauve text-cream hover:bg-mauve-dark',
  ghost: 'bg-transparent text-charcoal hover:bg-cream-dark',
};

// Placeholder shared button — styling refined during Phase 1 UI work.
export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-xl px-5 py-2.5 font-sans text-sm font-medium shadow-warm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
