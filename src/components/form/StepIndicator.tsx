import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  steps: string[];
  current: number; // 0-based
}

// Horizontal progress indicator for the multi-step order form.
export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full font-sans text-xs font-medium transition',
                  active && 'bg-slate-blue text-cream',
                  done && 'bg-sage text-charcoal',
                  !active && !done && 'bg-cream-dark text-charcoal-light'
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={cn(
                  'hidden font-sans text-xs sm:inline',
                  active ? 'font-medium text-charcoal' : 'text-charcoal-light'
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className="h-px w-4 bg-cream-dark sm:w-8" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
