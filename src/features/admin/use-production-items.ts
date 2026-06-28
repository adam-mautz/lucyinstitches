import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { OrderStatus, ProductType } from '@/types';

export interface ProductionItem {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  orderStatus: OrderStatus;
  productType: ProductType;
  embroideryRequest: string;
  productionState: string;
  label: string;
}

interface Row {
  id: string;
  order_id: string;
  product_type: ProductType;
  embroidery_request: string;
  production_state: string;
  label: string;
  orders: {
    order_number: string;
    customer_name: string;
    status: OrderStatus;
  } | null;
}

// All line items across non-cancelled orders, with their order context.
// Backs the Kanban board and the Quick Update page.
export function useProductionItems() {
  return useQuery<ProductionItem[]>({
    queryKey: ['production-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(
          'id, order_id, product_type, embroidery_request, production_state, label, orders(order_number, customer_name, status)'
        )
        .order('created_at', { ascending: false });
      if (error) throw error;

      return (data as unknown as Row[])
        .filter((r) => r.orders && r.orders.status !== 'cancelled')
        .map((r) => ({
          id: r.id,
          orderId: r.order_id,
          orderNumber: r.orders!.order_number,
          customerName: r.orders!.customer_name,
          orderStatus: r.orders!.status,
          productType: r.product_type,
          embroideryRequest: r.embroidery_request,
          productionState: r.production_state,
          label: r.label,
        }));
    },
  });
}
