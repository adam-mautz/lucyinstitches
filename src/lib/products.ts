// Product display metadata (label, blurb, starting price) — real config,
// not mock data. Capacity and orders now come from Supabase; this just
// drives presentation for the product types.

import type { ProductType } from '@/types';

interface ProductMeta {
  type: ProductType;
  label: string;
  blurb: string;
  startingPrice: number;
}

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
