import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Field } from '@/components/form/Field';
import { Input } from '@/components/form/Input';
import { Logo } from '@/components/Logo';
import { supabase } from '@/lib/supabase';

interface FromState {
  from?: { pathname?: string };
}

// Admin login via Supabase Auth (email + password). Owner account only.
export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state: FromState | null };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);

    if (signInError) {
      setError('Incorrect email or password. Please try again.');
      return;
    }
    navigate(location.state?.from?.pathname ?? '/admin', { replace: true });
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
              required
            />
          </Field>
          <Field label="Password" required error={error ?? undefined}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </Field>
          <Button type="submit" className="mt-2 w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
}
