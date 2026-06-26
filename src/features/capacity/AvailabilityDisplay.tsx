import { Link } from 'react-router-dom';
import { Card } from '@/components/Card';
import { cn } from '@/lib/utils';
import { PRODUCT_BY_TYPE } from '@/lib/mock-data';
import { useCapacity } from './use-capacity';
import type { MonthlyCapacity } from '@/types';

// Availability grid by product type. Reads capacity via React Query
// (mock data in Phase 1).
export function AvailabilityDisplay() {
  const { data: capacity, isLoading, isError } = useCapacity();

  if (isError) {
    return (
      <Card className="text-center">
        <p className="font-body text-charcoal-light">
          We couldn’t load availability right now. Please refresh in a moment.
        </p>
      </Card>
    );
  }

  if (isLoading || !capacity) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-white/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {capacity.map((cap) => (
        <AvailabilityCard key={cap.id} cap={cap} />
      ))}
    </div>
  );
}

function AvailabilityCard({ cap }: { cap: MonthlyCapacity }) {
  const meta = PRODUCT_BY_TYPE[cap.productType];
  const remaining = Math.max(cap.totalSlots - cap.usedSlots, 0);
  const open = cap.isAcceptingOrders;

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-xl">{meta.label}</h3>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[11px] font-medium',
              open ? 'bg-sage text-charcoal' : 'bg-cream-dark text-charcoal-light'
            )}
          >
            {open ? `${remaining} left` : 'Full'}
          </span>
        </div>
        <p className="mt-1 font-body text-sm text-charcoal-light">
          {meta.blurb}
        </p>
      </div>

      <div className="mt-3">
        <CapacityBar used={cap.usedSlots} total={cap.totalSlots} open={open} />
        {open ? (
          <Link
            to={`/order?product=${cap.productType}`}
            className="mt-3 inline-block font-sans text-xs font-medium text-slate-blue hover:text-slate-blue-dark"
          >
            Order this →
          </Link>
        ) : (
          <p className="mt-3 font-sans text-xs italic text-charcoal-light">
            {cap.closedMessage ?? 'Check back next month'}
          </p>
        )}
      </div>
    </Card>
  );
}

function CapacityBar({
  used,
  total,
  open,
}: {
  used: number;
  total: number;
  open: boolean;
}) {
  const pct = total === 0 ? 0 : Math.min((used / total) * 100, 100);
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-cream-dark"
      role="progressbar"
      aria-valuenow={used}
      aria-valuemax={total}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all',
          open ? 'bg-slate-blue' : 'bg-mauve'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
