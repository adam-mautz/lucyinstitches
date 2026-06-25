import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';

// Look up an order by order number or phone. Placeholder only.
export function OrderLookupPage() {
  return (
    <PageContainer>
      <h1 className="mb-6 text-center font-display text-3xl">Track Your Order</h1>
      <Card>
        <p className="font-sans text-sm text-charcoal-light">
          Order lookup placeholder — search by order number or phone number.
        </p>
      </Card>
    </PageContainer>
  );
}
