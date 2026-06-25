import { Card } from '@/components/Card';

const kpis = [
  { label: 'New Orders', hint: 'awaiting review' },
  { label: 'Orders This Month', hint: 'across all products' },
  { label: 'Revenue', hint: 'final prices, this month' },
  { label: 'Time Tracked', hint: 'logged this month' },
];

// Admin dashboard — KPI cards, new-order alerts, recent orders,
// capacity snapshot. Placeholder only.
export function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="font-sans text-xs uppercase tracking-wide text-charcoal-light">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-3xl text-slate-blue-dark">—</p>
            <p className="mt-1 font-sans text-xs text-charcoal-light">
              {kpi.hint}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
