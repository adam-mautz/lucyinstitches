import type { Order } from '@/types';
import { PRODUCT_TYPE_LABELS, ORDER_STATUS_LABELS } from '@/types';

// Escape a value for CSV (wrap in quotes if it contains comma/quote/newline).
function cell(value: string | number | undefined | null): string {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const COLUMNS: Array<{ header: string; get: (o: Order) => string | number | undefined }> =
  [
    { header: 'Order #', get: (o) => o.orderNumber },
    { header: 'Status', get: (o) => ORDER_STATUS_LABELS[o.status] },
    {
      header: 'Products',
      get: (o) =>
        o.items.map((i) => PRODUCT_TYPE_LABELS[i.productType]).join(', '),
    },
    { header: 'Items', get: (o) => o.items.length },
    { header: 'Customer', get: (o) => o.customerName },
    { header: 'Email', get: (o) => o.customerEmail },
    { header: 'Phone', get: (o) => o.customerPhone },
    {
      header: 'Requests',
      get: (o) =>
        o.items
          .map((i) => `${PRODUCT_TYPE_LABELS[i.productType]}: ${i.embroideryRequest}`)
          .join(' | '),
    },
    { header: 'Quoted', get: (o) => o.quotedPrice ?? '' },
    { header: 'Final', get: (o) => o.finalPrice ?? '' },
    { header: 'Minutes', get: (o) => o.timeSpentMinutes ?? '' },
    { header: 'Placed', get: (o) => o.createdAt.slice(0, 10) },
  ];

export function ordersToCsv(orders: Order[]): string {
  const head = COLUMNS.map((c) => cell(c.header)).join(',');
  const rows = orders.map((o) =>
    COLUMNS.map((c) => cell(c.get(o))).join(',')
  );
  return [head, ...rows].join('\n');
}

// Trigger a client-side file download of the given text content.
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
