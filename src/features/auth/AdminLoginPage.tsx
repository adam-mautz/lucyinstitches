import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';

// Admin login — email + password (Supabase Auth in Phase 3).
// Placeholder "sign in" sets a stub session so guarded routes are
// reachable during UI development.
export function AdminLoginPage() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  const handleStubLogin = () => {
    setSession('owner@lucyinstitches.com');
    navigate('/admin');
  };

  return (
    <PageContainer className="max-w-md">
      <h1 className="mb-6 text-center font-display text-3xl">Admin Sign In</h1>
      <Card>
        <p className="mb-4 font-sans text-sm text-charcoal-light">
          Login form placeholder — email + password via Supabase Auth.
        </p>
        <Button onClick={handleStubLogin} className="w-full">
          Continue (stub login)
        </Button>
      </Card>
    </PageContainer>
  );
}
