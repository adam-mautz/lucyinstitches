import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mapOrder, type DbOrder } from './order-mapping';
import type { Order } from '@/types';

const ORDER_SELECT = '*, order_items(*), status_events(*)';

// Admin: all orders (authenticated — RLS grants the owner full access).
export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(ORDER_SELECT)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as DbOrder[]).map(mapOrder);
    },
  });
}

// Admin: a single order with items + history.
export function useOrderById(id: string | undefined) {
  return useQuery<Order | null>({
    queryKey: ['order', 'id', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(ORDER_SELECT)
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data ? mapOrder(data as unknown as DbOrder) : null;
    },
  });
}

// Public: order status by tracking token via SECURITY DEFINER RPC
// (returns only safe fields — no internal_notes/price/email/phone).
export function useOrderByToken(token: string | undefined) {
  return useQuery<Order | null>({
    queryKey: ['order', 'token', token],
    enabled: !!token,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_order_by_token', {
        p_token: token!,
      });
      if (error) throw error;
      if (!data) return null;
      // RPC returns a JSON object already in app (camelCase) shape.
      return data as unknown as Order;
    },
  });
}

interface LookupResult {
  orderNumber: string;
  customerName: string;
  status: Order['status'];
  uniqueTrackingToken: string;
  itemCount: number;
}

// Public: lookup by order number or phone via SECURITY DEFINER RPC.
export async function lookupOrders(query: string): Promise<LookupResult[]> {
  const q = query.trim();
  if (!q) return [];
  const { data, error } = await supabase.rpc('lookup_orders', { p_query: q });
  if (error) throw error;
  return (data as unknown as LookupResult[]) ?? [];
}
