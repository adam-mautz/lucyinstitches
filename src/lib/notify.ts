import { supabase } from './supabase';

// Thin client wrappers around the /api email functions. These never throw —
// email is best-effort and must not block the order flow. They return true
// on success. Note: /api routes only exist on Vercel (or `vercel dev`), so
// these no-op gracefully under plain `vite dev`.

export async function notifyNewOrder(token: string): Promise<boolean> {
  try {
    const res = await fetch('/api/notify-new-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function notifyStatusChange(orderId: string): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    const jwt = data.session?.access_token;
    if (!jwt) return false;
    const res = await fetch('/api/notify-status-change', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ orderId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
