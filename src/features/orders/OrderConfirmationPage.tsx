import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';

// Thank-you page after submitting — order number + tracking link.
// Placeholder only.
export function OrderConfirmationPage() {
  return (
    <PageContainer>
      <Card className="text-center">
        <h1 className="font-display text-3xl">Thank You!</h1>
        <p className="mt-3 font-sans text-sm text-charcoal-light">
          Order confirmation placeholder — order number and unique tracking
          link will appear here.
        </p>
      </Card>
    </PageContainer>
  );
}
