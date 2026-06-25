import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';

// Public order status via unique tracking token — timeline + item list.
// Placeholder only.
export function OrderStatusPage() {
  const { token } = useParams<{ token: string }>();

  return (
    <PageContainer>
      <h1 className="mb-6 text-center font-display text-3xl">Order Status</h1>
      <Card>
        <p className="font-sans text-sm text-charcoal-light">
          Order status timeline placeholder — tracking token:{' '}
          <code className="text-charcoal">{token ?? '—'}</code>
        </p>
      </Card>
    </PageContainer>
  );
}
