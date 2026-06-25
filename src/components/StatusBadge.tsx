import { cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types';

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-cream-dark text-charcoal',
  confirmed: 'bg-slate-blue-light text-cream',
  in_progress: 'bg-mauve-light text-charcoal',
  completed: 'bg-sage text-charcoal',
  shipped: 'bg-slate-blue text-cream',
  cancelled: 'bg-charcoal-light text-cream',
};

// Placeholder status pill for orders.
export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 font-sans text-xs font-medium',
        statusStyles[status]
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
