import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Field } from '@/components/form/Field';
import { Input } from '@/components/form/Input';
import { StatusBadge } from '@/components/StatusBadge';
import { lookupOrders } from './use-orders';
import { PRODUCT_TYPE_LABELS, type Order } from '@/types';

// Look up an order by order number or phone number.
export function OrderLookupPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Order[] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setResults(lookupOrders(query));
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
          <Button type="submit" disabled={!query.trim()}>
            Find My Order
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
                  key={o.id}
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
