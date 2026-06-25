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
            {PRODUCT_TYPE_LABELS[order.productType]} · placed{' '}
            {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-xl">Your Request</h2>
          <p className="font-body text-charcoal">{order.embroideryRequest}</p>
          {order.notes && (
            <p className="mt-3 font-body text-sm text-charcoal-light">
              {order.notes}
            </p>
          )}

          {order.items.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 font-sans text-xs uppercase tracking-wide text-charcoal-light">
                Items
              </h3>
              <ul className="flex flex-col gap-1.5">
                {order.items.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-center gap-2 font-body text-sm"
                  >
                    <span
                      className={
                        it.isComplete
                          ? 'text-sage-dark'
                          : 'text-charcoal-light'
                      }
                    >
                      {it.isComplete ? '✓' : '○'}
                    </span>
                    <span className="font-medium">{it.label}</span>
                    {it.description && (
                      <span className="text-charcoal-light">
                        — {it.description}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
