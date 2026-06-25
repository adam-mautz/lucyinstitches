import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const inputClasses =
  'w-full rounded-xl border border-cream-dark bg-white/80 px-4 py-2.5 font-sans text-sm text-charcoal placeholder:text-charcoal-light/60 shadow-sm transition focus:border-slate-blue focus:outline-none focus:ring-2 focus:ring-slate-blue/30';

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input ref={ref} className={cn(inputClasses, className)} {...props} />
  );
});
