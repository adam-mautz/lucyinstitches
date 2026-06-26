import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  supabaseAdmin,
  resend,
  statusChangeEmail,
  EMAIL_FROM,
  REPLY_TO,
  type OrderEmailData,
} from './_lib.js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// POST { orderId } — emails the CUSTOMER about a status change.
// ADMIN ONLY: requires a valid Supabase session JWT (Authorization: Bearer).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the caller is an authenticated admin.
    const authHeader = req.headers.authorization ?? '';
    const jwt = authHeader.replace(/^Bearer\s+/i, '');
    if (!jwt) return res.status(401).json({ error: 'Not authenticated' });
    if (!SUPABASE_URL || !ANON_KEY) {
      return res.status(500).json({ error: 'Server not configured' });
    }
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser(jwt);
    if (userErr || !userData.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const orderId = (req.body?.orderId ?? '') as string;
    if (!orderId) return res.status(400).json({ error: 'Missing orderId' });

    const { data, error } = await supabaseAdmin()
      .from('orders')
      .select(
        'order_number, customer_name, customer_email, product_type, embroidery_request, status, unique_tracking_token'
      )
      .eq('id', orderId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });

    const order = data as OrderEmailData;
    const email = statusChangeEmail(order);
    const sent = await resend().emails.send({
      from: EMAIL_FROM,
      to: order.customer_email,
      replyTo: REPLY_TO,
      subject: email.subject,
      html: email.html,
    });
    if (sent.error) throw new Error(sent.error.message);

    return res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
