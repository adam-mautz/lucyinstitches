import type {
  Order,
  OrderItem,
  OrderStatus,
  ProductType,
  StatusEvent,
} from '@/types';

// Shapes returned by Supabase selects (snake_case). Optional nested arrays
// come from `select('*, order_items(*), status_events(*)')`.
export interface DbOrderItem {
  id: string;
  order_id: string;
  label: string;
  description: string | null;
  is_complete: boolean;
  created_at: string;
}

export interface DbStatusEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

export interface DbOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_type: ProductType;
  embroidery_request: string;
  notes: string | null;
  inspiration_image_path: string | null;
  internal_notes: string | null;
  status: OrderStatus;
  quoted_price: number | string | null;
  final_price: number | string | null;
  time_spent_minutes: number | null;
  month: string;
  unique_tracking_token: string;
  created_at: string;
  updated_at: string;
  order_items?: DbOrderItem[];
  status_events?: DbStatusEvent[];
}

function mapItem(i: DbOrderItem): OrderItem {
  return {
    id: i.id,
    orderId: i.order_id,
    label: i.label,
    description: i.description ?? undefined,
    isComplete: i.is_complete,
  };
}

function mapEvent(e: DbStatusEvent): StatusEvent {
  return {
    id: e.id,
    orderId: e.order_id,
    status: e.status,
    note: e.note ?? undefined,
    createdAt: e.created_at,
  };
}

// numeric columns arrive as strings from PostgREST — coerce safely.
function num(v: number | string | null): number | undefined {
  if (v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export function mapOrder(row: DbOrder): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    productType: row.product_type,
    embroideryRequest: row.embroidery_request,
    notes: row.notes ?? undefined,
    inspirationImagePath: row.inspiration_image_path ?? undefined,
    internalNotes: row.internal_notes ?? undefined,
    status: row.status,
    statusHistory: (row.status_events ?? [])
      .map(mapEvent)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    items: (row.order_items ?? [])
      .map(mapItem)
      .sort((a, b) => a.label.localeCompare(b.label)),
    quotedPrice: num(row.quoted_price),
    finalPrice: num(row.final_price),
    timeSpentMinutes: row.time_spent_minutes ?? undefined,
    month: row.month,
    uniqueTrackingToken: row.unique_tracking_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
