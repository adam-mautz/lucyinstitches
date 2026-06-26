import type { FeaturedWork } from './use-featured';

// Responsive masonry-ish grid of featured works (image + title + description).
export function FeaturedGallery({ works }: { works: FeaturedWork[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {works.map((w) => (
        <figure
          key={w.id}
          className="overflow-hidden rounded-2xl bg-white/70 shadow-warm transition hover:shadow-warm-lg"
        >
          <div className="aspect-square overflow-hidden bg-cream-dark">
            <img
              src={w.imageUrl}
              alt={w.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
            />
          </div>
          <figcaption className="p-4">
            <h3 className="font-display text-lg text-charcoal">{w.title}</h3>
            {w.description && (
              <p className="mt-1 font-body text-sm text-charcoal-light">
                {w.description}
              </p>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
