import { useMemo, useState } from 'react';
import { Card } from '@/components/Card';
import { Input } from '@/components/form/Input';
import { useProductionItems, type ProductionItem } from './use-production-items';
import { useUpdateItem } from '@/features/orders/use-order-mutations';
import { useToastStore } from '@/store/toast-store';
import { cn } from '@/lib/utils';
import {
  PRODUCTION_STATES,
  PRODUCTION_STATE_STYLES,
  productionStateLabel,
} from '@/lib/production-states';
import { PRODUCT_TYPE_LABELS } from '@/types';

// Mobile-first page for quickly setting an item's state without drilling
// into the order. Defaults to the active queue (everything not yet shipped).
export function AdminQuickUpdatePage() {
  const { data: items, isLoading } = useProductionItems();
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const all = items ?? [];
    if (q) {
      return all.filter(
        (i) =>
          i.orderNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          PRODUCT_TYPE_LABELS[i.productType].toLowerCase().includes(q)
      );
    }
    // Default: the active work queue (not yet shipped).
    return all.filter((i) => i.productionState !== 'shipped');
  }, [items, search]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl">Quick Update</h1>
        <p className="font-body text-charcoal-light">
          Tap an item’s new state. {!search && 'Showing the active queue.'}
        </p>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search order # or name…"
        className="py-3 text-base"
        inputMode="search"
      />

      {isLoading ? (
        <Card className="h-40 animate-pulse bg-white/40" />
      ) : visible.length === 0 ? (
        <Card className="text-center">
          <p className="font-body text-charcoal-light">
            {search ? 'No items match.' : 'Nothing in the queue — all caught up!'}
          </p>
        </Card>
      ) : (
        visible.map((item) => <QuickCard key={item.id} item={item} />)
      )}
    </div>
  );
}

function QuickCard({ item }: { item: ProductionItem }) {
  const updateItem = useUpdateItem();
  const push = useToastStore((s) => s.push);

  const setState = (production_state: string) => {
    if (production_state === item.productionState) return;
    updateItem.mutate(
      { id: item.id, orderId: item.orderId, patch: { production_state } },
      {
        onSuccess: () =>
          push(`${item.orderNumber} → ${productionStateLabel(production_state)}`, 'success'),
        onError: (err) =>
          push(err instanceof Error ? err.message : 'Update failed', 'error'),
      }
    );
  };

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-lg">
          {item.orderNumber} · {PRODUCT_TYPE_LABELS[item.productType]}
        </span>
      </div>
      <p className="mt-0.5 font-body text-sm text-charcoal">
        {item.embroideryRequest}
      </p>
      <p className="font-body text-xs text-charcoal-light">
        {item.customerName}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {PRODUCTION_STATES.map((s) => {
          const active = s === item.productionState;
          return (
            <button
              key={s}
              onClick={() => setState(s)}
              disabled={updateItem.isPending}
              className={cn(
                'rounded-xl px-3 py-3 text-center font-sans text-sm font-medium transition active:scale-[0.98]',
                active
                  ? PRODUCTION_STATE_STYLES[s]
                  : 'bg-white text-charcoal ring-1 ring-cream-dark hover:bg-cream-dark/40'
              )}
            >
              {active ? '✓ ' : ''}
              {productionStateLabel(s)}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
