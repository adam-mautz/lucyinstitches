import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductType } from '@/types';

// A single item being ordered. The inspiration image is uploaded when the
// item is added (so the cart can persist as plain JSON across refreshes).
export interface CartItem {
  id: string; // local id
  productType: ProductType;
  embroideryRequest: string;
  notes: string;
  inspirationImagePath: string | null;
  inspirationImageName: string | null;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, 'id'>) => void;
  update: (id: string, patch: Partial<Omit<CartItem, 'id'>>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => ({
          items: [...s.items, { ...item, id: crypto.randomUUID() }],
        })),
      update: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'lis-cart' }
  )
);
