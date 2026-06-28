import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Field } from '@/components/form/Field';
import { Input } from '@/components/form/Input';
import { CartItemEditModal } from './CartItemEditModal';
import { supabase } from '@/lib/supabase';
import { notifyNewOrder } from '@/lib/notify';
import { currentMonthIso, formatCurrency } from '@/lib/utils';
import { PRODUCT_BY_TYPE } from '@/lib/products';
import { useCartStore, type CartItem } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';

export function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.remove);
  const clearCart = useCartStore((s) => s.clear);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [editing, setEditing] = useState<CartItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const estimate = items.reduce(
    (sum, i) => sum + PRODUCT_BY_TYPE[i.productType].startingPrice,
    0
  );

  const contactValid =
    name.trim() && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 7;

  const handleSubmit = async () => {
    if (!contactValid || items.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('create_order', {
        p_customer_name: name,
        p_customer_email: email,
        p_customer_phone: phone,
        p_month: currentMonthIso(),
        p_items: items.map((i) => ({
          productType: i.productType,
          embroideryRequest: i.embroideryRequest,
          notes: i.notes,
          inspirationImagePath: i.inspirationImagePath,
        })),
      });
      if (error) throw error;

      const result = data as {
        orderNumber: string;
        uniqueTrackingToken: string;
      };

      queryClient.invalidateQueries({ queryKey: ['capacity'] });
      void notifyNewOrder(result.uniqueTrackingToken);

      const count = items.length;
      clearCart();
      navigate('/order/confirmation', {
        state: {
          orderNumber: result.orderNumber,
          token: result.uniqueTrackingToken,
          customerName: name,
          itemCount: count,
        },
      });
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : 'Something went wrong placing your order.',
        'error'
      );
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <PageContainer className="max-w-xl">
        <Card className="text-center">
          <h1 className="font-display text-2xl">Your cart is empty</h1>
          <p className="mt-2 font-body text-charcoal-light">
            Add an item to get started.
          </p>
          <Link to="/order" className="mt-4 inline-block">
            <Button>Start an Order</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-2xl">
      <h1 className="mb-6 text-center font-display text-3xl">Your Cart</h1>

      {/* Items */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <Card key={item.id} className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display text-lg">
                {PRODUCT_BY_TYPE[item.productType].label}
              </p>
              <p className="mt-1 font-body text-sm text-charcoal">
                {item.embroideryRequest}
              </p>
              {item.notes && (
                <p className="mt-1 font-body text-xs text-charcoal-light">
                  {item.notes}
                </p>
              )}
              {item.inspirationImageName && (
                <p className="mt-1 font-sans text-xs text-charcoal-light">
                  📎 {item.inspirationImageName}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <button
                onClick={() => setEditing(item)}
                className="font-sans text-xs text-slate-blue hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="font-sans text-xs text-mauve-dark hover:underline"
              >
                Remove
              </button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link
          to="/order"
          className="font-sans text-sm font-medium text-slate-blue hover:text-slate-blue-dark"
        >
          + Add another item
        </Link>
        <p className="font-body text-sm text-charcoal-light">
          Estimated total:{' '}
          <span className="font-medium text-charcoal">
            {formatCurrency(estimate)}
          </span>
        </p>
      </div>
      <p className="mt-1 text-right font-body text-xs text-charcoal-light">
        Final pricing is confirmed by Lucy (custom pieces quoted separately).
      </p>

      {/* Contact */}
      <Card className="mt-6">
        <h2 className="mb-4 font-display text-xl">Your Details</h2>
        <div className="flex flex-col gap-4">
          <Field label="Your name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Email" required hint="We’ll send your order link here.">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </Field>
          <Field label="Phone" required hint="Used to look up your order too.">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="555-555-0123"
            />
          </Field>
          <Button
            onClick={handleSubmit}
            disabled={!contactValid || submitting}
            className="mt-2"
          >
            {submitting
              ? 'Placing order…'
              : `Place Order (${items.length} item${items.length > 1 ? 's' : ''})`}
          </Button>
        </div>
      </Card>

      <CartItemEditModal item={editing} onClose={() => setEditing(null)} />
    </PageContainer>
  );
}
