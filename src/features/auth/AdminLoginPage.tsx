import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Field } from '@/components/form/Field';
import { Input } from '@/components/form/Input';
import { Logo } from '@/components/Logo';
import { useAuthStore } from '@/store/auth-store';

// Admin login — email + password (Supabase Auth in Phase 3). For now any
// input signs in a stub session so the dashboard is reachable.
export function AdminLoginPage() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSession(email || 'owner@lucyinstitches.com');
    navigate('/admin');
  };

  return (
    <PageContainer className="flex max-w-md flex-col items-center pt-16">
      <Logo size={88} />
      <h1 className="mt-5 font-display text-3xl">Welcome back, Lucy</h1>
      <p className="mb-6 mt-1 font-body text-charcoal-light">
        Sign in to manage your orders.
      </p>

      <Card className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@lucyinstitches.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Password" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>
          <Button type="submit" className="mt-2 w-full">
            Sign In
          </Button>
        </form>
        <p className="mt-4 text-center font-body text-xs text-charcoal-light">
          Phase 1 preview — any credentials sign you in.
        </p>
      </Card>
    </PageContainer>
  );
}
