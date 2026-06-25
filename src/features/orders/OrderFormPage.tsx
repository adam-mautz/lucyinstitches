import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Field } from '@/components/form/Field';
import { Input } from '@/components/form/Input';
import { Textarea } from '@/components/form/Textarea';
import { StepIndicator } from '@/components/form/StepIndicator';
import { ImageUploadField } from './ImageUploadField';
import { cn } from '@/lib/utils';
import { PRODUCTS } from '@/lib/mock-data';
import { useCapacity } from '@/features/capacity/use-capacity';
import {
  PRODUCT_TYPE_LABELS,
  type ProductType,
} from '@/types';

const STEPS = ['Product', 'Details', 'Contact', 'Review'];

interface FormState {
  productType: ProductType | null;
  embroideryRequest: string;
  notes: string;
  inspiration: File | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

const EMPTY: FormState = {
  productType: null,
  embroideryRequest: '',
  notes: '',
  inspiration: null,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
};

export function OrderFormPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data: capacity } = useCapacity();

  const preselect = params.get('product') as ProductType | null;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    ...EMPTY,
    productType: preselect,
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Which product types are full this month (disabled in the picker).
  const fullTypes = useMemo(() => {
    const map = new Set<ProductType>();
    capacity?.forEach((c) => {
      if (!c.isAcceptingOrders) map.add(c.productType);
    });
    return map;
  }, [capacity]);

  const canContinue = (() => {
    if (step === 0) return !!form.productType && !fullTypes.has(form.productType);
    if (step === 1) return form.embroideryRequest.trim().length > 0;
    if (step === 2)
      return (
        form.customerName.trim() &&
        /\S+@\S+\.\S+/.test(form.customerEmail) &&
        form.customerPhone.trim().length >= 7
      );
    return true;
  })();

  const handleSubmit = () => {
    // Phase 1: no backend. Synthesize an order number + tracking token and
    // hand off to the confirmation page via router state.
    const orderNumber = 'LIS-0043';
    const token = 'tok-43-preview';
    navigate('/order/confirmation', {
      state: {
        orderNumber,
        token,
        customerName: form.customerName,
        productType: form.productType,
      },
    });
  };

  return (
    <PageContainer className="max-w-2xl">
      <h1 className="mb-6 text-center font-display text-3xl">Place an Order</h1>
      <div className="mb-8">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      <Card>
        {step === 0 && (
          <ProductStep
            selected={form.productType}
            fullTypes={fullTypes}
            onSelect={(t) => set('productType', t)}
          />
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <Field
              label="What would you like embroidered?"
              required
              hint="Describe the words, art, placement, and colors you have in mind."
            >
              <Textarea
                value={form.embroideryRequest}
                onChange={(e) => set('embroideryRequest', e.target.value)}
                placeholder="e.g. ‘stay soft’ in lowercase cursive, cream thread, left chest"
              />
            </Field>
            <Field label="Anything else?" hint="Optional notes for Lucy.">
              <Textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Sizing, deadline, the story behind it…"
              />
            </Field>
            <Field label="Inspiration image">
              <ImageUploadField
                file={form.inspiration}
                onChange={(f) => set('inspiration', f)}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <Field label="Your name" required>
              <Input
                value={form.customerName}
                onChange={(e) => set('customerName', e.target.value)}
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Email" required hint="We’ll send your order link here.">
              <Input
                type="email"
                value={form.customerEmail}
                onChange={(e) => set('customerEmail', e.target.value)}
                placeholder="jane@example.com"
              />
            </Field>
            <Field label="Phone" required hint="Used to look up your order too.">
              <Input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => set('customerPhone', e.target.value)}
                placeholder="555-555-0123"
              />
            </Field>
          </div>
        )}

        {step === 3 && <ReviewStep form={form} />}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit}>Submit Order</Button>
          )}
        </div>
      </Card>
    </PageContainer>
  );
}

function ProductStep({
  selected,
  fullTypes,
  onSelect,
}: {
  selected: ProductType | null;
  fullTypes: Set<ProductType>;
  onSelect: (t: ProductType) => void;
}) {
  return (
    <div>
      <p className="mb-4 font-body text-charcoal-light">
        What are we stitching this month?
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PRODUCTS.map((p) => {
          const full = fullTypes.has(p.type);
          const active = selected === p.type;
          return (
            <button
              key={p.type}
              type="button"
              disabled={full}
              onClick={() => onSelect(p.type)}
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
    </div>
  );
}

function ReviewStep({ form }: { form: FormState }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-body text-charcoal-light">
        Look good? Submit and we’ll email your order link.
      </p>
      <dl className="divide-y divide-cream-dark rounded-xl border border-cream-dark bg-white/60">
        <Row
          label="Product"
          value={
            form.productType ? PRODUCT_TYPE_LABELS[form.productType] : '—'
          }
        />
        <Row label="Request" value={form.embroideryRequest || '—'} />
        {form.notes && <Row label="Notes" value={form.notes} />}
        {form.inspiration && (
          <Row label="Inspiration" value={form.inspiration.name} />
        )}
        <Row label="Name" value={form.customerName} />
        <Row label="Email" value={form.customerEmail} />
        <Row label="Phone" value={form.customerPhone} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 px-4 py-3">
      <dt className="w-24 shrink-0 font-sans text-xs uppercase tracking-wide text-charcoal-light">
        {label}
      </dt>
      <dd className="font-body text-sm text-charcoal">{value}</dd>
    </div>
  );
}
