import { ORDER_STATUS_LABELS, type StatusEvent } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Vertical status history timeline, shared by the public status page and
// the admin order detail view.
export function OrderTimeline({ events }: { events: StatusEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="font-body text-sm text-charcoal-light">
        No status updates yet.
      </p>
    );
  }

  return (
    <ol className="relative ml-2 border-l border-cream-dark">
      {events.map((evt, i) => {
        const latest = i === events.length - 1;
        return (
          <li key={evt.id} className="mb-5 ml-5 last:mb-0">
            <span
              className={cn(
                'absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full ring-4 ring-cream',
                latest ? 'bg-slate-blue' : 'bg-sage'
              )}
            />
            <p
              className={cn(
                'font-sans text-sm',
                latest ? 'font-medium text-charcoal' : 'text-charcoal'
              )}
            >
              {ORDER_STATUS_LABELS[evt.status]}
            </p>
            <p className="font-sans text-xs text-charcoal-light">
              {formatDateTime(evt.createdAt)}
            </p>
            {evt.note && (
              <p className="mt-1 font-body text-sm text-charcoal-light">
                {evt.note}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
