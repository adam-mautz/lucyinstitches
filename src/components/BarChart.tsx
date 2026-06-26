import { cn } from '@/lib/utils';

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  format?: (value: number) => string;
  barClassName?: string;
  emptyMessage?: string;
}

// Simple horizontal bar chart — no chart library, brand-styled. Bars scale
// to the largest value in the set.
export function BarChart({
  data,
  format = (v) => String(v),
  barClassName = 'bg-slate-blue',
  emptyMessage = 'No data yet.',
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 0);

  if (data.length === 0 || max === 0) {
    return (
      <p className="py-4 font-body text-sm text-charcoal-light">{emptyMessage}</p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate font-sans text-xs text-charcoal-light">
            {d.label}
          </span>
          <div className="flex h-5 flex-1 items-center">
            <div
              className={cn('h-full rounded-r-md transition-all', barClassName)}
              style={{ width: `${Math.max((d.value / max) * 100, 2)}%` }}
            />
            <span className="ml-2 font-sans text-xs font-medium text-charcoal">
              {format(d.value)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
