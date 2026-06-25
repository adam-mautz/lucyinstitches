import { Card } from '@/components/Card';
import { PRODUCT_TYPE_LABELS, type ProductType } from '@/types';

// Placeholder availability grid by product type. Wired to real
// capacity data in Phase 2; uses static stand-ins for now.
const productTypes = Object.keys(PRODUCT_TYPE_LABELS) as ProductType[];

export function AvailabilityDisplay() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {productTypes.map((type) => (
        <Card key={type} className="text-center">
          <p className="font-display text-xl">{PRODUCT_TYPE_LABELS[type]}</p>
          <p className="mt-1 font-sans text-xs text-charcoal-light">
            availability shown here
          </p>
        </Card>
      ))}
    </div>
  );
}
