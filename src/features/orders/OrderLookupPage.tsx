import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Field } from '@/components/form/Field';
import { Input } from '@/components/form/Input';
import { StatusBadge } from '@/components/StatusBadge';
import { lookupOrders } from './use-orders';
import { useToastStore } from '@/store/toast-store';
import { PRODUCT_TYPE_LABELS, type Order, type ProductType } from '@/types';

interface LookupResult {
  orderNumber: string;
  productType: ProductType;
  customerName: string;
  status: Order['status'];
  uniqueTrackingToken: string;
}

// Look up an order by order number or phone number.
export function OrderLookupPage() {
  const push = useToastStore((s) => s.push);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LookupResult[] | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      setResults(await lookupOrders(query));
    } catch {
      push('Couldn’t search right now — please try again.', 'error');
    } finally {
      setSearching(false);
    }
  };

  return (
    <PageContainer className="max-w-xl">
      <h1 className="mb-2 text-center font-display text-3xl">
        Track Your Order
      </h1>
      <p className="mb-6 text-center font-body text-charcoal-light">
        Enter your order number (like LIS-0042) or the phone number you used.
      </p>

      <Card>
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <Field label="Order number or phone">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="LIS-0042 or 503-555-0142"
            />
          </Field>
          <Button type="submit" disabled={!query.trim() || searching}>
            {searching ? 'Searching…' : 'Find My Order'}
          </Button>
        </form>
      </Card>

      {results !== null && (
        <div className="mt-6">
          {results.length === 0 ? (
            <Card className="text-center">
              <p className="font-body text-charcoal-light">
                No order found for “{query}”. Double-check the number or phone,
                or use the tracking link from your confirmation email.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((o) => (
                <Link
                  key={o.orderNumber}
                  to={`/track/${o.uniqueTrackingToken}`}
                  className="lis-card flex items-center justify-between transition hover:shadow-warm-lg"
                >
                  <div>
                    <p className="font-display text-lg text-slate-blue-dark">
                      {o.orderNumber}
                    </p>
                    <p className="font-body text-sm text-charcoal-light">
                      {PRODUCT_TYPE_LABELS[o.productType]} · {o.customerName}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
