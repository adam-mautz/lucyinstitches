import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { currentMonthIso } from '@/lib/utils';
import { PRODUCTS } from '@/lib/products';
import type { MonthlyCapacity, ProductType } from '@/types';

// Display order for product types (matches PRODUCTS config).
const ORDER: ProductType[] = PRODUCTS.map((p) => p.type);

interface CapacityRow {
  id: string;
  month: string;
  product_type: ProductType;
  total_slots: number;
  used_slots: number;
  closed_message: string | null;
}

function rowToCapacity(r: CapacityRow): MonthlyCapacity {
  return {
    id: r.id,
    month: r.month,
    productType: r.product_type,
    totalSlots: r.total_slots,
    usedSlots: r.used_slots,
    isAcceptingOrders: r.used_slots < r.total_slots,
    closedMessage: r.closed_message ?? undefined,
  };
}

// Current-month availability, read from Supabase (anon — RLS allows public
// SELECT on monthly_capacity only).
export function useCapacity() {
  return useQuery<MonthlyCapacity[]>({
    queryKey: ['capacity', 'current-month'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_capacity')
        .select(
          'id, month, product_type, total_slots, used_slots, closed_message'
        )
        .eq('month', currentMonthIso());

      if (error) throw error;

      return (data as CapacityRow[])
        .map(rowToCapacity)
        .sort(
          (a, b) =>
            ORDER.indexOf(a.productType) - ORDER.indexOf(b.productType)
        );
    },
  });
}
