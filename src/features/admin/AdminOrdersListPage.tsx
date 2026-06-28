import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/form/Input';
import { useOrders } from '@/features/orders/use-orders';
import { useOrderFilterStore } from '@/store/order-filter-store';
import { ordersToCsv, downloadCsv } from '@/lib/csv';
import { cn, currentMonthIso, formatCurrency, formatDate } from '@/lib/utils';
import {
  ORDER_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  type OrderStatus,
} from '@/types';

const STATUS_TABS: Array<OrderStatus | 'all'> = [
  'all',
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'shipped',
  'cancelled',
];

export function AdminOrdersListPage() {
  const { data: orders } = useOrders();
  const { statusFilter, search, setStatusFilter, setSearch } =
    useOrderFilterStore();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (orders ?? [])
      .filter((o) => statusFilter === 'all' || o.status === statusFilter)
      .filter((o) => {
        if (!q) return true;
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, statusFilter, search]);

  const handleExport = () => {
    const csv = ordersToCsv(filtered);
    downloadCsv(`lucy-orders-${currentMonthIso().slice(0, 7)}.csv`, csv);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Orders</h1>
        <Button
          variant="secondary"
          onClick={handleExport}
          disabled={filtered.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={cn(
                'rounded-full px-3 py-1.5 font-sans text-xs font-medium transition',
                statusFilter === tab
                  ? 'bg-slate-blue text-cream'
                  : 'bg-white/70 text-charcoal hover:bg-cream-dark'
              )}
            >
              {tab === 'all' ? 'All' : ORDER_STATUS_LABELS[tab]}
            </button>
          ))}
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, name, or email…"
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-cream-dark bg-white/40 font-sans text-xs uppercase tracking-wide text-charcoal-light">
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Product</Th>
                <Th>Status</Th>
                <Th>Price</Th>
                <Th>Placed</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-cream-dark/60 last:border-0 hover:bg-white/50"
                >
                  <Td>
                    <Link
                      to={`/admin/orders/${o.id}`}
                      className="font-sans text-sm font-medium text-slate-blue hover:text-slate-blue-dark"
                    >
                      {o.orderNumber}
                    </Link>
                  </Td>
                  <Td>
                    <span className="font-sans text-sm text-charcoal">
                      {o.customerName}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-body text-sm text-charcoal-light">
                      {o.items.length === 1
                        ? PRODUCT_TYPE_LABELS[o.items[0].productType]
                        : `${o.items.length} items`}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge status={o.status} />
                  </Td>
                  <Td>
                    <span className="font-sans text-sm text-charcoal">
                      {o.finalPrice != null
                        ? formatCurrency(o.finalPrice)
                        : o.quotedPrice != null
                          ? `${formatCurrency(o.quotedPrice)} (quote)`
                          : '—'}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-body text-sm text-charcoal-light">
                      {formatDate(o.createdAt)}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="p-8 text-center font-body text-charcoal-light">
            No orders match these filters.
          </p>
        )}
      </Card>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}
