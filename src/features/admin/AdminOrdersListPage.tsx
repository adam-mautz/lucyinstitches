import { Card } from '@/components/Card';

// Filterable, searchable order table. Placeholder only.
export function AdminOrdersListPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Orders</h1>
      <Card>
        <p className="font-sans text-sm text-charcoal-light">
          Order list placeholder — status filters, search, and a row per order
          linking to the detail view.
        </p>
      </Card>
    </div>
  );
}
