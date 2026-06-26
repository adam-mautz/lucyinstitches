import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FeaturedGallery } from './FeaturedGallery';
import { useFeaturedWorks } from './use-featured';

// Public "Inspiration & Recent Creations" feed.
export function InspirationPage() {
  const { data: works, isLoading, isError } = useFeaturedWorks();

  return (
    <PageContainer>
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl italic text-slate-blue-dark">
          Inspiration &amp; Recent Creations
        </h1>
        <p className="mx-auto mt-3 max-w-xl font-body text-lg text-charcoal-light">
          A peek at recent pieces and ideas to spark your own custom order.
        </p>
      </div>

      {isError ? (
        <Card className="text-center">
          <p className="font-body text-charcoal-light">
            We couldn’t load the gallery right now. Please refresh in a moment.
          </p>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-white/40"
            />
          ))}
        </div>
      ) : works && works.length > 0 ? (
        <FeaturedGallery works={works} />
      ) : (
        <Card className="text-center">
          <p className="font-body text-charcoal-light">
            New creations are coming soon — check back shortly!
          </p>
        </Card>
      )}

      <div className="mt-10 text-center">
        <p className="mb-3 font-body text-charcoal-light">
          Love what you see?
        </p>
        <Link to="/order">
          <Button>Place an Order</Button>
        </Link>
      </div>
    </PageContainer>
  );
}
