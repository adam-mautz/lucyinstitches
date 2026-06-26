import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { Field } from '@/components/form/Field';
import { Input } from '@/components/form/Input';
import { Select } from '@/components/form/Select';
import { Textarea } from '@/components/form/Textarea';
import { OrderTimeline } from '@/features/orders/OrderTimeline';
import { useOrderById } from '@/features/orders/use-orders';
import {
  useAddItem,
  useDeleteItem,
  useUpdateItem,
  useUpdateOrder,
} from '@/features/orders/use-order-mutations';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/store/toast-store';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import {
  ORDER_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  type Order,
  type OrderStatus,
} from '@/types';

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

// numeric input -> number | null (empty clears the column)
const toNum = (s: string): number | null => {
  const t = s.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
};

export function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrderById(orderId);

  if (isLoading) {
    return <Card className="h-64 animate-pulse bg-white/40" />;
  }
  if (!order) {
    return (
      <Card className="text-center">
        <h1 className="font-display text-2xl">Order not found</h1>
        <Link
          to="/admin/orders"
          className="mt-3 inline-block font-sans text-sm text-slate-blue"
        >
          ← Back to orders
        </Link>
      </Card>
    );
  }

  // key on id so editable inputs re-init when navigating between orders.
  return <OrderDetail key={order.id} order={order} />;
}

function OrderDetail({ order }: { order: Order }) {
  const push = useToastStore((s) => s.push);
  const updateOrder = useUpdateOrder();
  const addItem = useAddItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [quoted, setQuoted] = useState(order.quotedPrice?.toString() ?? '');
  const [final, setFinal] = useState(order.finalPrice?.toString() ?? '');
  const [minutes, setMinutes] = useState(
    order.timeSpentMinutes?.toString() ?? ''
  );
  const [internalNote, setInternalNote] = useState(order.internalNotes ?? '');
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Resolve a short-lived signed URL for the private inspiration image.
  useEffect(() => {
    if (!order.inspirationImagePath) return;
    let active = true;
    supabase.storage
      .from('inspiration')
      .createSignedUrl(order.inspirationImagePath, 3600)
      .then(({ data }) => {
        if (active) setImageUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [order.inspirationImagePath]);

  const onError = (err: unknown) =>
    push(err instanceof Error ? err.message : 'Something went wrong', 'error');

  const saveStatus = () =>
    updateOrder.mutate(
      { id: order.id, patch: { status } },
      {
        onSuccess: () =>
          push(`Status set to ${ORDER_STATUS_LABELS[status]}`, 'success'),
        onError,
      }
    );

  const savePricing = () =>
    updateOrder.mutate(
      {
        id: order.id,
        patch: { quoted_price: toNum(quoted), final_price: toNum(final) },
      },
      { onSuccess: () => push('Pricing saved', 'success'), onError }
    );

  const saveTime = () =>
    updateOrder.mutate(
      { id: order.id, patch: { time_spent_minutes: toNum(minutes) } },
      { onSuccess: () => push('Time logged', 'success'), onError }
    );

  const saveNote = () =>
    updateOrder.mutate(
      { id: order.id, patch: { internal_notes: internalNote.trim() || null } },
      { onSuccess: () => push('Note saved', 'success'), onError }
    );

  const handleAddItem = () => {
    if (!newLabel.trim()) return;
    addItem.mutate(
      {
        order_id: order.id,
        label: newLabel.trim(),
        description: newDesc.trim() || null,
      },
      {
        onSuccess: () => {
          setNewLabel('');
          setNewDesc('');
          push('Item added', 'success');
        },
        onError,
      }
    );
  };

  const toggleItem = (id: string, isComplete: boolean) =>
    updateItem.mutate(
      { id, orderId: order.id, patch: { is_complete: !isComplete } },
      { onError }
    );

  const removeItem = (id: string) =>
    deleteItem.mutate({ id, orderId: order.id }, { onError });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/orders"
          className="font-sans text-xs text-slate-blue hover:text-slate-blue-dark"
        >
          ← All orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-slate-blue-dark">
              {order.orderNumber}
            </h1>
            <p className="font-body text-charcoal-light">
              {PRODUCT_TYPE_LABELS[order.productType]} · placed{' '}
              {formatDate(order.createdAt)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: order info + items */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <h2 className="mb-3 font-display text-xl">Customer</h2>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Info label="Name" value={order.customerName} />
              <Info label="Email" value={order.customerEmail} />
              <Info label="Phone" value={order.customerPhone} />
            </dl>
          </Card>

          <Card>
            <h2 className="mb-3 font-display text-xl">Request</h2>
            <p className="font-body text-charcoal">{order.embroideryRequest}</p>
            {order.notes && (
              <p className="mt-2 font-body text-sm text-charcoal-light">
                Customer note: {order.notes}
              </p>
            )}
            {order.inspirationImagePath && (
              <div className="mt-4">
                <h3 className="mb-2 font-sans text-xs uppercase tracking-wide text-charcoal-light">
                  Inspiration
                </h3>
                {imageUrl ? (
                  <a href={imageUrl} target="_blank" rel="noreferrer">
                    <img
                      src={imageUrl}
                      alt="Customer inspiration"
                      className="max-h-64 rounded-xl border border-cream-dark object-contain"
                    />
                  </a>
                ) : (
                  <div className="h-32 w-32 animate-pulse rounded-xl bg-white/50" />
                )}
              </div>
            )}
          </Card>

          {/* Item tagging */}
          <Card>
            <h2 className="mb-3 font-display text-xl">Items</h2>
            <div className="flex flex-col gap-2">
              {order.items.length === 0 && (
                <p className="font-body text-sm text-charcoal-light">
                  No items tagged yet — add tags like H1, H2 for multi-item
                  orders.
                </p>
              )}
              {order.items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 rounded-lg border border-cream-dark bg-white/60 px-3 py-2"
                >
                  <button
                    onClick={() => toggleItem(it.id, it.isComplete)}
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                      it.isComplete
                        ? 'bg-sage text-charcoal'
                        : 'bg-cream-dark text-charcoal-light'
                    )}
                    aria-label="Toggle complete"
                  >
                    {it.isComplete ? '✓' : ''}
                  </button>
                  <span className="font-sans text-sm font-medium text-charcoal">
                    {it.label}
                  </span>
                  {it.description && (
                    <span className="flex-1 font-body text-sm text-charcoal-light">
                      {it.description}
                    </span>
                  )}
                  <button
                    onClick={() => removeItem(it.id)}
                    className="ml-auto font-sans text-xs text-mauve-dark hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Tag (e.g. H1)"
                className="sm:w-32"
              />
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={handleAddItem}
                disabled={addItem.isPending}
                className="shrink-0"
              >
                Add
              </Button>
            </div>
          </Card>

          {/* Internal notes */}
          <Card>
            <h2 className="mb-3 font-display text-xl">Internal Notes</h2>
            <p className="mb-2 font-body text-xs text-charcoal-light">
              Only you can see these — not shown to the customer.
            </p>
            <Textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Thread colors on hand, reminders, etc."
            />
            <div className="mt-3 flex justify-end">
              <Button
                variant="secondary"
                onClick={saveNote}
                disabled={updateOrder.isPending}
              >
                Save Note
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: management controls */}
        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-3 font-display text-xl">Status</h2>
            <Field label="Update status">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Button
              className="mt-3 w-full"
              onClick={saveStatus}
              disabled={updateOrder.isPending}
            >
              Save Status
            </Button>
          </Card>

          <Card>
            <h2 className="mb-3 font-display text-xl">Pricing</h2>
            <div className="flex flex-col gap-3">
              <Field label="Quoted price ($)">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={quoted}
                  onChange={(e) => setQuoted(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label="Final price ($)">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={final}
                  onChange={(e) => setFinal(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Button
                variant="secondary"
                onClick={savePricing}
                disabled={updateOrder.isPending}
              >
                Save Pricing
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-display text-xl">Time</h2>
            <Field
              label="Time spent (minutes)"
              hint={
                minutes
                  ? `That’s ${formatDuration(Number(minutes) || 0)}.`
                  : undefined
              }
            >
              <Input
                type="number"
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={saveTime}
              disabled={updateOrder.isPending}
            >
              Log Time
            </Button>
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-xl">History</h2>
            <OrderTimeline events={order.statusHistory} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-sans text-xs uppercase tracking-wide text-charcoal-light">
        {label}
      </dt>
      <dd className="font-body text-sm text-charcoal">{value}</dd>
    </div>
  );
}
