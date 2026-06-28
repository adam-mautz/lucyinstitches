// Shared domain types — mirrors the data model in the project brief.
// DB tables are snake_case; these app-facing types are camelCase.

export type ProductType =
  | 'shirt'
  | 'hat'
  | 'jacket'
  | 'sweatshirt'
  | 'tank'
  | 'custom';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'shipped'
  | 'cancelled';

export interface MonthlyCapacity {
  id: string;
  month: string; // ISO date — first of month
  productType: ProductType;
  totalSlots: number;
  usedSlots: number; // derived from orders
  isAcceptingOrders: boolean; // derived: usedSlots < totalSlots
  closedMessage?: string;
}

export interface OrderItem {
  id: string;
  orderId?: string; // present on admin reads; omitted by the public RPC
  productType: ProductType;
  embroideryRequest: string;
  notes?: string; // customer's per-item notes
  inspirationImagePath?: string; // admin reads only
  label: string; // owner's tag, e.g. "Item 1", "H1"
  description?: string; // owner's internal per-item note
  productionState: string; // internal pipeline state (see production-states)
}

export interface StatusEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string; // human-readable, e.g. "LIS-0042"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  // Product details now live on items (see `items`). These order-level
  // fields are legacy single-item data and are undefined on new orders.
  productType?: ProductType;
  embroideryRequest?: string;
  notes?: string;
  inspirationImagePath?: string;
  internalNotes?: string; // admin-only; absent on public reads
  status: OrderStatus;
  statusHistory: StatusEvent[];
  items: OrderItem[];
  quotedPrice?: number;
  finalPrice?: number;
  timeSpentMinutes?: number;
  month: string; // capacity month this counts against
  uniqueTrackingToken: string; // UUID v4 — customer order link
  createdAt: string;
  updatedAt: string;
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  shirt: 'Shirt',
  hat: 'Hat',
  jacket: 'Jacket',
  sweatshirt: 'Sweatshirt',
  tank: 'Tank',
  custom: 'Custom',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
};
