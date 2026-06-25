import { create } from 'zustand';
import type { OrderStatus } from '@/types';

// UI filter state for the admin order list.
interface OrderFilterState {
  statusFilter: OrderStatus | 'all';
  search: string;
  setStatusFilter: (status: OrderStatus | 'all') => void;
  setSearch: (search: string) => void;
  reset: () => void;
}

export const useOrderFilterStore = create<OrderFilterState>((set) => ({
  statusFilter: 'all',
  search: '',
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSearch: (search) => set({ search }),
  reset: () => set({ statusFilter: 'all', search: '' }),
}));
