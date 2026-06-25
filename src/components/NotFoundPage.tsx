import { Link } from 'react-router-dom';
import { PageContainer } from './PageContainer';
import { Button } from './Button';

export function NotFoundPage() {
  return (
    <PageContainer className="text-center">
      <h1 className="font-display text-5xl italic text-slate-blue-dark">404</h1>
      <p className="mt-3 font-body text-lg text-charcoal-light">
        We couldn't find that page.
      </p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Back home</Button>
      </Link>
    </PageContainer>
  );
}
