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
  useUpdateItem,
  useUpdateOrder,
} from '@/features/orders/use-order-mutations';
import { supabase } from '@/lib/supabase';
import { notifyStatusChange } from '@/lib/notify';
import { useToastStore } from '@/store/toast-store';
import { formatDate, formatDuration } from '@/lib/utils';
import {
  PRODUCTION_STATES,
  productionStateLabel,
} from '@/lib/production-states';
import {
  ORDER_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  type Order,
  type OrderItem,
  type OrderStatus,
} from '@/types';

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

const toNum = (s: string): number | null => {
  const t = s.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
};

export function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrderById(orderId);

  if (isLoading) return <Card className="h-64 animate-pulse bg-white/40" />;
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
  return <OrderDetail key={order.id} order={order} />;
}

function OrderDetail({ order }: { order: Order }) {
  const push = useToastStore((s) => s.push);
  const updateOrder = useUpdateOrder();

  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [quoted, setQuoted] = useState(order.quotedPrice?.toString() ?? '');
  const [final, setFinal] = useState(order.finalPrice?.toString() ?? '');
  const [minutes, setMinutes] = useState(
    order.timeSpentMinutes?.toString() ?? ''
  );
  const [internalNote, setInternalNote] = useState(order.internalNotes ?? '');

  const onError = (err: unknown) =>
    push(err instanceof Error ? err.message : 'Something went wrong', 'error');

  const saveStatus = () =>
    updateOrder.mutate(
      { id: order.id, patch: { status } },
      {
        onSuccess: () => {
          push(`Status set to ${ORDER_STATUS_LABELS[status]}`, 'success');
          if (status !== order.status) void notifyStatusChange(order.id);
        },
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
              {order.items.length} item{order.items.length === 1 ? '' : 's'} ·
              placed {formatDate(order.createdAt)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: customer + items + internal notes */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <h2 className="mb-3 font-display text-xl">Customer</h2>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Info label="Name" value={order.customerName} />
              <Info label="Email" value={order.customerEmail} />
              <Info label="Phone" value={order.customerPhone} />
            </dl>
          </Card>

          <div>
            <h2 className="mb-3 font-display text-xl">
              Items ({order.items.length})
            </h2>
            <div className="flex flex-col gap-4">
              {order.items.map((item) => (
                <ItemCard key={item.id} item={item} orderId={order.id} />
              ))}
            </div>
          </div>

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

// One line item: customer details (read-only) + admin tag/complete controls.
function ItemCard({ item, orderId }: { item: OrderItem; orderId: string }) {
  const push = useToastStore((s) => s.push);
  const updateItem = useUpdateItem();
  const [label, setLabel] = useState(item.label);
  const [description, setDescription] = useState(item.description ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!item.inspirationImagePath) return;
    let active = true;
    supabase.storage
      .from('inspiration')
      .createSignedUrl(item.inspirationImagePath, 3600)
      .then(({ data }) => {
        if (active) setImageUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [item.inspirationImagePath]);

  const onError = (err: unknown) =>
    push(err instanceof Error ? err.message : 'Update failed', 'error');

  const setState = (production_state: string) =>
    updateItem.mutate(
      { id: item.id, orderId, patch: { production_state } },
      { onError }
    );

  const saveField = (patch: { label?: string; description?: string }) =>
    updateItem.mutate({ id: item.id, orderId, patch }, { onError });

  return (
    <Card>
      <div className="flex gap-4">
        {item.inspirationImagePath && (
          <div className="shrink-0">
            {imageUrl ? (
              <a href={imageUrl} target="_blank" rel="noreferrer">
                <img
                  src={imageUrl}
                  alt="Inspiration"
                  className="h-20 w-20 rounded-lg object-cover"
                />
              </a>
            ) : (
              <div className="h-20 w-20 animate-pulse rounded-lg bg-white/50" />
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-lg">
              {PRODUCT_TYPE_LABELS[item.productType]}
            </span>
            <Select
              value={item.productionState}
              onChange={(e) => setState(e.target.value)}
              className="w-auto"
            >
              {PRODUCTION_STATES.map((s) => (
                <option key={s} value={s}>
                  {productionStateLabel(s)}
                </option>
              ))}
            </Select>
          </div>
          <p className="mt-1 font-body text-sm text-charcoal">
            {item.embroideryRequest}
          </p>
          {item.notes && (
            <p className="mt-1 font-body text-xs text-charcoal-light">
              Customer note: {item.notes}
            </p>
          )}
        </div>
      </div>

      {/* Admin per-item controls */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-32">
          <label className="font-sans text-xs text-charcoal-light">Tag</label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => label !== item.label && saveField({ label })}
            placeholder="H1"
          />
        </div>
        <div className="flex-1">
          <label className="font-sans text-xs text-charcoal-light">
            Your note
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() =>
              description !== (item.description ?? '') &&
              saveField({ description: description || undefined })
            }
            placeholder="Internal note for this item"
          />
        </div>
      </div>
    </Card>
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
