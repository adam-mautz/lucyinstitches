import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { BarChart } from '@/components/BarChart';
import { useOrders } from '@/features/orders/use-orders';
import { useCapacity } from '@/features/capacity/use-capacity';
import {
  formatCurrency,
  formatDuration,
  formatMonth,
  formatDate,
  currentMonthIso,
} from '@/lib/utils';
import { PRODUCT_BY_TYPE } from '@/lib/products';
import { PRODUCT_TYPE_LABELS } from '@/types';

export function AdminDashboardPage() {
  const { data: orders } = useOrders();
  const { data: capacity } = useCapacity();

  const month = currentMonthIso();
  const stats = useMemo(() => {
    const all = orders ?? [];
    const thisMonth = all.filter((o) => o.month === month);
    const revenue = thisMonth.reduce(
      (sum, o) => sum + (o.finalPrice ?? o.quotedPrice ?? 0),
      0
    );
    const minutes = all.reduce((sum, o) => sum + (o.timeSpentMinutes ?? 0), 0);
    return {
      newCount: all.filter((o) => o.status === 'pending').length,
      monthCount: thisMonth.length,
      revenue,
      minutes,
    };
  }, [orders, month]);

  const pending = (orders ?? []).filter((o) => o.status === 'pending');
  const recent = (orders ?? [])
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  // Chart aggregations.
  const charts = useMemo(() => {
    const all = orders ?? [];

    // Orders + revenue grouped by month (last 6 months present in the data).
    const byMonth = new Map<string, { count: number; revenue: number }>();
    for (const o of all) {
      const ym = o.createdAt.slice(0, 7); // YYYY-MM
      const entry = byMonth.get(ym) ?? { count: 0, revenue: 0 };
      entry.count += 1;
      entry.revenue += o.finalPrice ?? o.quotedPrice ?? 0;
      byMonth.set(ym, entry);
    }
    const months = [...byMonth.keys()].sort().slice(-6);
    const monthLabel = (ym: string) =>
      new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', {
        month: 'short',
        timeZone: 'UTC',
      });

    // Time logged per product type.
    const byProduct = new Map<string, number>();
    for (const o of all) {
      if (o.timeSpentMinutes) {
        byProduct.set(
          o.productType,
          (byProduct.get(o.productType) ?? 0) + o.timeSpentMinutes
        );
      }
    }

    return {
      ordersByMonth: months.map((m) => ({
        label: monthLabel(m),
        value: byMonth.get(m)!.count,
      })),
      revenueByMonth: months.map((m) => ({
        label: monthLabel(m),
        value: byMonth.get(m)!.revenue,
      })),
      timeByProduct: [...byProduct.entries()].map(([type, minutes]) => ({
        label: PRODUCT_BY_TYPE[type as keyof typeof PRODUCT_BY_TYPE].label,
        value: minutes,
      })),
    };
  }, [orders]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="font-body text-charcoal-light">
          {formatMonth(month)}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="New Orders" value={String(stats.newCount)} hint="awaiting review" />
        <Kpi
          label="Orders This Month"
          value={String(stats.monthCount)}
          hint="all products"
        />
        <Kpi
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          hint="quoted + final, this month"
        />
        <Kpi
          label="Time Tracked"
          value={formatDuration(stats.minutes)}
          hint="logged across orders"
        />
      </div>

      {/* New order alert */}
      {pending.length > 0 && (
        <Card className="border border-mauve/40 bg-mauve/10">
          <div className="flex items-center justify-between">
            <p className="font-sans text-sm font-medium text-charcoal">
              {pending.length} new order{pending.length > 1 ? 's' : ''} need
              {pending.length === 1 ? 's' : ''} your review
            </p>
            <Link
              to="/admin/orders"
              className="font-sans text-sm font-medium text-slate-blue hover:text-slate-blue-dark"
            >
              Review →
            </Link>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="font-sans text-xs text-slate-blue hover:text-slate-blue-dark"
            >
              View all
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-cream-dark">
            {recent.map((o) => (
              <Link
                key={o.id}
                to={`/admin/orders/${o.id}`}
                className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
              >
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-charcoal">
                    {o.orderNumber} · {o.customerName}
                  </p>
                  <p className="truncate font-body text-xs text-charcoal-light">
                    {PRODUCT_TYPE_LABELS[o.productType]} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </Link>
            ))}
          </div>
        </Card>

        {/* Capacity snapshot */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Capacity</h2>
            <Link
              to="/admin/capacity"
              className="font-sans text-xs text-slate-blue hover:text-slate-blue-dark"
            >
              Manage
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {(capacity ?? []).map((c) => {
              const remaining = Math.max(c.totalSlots - c.usedSlots, 0);
              return (
                <div key={c.id}>
                  <div className="flex justify-between font-sans text-xs">
                    <span className="text-charcoal">
                      {PRODUCT_BY_TYPE[c.productType].label}
                    </span>
                    <span className="text-charcoal-light">
                      {c.usedSlots}/{c.totalSlots}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cream-dark">
                    <div
                      className={
                        remaining > 0 ? 'h-full bg-slate-blue' : 'h-full bg-mauve'
                      }
                      style={{
                        width: `${
                          c.totalSlots === 0
                            ? 0
                            : Math.min((c.usedSlots / c.totalSlots) * 100, 100)
                        }%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="mb-4 font-display text-xl">Orders by Month</h2>
          <BarChart data={charts.ordersByMonth} />
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-xl">Revenue by Month</h2>
          <BarChart
            data={charts.revenueByMonth}
            format={(v) => formatCurrency(v)}
            barClassName="bg-sage-dark"
          />
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-xl">Time by Product</h2>
          <BarChart
            data={charts.timeByProduct}
            format={(v) => formatDuration(v)}
            barClassName="bg-mauve"
            emptyMessage="No time logged yet."
          />
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <p className="font-sans text-xs uppercase tracking-wide text-charcoal-light">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-slate-blue-dark">{value}</p>
      <p className="mt-1 font-sans text-xs text-charcoal-light">{hint}</p>
    </Card>
  );
}
