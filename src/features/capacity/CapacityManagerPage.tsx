import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/form/Input';
import { useCapacity } from './use-capacity';
import { useToastStore } from '@/store/toast-store';
import { cn, formatMonth } from '@/lib/utils';
import { CURRENT_MONTH, PRODUCT_BY_TYPE } from '@/lib/mock-data';
import type { MonthlyCapacity } from '@/types';

export function CapacityManagerPage() {
  const { data: capacity, isLoading } = useCapacity();
  const push = useToastStore((s) => s.push);
  const [rows, setRows] = useState<MonthlyCapacity[]>([]);

  useEffect(() => {
    if (capacity) setRows(capacity);
  }, [capacity]);

  if (isLoading) {
    return <Card className="h-64 animate-pulse bg-white/40" />;
  }

  const setSlots = (id: string, total: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              totalSlots: Math.max(total, 0),
              isAcceptingOrders: r.usedSlots < Math.max(total, 0),
            }
          : r
      )
    );
  };

  const save = () => push('Capacity saved (preview — not persisted)', 'success');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Capacity</h1>
          <p className="font-body text-charcoal-light">
            Slots for {formatMonth(CURRENT_MONTH)}
          </p>
        </div>
        <Button onClick={save}>Save Changes</Button>
      </div>

      <Card>
        <p className="mb-4 font-body text-sm text-charcoal-light">
          Set how many orders you’ll take per product type this month. Used
          slots come from existing orders — you can’t set total below what’s
          already booked.
        </p>

        <div className="flex flex-col divide-y divide-cream-dark">
          {rows.map((r) => {
            const remaining = Math.max(r.totalSlots - r.usedSlots, 0);
            const full = remaining === 0;
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-4 py-4"
              >
                <div className="w-32">
                  <p className="font-display text-lg">
                    {PRODUCT_BY_TYPE[r.productType].label}
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[11px] font-medium',
                      full
                        ? 'bg-mauve/20 text-mauve-dark'
                        : 'bg-sage/30 text-charcoal'
                    )}
                  >
                    {full ? 'Full' : `${remaining} open`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-sans text-xs text-charcoal-light">
                    Used
                  </span>
                  <span className="font-sans text-sm font-medium text-charcoal">
                    {r.usedSlots}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="font-sans text-xs text-charcoal-light">
                    Total
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={r.usedSlots}
                    value={r.totalSlots}
                    onChange={(e) =>
                      setSlots(r.id, Number(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                </div>

                {/* Bar */}
                <div className="ml-auto hidden min-w-[140px] flex-1 sm:block">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-cream-dark">
                    <div
                      className={full ? 'h-full bg-mauve' : 'h-full bg-slate-blue'}
                      style={{
                        width: `${
                          r.totalSlots === 0
                            ? 0
                            : Math.min((r.usedSlots / r.totalSlots) * 100, 100)
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
