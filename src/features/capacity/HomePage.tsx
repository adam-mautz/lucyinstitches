import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Button } from '@/components/Button';
import { AvailabilityDisplay } from './AvailabilityDisplay';

// Homepage — brand intro + current availability + CTA. Placeholder.
export function HomePage() {
  return (
    <PageContainer>
      <section className="py-10 text-center">
        <h1 className="font-display text-4xl italic text-slate-blue-dark sm:text-5xl">
          Lucy in Stitches
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-body text-lg text-charcoal-light">
          Custom hand embroidery, made with care. Check what's available this
          month and place your order.
        </p>
        <Link to="/order" className="mt-6 inline-block">
          <Button>Place an Order</Button>
        </Link>
      </section>

      <section className="py-6">
        <h2 className="mb-4 text-center font-display text-2xl">
          This Month's Availability
        </h2>
        <AvailabilityDisplay />
      </section>
    </PageContainer>
  );
}
