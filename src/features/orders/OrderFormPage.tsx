import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';

// Multi-step order form — product type → details → contact → review.
// Placeholder only; built with mock data in Phase 1.
export function OrderFormPage() {
  return (
    <PageContainer>
      <h1 className="mb-6 text-center font-display text-3xl">Place an Order</h1>
      <Card>
        <p className="font-sans text-sm text-charcoal-light">
          Order form placeholder — product type, embroidery request, notes,
          inspiration image upload, and contact info will live here.
        </p>
      </Card>
    </PageContainer>
  );
}
