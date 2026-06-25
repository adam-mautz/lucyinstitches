import { useQuery } from '@tanstack/react-query';
import { MOCK_ORDERS } from '@/lib/mock-data';
import type { Order } from '@/types';

// Phase 1 data access for orders — mock-backed through React Query.
// Phase 2 swaps each queryFn for a Supabase call; component code is unchanged.

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => MOCK_ORDERS,
  });
}

export function useOrderByToken(token: string | undefined) {
  return useQuery<Order | null>({
    queryKey: ['order', 'token', token],
    enabled: !!token,
    queryFn: async () =>
      MOCK_ORDERS.find((o) => o.uniqueTrackingToken === token) ?? null,
  });
}

export function useOrderById(id: string | undefined) {
  return useQuery<Order | null>({
    queryKey: ['order', 'id', id],
    enabled: !!id,
    queryFn: async () => MOCK_ORDERS.find((o) => o.id === id) ?? null,
  });
}

// Lookup by order number OR phone (digits-only match). Used by the public
// lookup page; returns matches array.
export function lookupOrders(query: string): Order[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const digits = q.replace(/\D/g, '');
  return MOCK_ORDERS.filter((o) => {
    const byNumber = o.orderNumber.toLowerCase() === q;
    const byPhone =
      digits.length >= 7 && o.customerPhone.replace(/\D/g, '') === digits;
    return byNumber || byPhone;
  });
}
