import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { AvailabilityDisplay } from './AvailabilityDisplay';
import { currentMonthIso, formatMonth } from '@/lib/utils';

// Homepage — brand intro, current availability, CTA.
export function HomePage() {
  return (
    <PageContainer>
      {/* Hero */}
      <section className="flex flex-col items-center py-10 text-center">
        <Logo size={140} />
        <h1 className="mt-6 font-display text-4xl italic text-slate-blue-dark sm:text-5xl">
          Lucy in Stitches
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-body text-lg text-charcoal-light">
          Custom hand embroidery, made one piece at a time. Pick your garment,
          tell me your idea, and I’ll stitch something just for you.
        </p>
        <Link to="/order" className="mt-6 inline-block">
          <Button>Place an Order</Button>
        </Link>
        <Link
          to="/lookup"
          className="mt-3 font-sans text-sm text-slate-blue hover:text-slate-blue-dark"
        >
          Already ordered? Track it →
        </Link>
      </section>

      {/* Availability */}
      <section className="py-8">
        <div className="mb-6 text-center">
          <h2 className="font-display text-2xl">This Month’s Availability</h2>
          <p className="mt-1 font-body text-charcoal-light">
            Slots for {formatMonth(currentMonthIso())} — once a category fills, it
            reopens next month.
          </p>
        </div>
        <AvailabilityDisplay />
      </section>

      {/* How it works */}
      <section className="py-8">
        <h2 className="mb-6 text-center font-display text-2xl">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Place your order',
              body: 'Choose a garment and describe your embroidery — words, art, or a photo for inspiration.',
            },
            {
              step: '2',
              title: 'We confirm details',
              body: 'I’ll review, send a quote, and confirm your spot for the month.',
            },
            {
              step: '3',
              title: 'Stitched & shipped',
              body: 'Track progress anytime with your order link until it’s on its way to you.',
            },
          ].map((s) => (
            <div key={s.step} className="lis-card text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-blue font-display text-lg text-cream">
                {s.step}
              </div>
              <h3 className="mt-3 font-display text-lg">{s.title}</h3>
              <p className="mt-1 font-body text-sm text-charcoal-light">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
