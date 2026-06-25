import { useParams } from 'react-router-dom';
import { Card } from '@/components/Card';

// Full order management — status, pricing, time logging, item tags,
// internal notes. Placeholder only.
export function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Order Detail</h1>
      <Card>
        <p className="font-sans text-sm text-charcoal-light">
          Order detail placeholder — order id:{' '}
          <code className="text-charcoal">{orderId ?? '—'}</code>
        </p>
      </Card>
    </div>
  );
}
