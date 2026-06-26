import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/form/Input';
import { useCapacity } from './use-capacity';
import { useUpdateCapacity } from '@/features/orders/use-order-mutations';
import { useToastStore } from '@/store/toast-store';
import { cn, currentMonthIso, formatMonth } from '@/lib/utils';
import { PRODUCT_BY_TYPE } from '@/lib/products';
import type { MonthlyCapacity } from '@/types';

export function CapacityManagerPage() {
  const { data: capacity, isLoading } = useCapacity();
  const updateCapacity = useUpdateCapacity();
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

  const save = async () => {
    try {
      // Persist only rows whose total changed; never below what's booked.
      const changed = rows.filter((r) => {
        const original = capacity?.find((c) => c.id === r.id);
        return original && original.totalSlots !== r.totalSlots;
      });
      await Promise.all(
        changed.map((r) =>
          updateCapacity.mutateAsync({
            id: r.id,
            totalSlots: Math.max(r.totalSlots, r.usedSlots),
          })
        )
      );
      push(
        changed.length ? 'Capacity saved' : 'No changes to save',
        'success'
      );
    } catch (err) {
      push(err instanceof Error ? err.message : 'Could not save', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Capacity</h1>
          <p className="font-body text-charcoal-light">
            Slots for {formatMonth(currentMonthIso())}
          </p>
        </div>
        <Button onClick={save} disabled={updateCapacity.isPending}>
          {updateCapacity.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
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
