import { Link, useLocation } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useToastStore } from '@/store/toast-store';

interface ConfirmationState {
  orderNumber?: string;
  token?: string;
  customerName?: string;
  itemCount?: number;
}

// Thank-you page — order number + unique tracking link. Reads details
// from router state passed by the order form.
export function OrderConfirmationPage() {
  const { state } = useLocation() as { state: ConfirmationState | null };
  const push = useToastStore((s) => s.push);

  const orderNumber = state?.orderNumber ?? 'LIS-0043';
  const token = state?.token ?? 'tok-43-preview';
  const trackUrl = `${window.location.origin}/track/${token}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(trackUrl);
      push('Tracking link copied', 'success');
    } catch {
      push('Couldn’t copy — please copy it manually', 'error');
    }
  };

  return (
    <PageContainer className="max-w-xl">
      <Card className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage font-display text-2xl text-charcoal">
          ✓
        </div>
        <h1 className="mt-4 font-display text-3xl">Thank you!</h1>
        <p className="mt-2 font-body text-lg text-charcoal-light">
          {state?.customerName ? `${state.customerName}, your` : 'Your'} order is
          in. I’ll review it and follow up by email shortly.
        </p>

        <div className="mt-6 rounded-xl border border-cream-dark bg-white/60 p-4">
          <p className="font-sans text-xs uppercase tracking-wide text-charcoal-light">
            Order number
          </p>
          <p className="font-display text-2xl text-slate-blue-dark">
            {orderNumber}
          </p>
          {state?.itemCount ? (
            <p className="mt-1 font-body text-sm text-charcoal-light">
              {state.itemCount} item{state.itemCount > 1 ? 's' : ''}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <p className="font-sans text-xs uppercase tracking-wide text-charcoal-light">
            Your tracking link
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-cream-dark bg-white/60 p-2">
            <code className="min-w-0 flex-1 truncate px-2 text-left font-sans text-xs text-charcoal">
              {trackUrl}
            </code>
            <Button variant="secondary" onClick={copyLink} className="shrink-0">
              Copy
            </Button>
          </div>
          <p className="font-body text-xs text-charcoal-light">
            Save this — it’s how you’ll check your order status anytime.
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Link to={`/track/${token}`}>
            <Button>View Order Status</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">Back home</Button>
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
}
