// Mock dataset for Phase 1 UI development. Replaced by Supabase queries
// in Phase 2. Shapes mirror src/types so swapping the data source later
// is a drop-in change.

import type {
  MonthlyCapacity,
  Order,
  ProductType,
  OrderStatus,
} from '@/types';

// Current capacity month — first of the month (matches "today" June 2026).
export const CURRENT_MONTH = '2026-06-01';

interface ProductMeta {
  type: ProductType;
  label: string;
  blurb: string;
  startingPrice: number;
}

// Display metadata for each product type.
export const PRODUCTS: ProductMeta[] = [
  {
    type: 'shirt',
    label: 'Shirt',
    blurb: 'Tees & button-downs, hand-stitched to order.',
    startingPrice: 35,
  },
  {
    type: 'hat',
    label: 'Hat',
    blurb: 'Caps & beanies with a custom monogram or motif.',
    startingPrice: 28,
  },
  {
    type: 'jacket',
    label: 'Jacket',
    blurb: 'Denim & canvas — statement back pieces a specialty.',
    startingPrice: 75,
  },
  {
    type: 'sweatshirt',
    label: 'Sweatshirt',
    blurb: 'Cozy crewnecks & hoodies, lettering or art.',
    startingPrice: 48,
  },
  {
    type: 'tank',
    label: 'Tank',
    blurb: 'Lightweight tanks, delicate stitch work.',
    startingPrice: 30,
  },
  {
    type: 'custom',
    label: 'Custom',
    blurb: 'Bring your own piece or an idea — let’s talk.',
    startingPrice: 0,
  },
];

export const PRODUCT_BY_TYPE: Record<ProductType, ProductMeta> =
  PRODUCTS.reduce(
    (acc, p) => {
      acc[p.type] = p;
      return acc;
    },
    {} as Record<ProductType, ProductMeta>
  );

// Monthly capacity for the current month, by product type.
export const MOCK_CAPACITY: MonthlyCapacity[] = [
  buildCapacity('shirt', 10, 6),
  buildCapacity('hat', 8, 8), // full
  buildCapacity('jacket', 4, 1),
  buildCapacity('sweatshirt', 6, 4),
  buildCapacity('tank', 6, 2),
  buildCapacity('custom', 3, 1),
];

function buildCapacity(
  productType: ProductType,
  totalSlots: number,
  usedSlots: number,
  closedMessage?: string
): MonthlyCapacity {
  return {
    id: `cap-${productType}`,
    month: CURRENT_MONTH,
    productType,
    totalSlots,
    usedSlots,
    isAcceptingOrders: usedSlots < totalSlots,
    closedMessage,
  };
}

// A spread of mock orders across every status.
export const MOCK_ORDERS: Order[] = [
  buildOrder({
    n: 42,
    name: 'Maya Hollis',
    email: 'maya.hollis@example.com',
    phone: '503-555-0142',
    productType: 'jacket',
    request: 'Wildflower bouquet across the back, muted tones.',
    status: 'in_progress',
    quotedPrice: 120,
    timeSpentMinutes: 95,
    items: [
      { label: 'J1', description: 'Back panel — bouquet', isComplete: true },
      { label: 'J2', description: 'Left cuff — initials MH', isComplete: false },
    ],
    daysAgo: 9,
  }),
  buildOrder({
    n: 41,
    name: 'Theo Park',
    email: 'theo.park@example.com',
    phone: '971-555-0188',
    productType: 'hat',
    request: 'Small mountain range, single thread color (sage).',
    status: 'pending',
    daysAgo: 1,
  }),
  buildOrder({
    n: 40,
    name: 'Renata Cole',
    email: 'ren.cole@example.com',
    phone: '503-555-0119',
    productType: 'sweatshirt',
    request: '“stay soft” lettering, lowercase script, cream thread.',
    status: 'confirmed',
    quotedPrice: 58,
    daysAgo: 3,
  }),
  buildOrder({
    n: 39,
    name: 'Iris Nakamura',
    email: 'iris.n@example.com',
    phone: '360-555-0173',
    productType: 'shirt',
    request: 'Tiny strawberry on the pocket + name on collar.',
    status: 'completed',
    quotedPrice: 45,
    finalPrice: 45,
    timeSpentMinutes: 70,
    items: [
      { label: 'S1', description: 'Pocket strawberry', isComplete: true },
      { label: 'S2', description: 'Collar name', isComplete: true },
    ],
    daysAgo: 14,
  }),
  buildOrder({
    n: 38,
    name: 'Daniel Cho',
    email: 'daniel.cho@example.com',
    phone: '503-555-0160',
    productType: 'jacket',
    request: 'Koi fish, two-color, lower right front.',
    status: 'shipped',
    quotedPrice: 135,
    finalPrice: 140,
    timeSpentMinutes: 180,
    daysAgo: 22,
  }),
  buildOrder({
    n: 37,
    name: 'Priya Anand',
    email: 'priya.anand@example.com',
    phone: '425-555-0107',
    productType: 'tank',
    request: 'Daisy chain along the neckline.',
    status: 'cancelled',
    daysAgo: 18,
  }),
  buildOrder({
    n: 36,
    name: 'Sam Whitfield',
    email: 'sam.w@example.com',
    phone: '503-555-0151',
    productType: 'sweatshirt',
    request: 'Constellation (Orion) in white, center chest.',
    status: 'pending',
    daysAgo: 0,
  }),
];

interface BuildOrderArgs {
  n: number;
  name: string;
  email: string;
  phone: string;
  productType: ProductType;
  request: string;
  status: OrderStatus;
  quotedPrice?: number;
  finalPrice?: number;
  timeSpentMinutes?: number;
  items?: Array<{ label: string; description?: string; isComplete: boolean }>;
  daysAgo: number;
}

// Status progression used to synthesize a believable history timeline.
const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'shipped',
];

function buildOrder(args: BuildOrderArgs): Order {
  const id = `order-${args.n}`;
  const orderNumber = `LIS-${String(args.n).padStart(4, '0')}`;
  const createdAt = daysAgoIso(args.daysAgo);

  // Build a plausible status history up to the current status.
  const history =
    args.status === 'cancelled'
      ? ['pending', 'cancelled']
      : STATUS_FLOW.slice(0, STATUS_FLOW.indexOf(args.status) + 1);

  const statusHistory = history.map((status, i) => ({
    id: `${id}-evt-${i}`,
    orderId: id,
    status: status as OrderStatus,
    note: undefined,
    createdAt: daysAgoIso(Math.max(args.daysAgo - i * 2, 0)),
  }));

  return {
    id,
    orderNumber,
    customerName: args.name,
    customerEmail: args.email,
    customerPhone: args.phone,
    productType: args.productType,
    embroideryRequest: args.request,
    notes: undefined,
    inspirationImageUrl: undefined,
    status: args.status,
    statusHistory,
    items: (args.items ?? []).map((it, i) => ({
      id: `${id}-item-${i}`,
      orderId: id,
      label: it.label,
      description: it.description,
      isComplete: it.isComplete,
    })),
    quotedPrice: args.quotedPrice,
    finalPrice: args.finalPrice,
    timeSpentMinutes: args.timeSpentMinutes,
    month: CURRENT_MONTH,
    uniqueTrackingToken: `tok-${args.n}-9f2c1a7b`,
    createdAt,
    updatedAt: statusHistory[statusHistory.length - 1].createdAt,
  };
}

// Deterministic "N days ago" ISO string anchored to 2026-06-25 (no
// Date.now — keeps mock data stable across renders/builds).
function daysAgoIso(days: number): string {
  const anchor = Date.UTC(2026, 5, 25, 16, 0, 0); // 2026-06-25T16:00:00Z
  const ms = anchor - days * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString();
}
