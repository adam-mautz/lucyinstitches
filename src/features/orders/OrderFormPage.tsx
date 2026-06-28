import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Field } from '@/components/form/Field';
import { Textarea } from '@/components/form/Textarea';
import { ImageUploadField } from './ImageUploadField';
import { uploadInspiration } from './upload-inspiration';
import { cn } from '@/lib/utils';
import { PRODUCTS } from '@/lib/products';
import { useCapacity } from '@/features/capacity/use-capacity';
import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';
import type { ProductType } from '@/types';

// Item builder — pick a product, add details, then add to cart (and either
// build another or head to checkout).
export function OrderFormPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const push = useToastStore((s) => s.push);
  const { data: capacity } = useCapacity();
  const cartItems = useCartStore((s) => s.items);
  const addToCart = useCartStore((s) => s.add);

  const preselect = params.get('product') as ProductType | null;
  const [productType, setProductType] = useState<ProductType | null>(preselect);
  const [embroideryRequest, setEmbroideryRequest] = useState('');
  const [notes, setNotes] = useState('');
  const [inspiration, setInspiration] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  // Remaining availability accounting for what's already in the cart.
  const remaining = useMemo(() => {
    const map = new Map<ProductType, number>();
    capacity?.forEach((c) => {
      const inCart = cartItems.filter(
        (i) => i.productType === c.productType
      ).length;
      map.set(c.productType, c.totalSlots - c.usedSlots - inCart);
    });
    return map;
  }, [capacity, cartItems]);

  const isFull = (pt: ProductType) => (remaining.get(pt) ?? 0) <= 0;

  const valid =
    !!productType && !isFull(productType) && embroideryRequest.trim().length > 0;

  const resetForm = () => {
    setProductType(null);
    setEmbroideryRequest('');
    setNotes('');
    setInspiration(null);
  };

  // Add current item to cart; returns true on success.
  const addCurrent = async (): Promise<boolean> => {
    if (!productType || !valid || busy) return false;
    setBusy(true);
    try {
      let path: string | null = null;
      if (inspiration) path = await uploadInspiration(inspiration);
      addToCart({
        productType,
        embroideryRequest: embroideryRequest.trim(),
        notes: notes.trim(),
        inspirationImagePath: path,
        inspirationImageName: inspiration?.name ?? null,
      });
      return true;
    } catch (err) {
      push(
        err instanceof Error ? err.message : 'Could not add the item.',
        'error'
      );
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleAddAnother = async () => {
    if (await addCurrent()) {
      resetForm();
      push('Item added — build another!', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoToCart = async () => {
    if (await addCurrent()) navigate('/order/cart');
  };

  return (
    <PageContainer className="max-w-2xl">
      <h1 className="mb-2 text-center font-display text-3xl">Place an Order</h1>
      <p className="mb-6 text-center font-body text-charcoal-light">
        Add one item at a time — you can order as many as you like.
      </p>

      {cartItems.length > 0 && (
        <Link
          to="/order/cart"
          className="mb-6 flex items-center justify-between rounded-xl border border-sage/50 bg-sage/15 px-4 py-3 transition hover:bg-sage/25"
        >
          <span className="font-sans text-sm text-charcoal">
            {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in your cart
          </span>
          <span className="font-sans text-sm font-medium text-slate-blue">
            Review cart →
          </span>
        </Link>
      )}

      <Card>
        {/* Product picker */}
        <p className="mb-3 font-body text-charcoal-light">
          What are we stitching?
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PRODUCTS.map((p) => {
            const full = isFull(p.type);
            const active = productType === p.type;
            return (
              <button
                key={p.type}
                type="button"
                disabled={full}
                onClick={() => setProductType(p.type)}
                className={cn(
                  'flex flex-col items-start rounded-xl border p-4 text-left transition',
                  active
                    ? 'border-slate-blue bg-slate-blue/10 shadow-warm'
                    : 'border-cream-dark bg-white/60 hover:border-slate-blue/60',
                  full && 'cursor-not-allowed opacity-50 hover:border-cream-dark'
                )}
              >
                <span className="font-display text-lg">{p.label}</span>
                <span className="mt-1 font-body text-xs text-charcoal-light">
                  {full
                    ? 'Full this month'
                    : p.startingPrice > 0
                      ? `from $${p.startingPrice}`
                      : 'priced per project'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Details */}
        <div className="mt-6 flex flex-col gap-5">
          <Field
            label="What would you like embroidered?"
            required
            hint="Describe the words, art, placement, and colors you have in mind."
          >
            <Textarea
              value={embroideryRequest}
              onChange={(e) => setEmbroideryRequest(e.target.value)}
              placeholder="e.g. ‘stay soft’ in lowercase cursive, cream thread, left chest"
            />
          </Field>
          <Field label="Anything else?" hint="Optional notes for Lucy.">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sizing, deadline, the story behind it…"
            />
          </Field>
          <Field label="Inspiration image">
            <ImageUploadField file={inspiration} onChange={setInspiration} />
          </Field>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={handleAddAnother}
            disabled={!valid || busy}
          >
            {busy ? 'Adding…' : 'Add another item'}
          </Button>
          <Button onClick={handleGoToCart} disabled={!valid || busy}>
            {busy ? 'Adding…' : 'Go to cart →'}
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
