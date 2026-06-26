import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type OrderUpdate = Database['public']['Tables']['orders']['Update'];
type ItemInsert = Database['public']['Tables']['order_items']['Insert'];
type ItemUpdate = Database['public']['Tables']['order_items']['Update'];

// Shared invalidation: refresh the list, this order, and capacity (a status
// change to/from 'cancelled' shifts used_slots via DB trigger).
function useOrderInvalidator() {
  const qc = useQueryClient();
  return (orderId: string) => {
    qc.invalidateQueries({ queryKey: ['orders'] });
    qc.invalidateQueries({ queryKey: ['order', 'id', orderId] });
    qc.invalidateQueries({ queryKey: ['capacity'] });
  };
}

// Generic order-field update (status, pricing, time, internal notes).
export function useUpdateOrder() {
  const invalidate = useOrderInvalidator();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: OrderUpdate }) => {
      const { error } = await supabase.from('orders').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, { id }) => invalidate(id),
  });
}

export function useAddItem() {
  const invalidate = useOrderInvalidator();
  return useMutation({
    mutationFn: async (item: ItemInsert) => {
      const { error } = await supabase.from('order_items').insert(item);
      if (error) throw error;
    },
    onSuccess: (_data, item) => invalidate(item.order_id),
  });
}

export function useUpdateItem() {
  const invalidate = useOrderInvalidator();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      orderId: string;
      patch: ItemUpdate;
    }) => {
      const { error } = await supabase
        .from('order_items')
        .update(patch)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, { orderId }) => invalidate(orderId),
  });
}

export function useDeleteItem() {
  const invalidate = useOrderInvalidator();
  return useMutation({
    mutationFn: async ({ id }: { id: string; orderId: string }) => {
      const { error } = await supabase.from('order_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, { orderId }) => invalidate(orderId),
  });
}

// Admin capacity slot update.
export function useUpdateCapacity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, totalSlots }: { id: string; totalSlots: number }) => {
      const { error } = await supabase
        .from('monthly_capacity')
        .update({ total_slots: totalSlots })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['capacity'] }),
  });
}
