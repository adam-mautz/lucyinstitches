import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { OrderTimeline } from './OrderTimeline';
import { useOrderByToken } from './use-orders';
import { formatDate } from '@/lib/utils';
import { PRODUCT_TYPE_LABELS } from '@/types';

// Public order status via unique tracking token — current status,
// timeline, and item checklist.
export function OrderStatusPage() {
  const { token } = useParams<{ token: string }>();
  const { data: order, isLoading } = useOrderByToken(token);

  if (isLoading) {
    return (
      <PageContainer className="max-w-2xl">
        <Card className="h-64 animate-pulse bg-white/40" />
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer className="max-w-2xl">
        <Card className="text-center">
          <h1 className="font-display text-2xl">Order not found</h1>
          <p className="mt-2 font-body text-charcoal-light">
            This tracking link doesn’t match an order. Try looking it up
            instead.
          </p>
          <Link to="/lookup" className="mt-4 inline-block">
            <Button>Look Up Order</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-slate-blue-dark">
            {order.orderNumber}
          </h1>
          <p className="font-body text-charcoal-light">
            {order.items.length} item{order.items.length === 1 ? '' : 's'} ·
            placed {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-xl">
            Your {order.items.length === 1 ? 'Item' : 'Items'}
          </h2>
          <ul className="flex flex-col gap-3">
            {order.items.map((it) => (
              <li
                key={it.id}
                className="rounded-lg border border-cream-dark bg-white/60 p-3"
              >
                <span className="font-display text-base">
                  {PRODUCT_TYPE_LABELS[it.productType]}
                </span>
                <p className="mt-1 font-body text-sm text-charcoal">
                  {it.embroideryRequest}
                </p>
                {it.notes && (
                  <p className="mt-1 font-body text-xs text-charcoal-light">
                    {it.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-xl">Progress</h2>
          <OrderTimeline events={order.statusHistory} />
        </Card>
      </div>

      <p className="mt-6 text-center font-body text-sm text-charcoal-light">
        Questions about your order? Just reply to your confirmation email.
      </p>
    </PageContainer>
  );
}
