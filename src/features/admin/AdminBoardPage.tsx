import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/Card';
import { Select } from '@/components/form/Select';
import { useProductionItems, type ProductionItem } from './use-production-items';
import { useUpdateItem } from '@/features/orders/use-order-mutations';
import { useToastStore } from '@/store/toast-store';
import {
  PRODUCTION_STATES,
  productionStateLabel,
} from '@/lib/production-states';
import { PRODUCT_TYPE_LABELS } from '@/types';

export function AdminBoardPage() {
  const { data: items, isLoading } = useProductionItems();

  const byState = useMemo(() => {
    const map: Record<string, ProductionItem[]> = {};
    PRODUCTION_STATES.forEach((s) => (map[s] = []));
    (items ?? []).forEach((it) => {
      (map[it.productionState] ??= []).push(it);
    });
    return map;
  }, [items]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl">Production Board</h1>
        <p className="font-body text-charcoal-light">
          Every item across active orders, by state.
        </p>
      </div>

      {isLoading ? (
        <Card className="h-64 animate-pulse bg-white/40" />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PRODUCTION_STATES.map((state) => (
            <div key={state} className="w-72 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg">
                  {productionStateLabel(state)}
                </h2>
                <span className="rounded-full bg-cream-dark px-2 py-0.5 font-sans text-xs text-charcoal-light">
                  {byState[state].length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {byState[state].map((item) => (
                  <BoardCard key={item.id} item={item} />
                ))}
                {byState[state].length === 0 && (
                  <p className="rounded-xl border border-dashed border-cream-dark px-3 py-6 text-center font-body text-xs text-charcoal-light">
                    Nothing here
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BoardCard({ item }: { item: ProductionItem }) {
  const updateItem = useUpdateItem();
  const push = useToastStore((s) => s.push);

  const move = (production_state: string) =>
    updateItem.mutate(
      { id: item.id, orderId: item.orderId, patch: { production_state } },
      {
        onError: (err) =>
          push(err instanceof Error ? err.message : 'Update failed', 'error'),
      }
    );

  return (
    <div className="rounded-xl bg-white/80 p-3 shadow-warm">
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/admin/orders/${item.orderId}`}
          className="font-sans text-sm font-medium text-slate-blue hover:underline"
        >
          {item.orderNumber}
        </Link>
        <span className="font-body text-xs text-charcoal-light">
          {PRODUCT_TYPE_LABELS[item.productType]}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 font-body text-sm text-charcoal">
        {item.embroideryRequest}
      </p>
      <p className="mt-1 font-body text-xs text-charcoal-light">
        {item.customerName}
      </p>
      <Select
        value={item.productionState}
        onChange={(e) => move(e.target.value)}
        className="mt-3 py-1.5 text-xs"
      >
        {PRODUCTION_STATES.map((s) => (
          <option key={s} value={s}>
            {productionStateLabel(s)}
          </option>
        ))}
      </Select>
    </div>
  );
}
