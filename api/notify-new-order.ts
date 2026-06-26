import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  supabaseAdmin,
  resend,
  newOrderEmail,
  EMAIL_FROM,
  OWNER_EMAIL,
  type OrderEmailData,
} from './_lib.js';

// POST { token } — emails the OWNER about a newly placed order.
// Public-callable (the order form is anon), but it only ever sends to the
// fixed OWNER_EMAIL and looks the order up server-side, so content can't be
// spoofed.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = (req.body?.token ?? '') as string;
    if (!token) return res.status(400).json({ error: 'Missing token' });
    if (!OWNER_EMAIL) return res.status(500).json({ error: 'OWNER_EMAIL not set' });

    const { data, error } = await supabaseAdmin()
      .from('orders')
      .select(
        'order_number, customer_name, customer_email, product_type, embroidery_request, status, unique_tracking_token'
      )
      .eq('unique_tracking_token', token)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });

    const email = newOrderEmail(data as OrderEmailData);
    const sent = await resend().emails.send({
      from: EMAIL_FROM,
      to: OWNER_EMAIL,
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
