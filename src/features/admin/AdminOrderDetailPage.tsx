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
import { useToastStore } from '@/store/toast-store';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import {
  ORDER_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  type Order,
  type OrderItem,
  type OrderStatus,
} from '@/types';

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

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

  return <OrderDetail order={order} />;
}

// Separate component so editable state can initialize from the loaded order.
function OrderDetail({ order }: { order: Order }) {
  const push = useToastStore((s) => s.push);

  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [quoted, setQuoted] = useState(order.quotedPrice?.toString() ?? '');
  const [final, setFinal] = useState(order.finalPrice?.toString() ?? '');
  const [minutes, setMinutes] = useState(
    order.timeSpentMinutes?.toString() ?? ''
  );
  const [internalNote, setInternalNote] = useState('');
  const [items, setItems] = useState<OrderItem[]>(order.items);
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Keep local state in sync if the underlying order changes (e.g. nav).
  useEffect(() => {
    setStatus(order.status);
    setItems(order.items);
  }, [order]);

  const saved = (msg: string) => push(`${msg} (preview — not persisted)`, 'success');

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, isComplete: !it.isComplete } : it
      )
    );
  };

  const addItem = () => {
    if (!newLabel.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: `tmp-${prev.length + 1}`,
        orderId: order.id,
        label: newLabel.trim(),
        description: newDesc.trim() || undefined,
        isComplete: false,
      },
    ]);
    setNewLabel('');
    setNewDesc('');
    saved('Item added');
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

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
          <StatusBadge status={status} />
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
          </Card>

          {/* Item tagging */}
          <Card>
            <h2 className="mb-3 font-display text-xl">Items</h2>
            <div className="flex flex-col gap-2">
              {items.length === 0 && (
                <p className="font-body text-sm text-charcoal-light">
                  No items tagged yet — add tags like H1, H2 for multi-item
                  orders.
                </p>
              )}
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 rounded-lg border border-cream-dark bg-white/60 px-3 py-2"
                >
                  <button
                    onClick={() => toggleItem(it.id)}
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
              <Button variant="secondary" onClick={addItem} className="shrink-0">
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
                onClick={() => saved('Note saved')}
                disabled={!internalNote.trim()}
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
              onClick={() =>
                saved(`Status set to ${ORDER_STATUS_LABELS[status]}`)
              }
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
                onClick={() => saved('Pricing saved')}
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
              onClick={() => saved('Time logged')}
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
