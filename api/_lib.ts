// Shared server-side helpers for the email functions. Underscore-prefixed
// so Vercel does not expose it as a route. NEVER imported by client code —
// it uses the service key and Resend key.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export const OWNER_EMAIL = process.env.OWNER_EMAIL ?? '';
export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
export const APP_URL = process.env.APP_URL ?? 'http://localhost:5173';
// Where replies should land. Defaults to the owner address. Set this to a
// receiving address (e.g. orders@lucyinstitches.com once forwarding is set up).
export const REPLY_TO = process.env.REPLY_TO_EMAIL || OWNER_EMAIL;

// Admin Supabase client (bypasses RLS) — server-only.
export function supabaseAdmin() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  }
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

export function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Missing RESEND_API_KEY');
  return new Resend(key);
}

const PRODUCT_LABELS: Record<string, string> = {
  shirt: 'Shirt',
  hat: 'Hat',
  jacket: 'Jacket',
  sweatshirt: 'Sweatshirt',
  tank: 'Tank',
  custom: 'Custom',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
};

// Friendly, customer-facing line per status.
const STATUS_MESSAGE: Record<string, string> = {
  pending: 'We’ve received your order and will review it shortly.',
  confirmed: 'Your order is confirmed and on the schedule!',
  in_progress: 'Good news — your piece is now being stitched.',
  completed: 'Your piece is finished and looking lovely.',
  shipped: 'Your order is on its way to you!',
  cancelled: 'Your order has been cancelled. Reply if you have questions.',
};

export interface OrderEmailData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  product_type: string;
  embroidery_request: string;
  status: string;
  unique_tracking_token: string;
}

function shell(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#F5F0E8;padding:24px;font-family:Georgia,serif;color:#2C2C2C">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;box-shadow:0 4px 20px -4px rgba(107,127,163,.25)">
    <h1 style="font-size:22px;margin:0 0 4px;color:#54678A;font-style:italic">Lucy in Stitches</h1>
    <h2 style="font-size:18px;margin:16px 0 8px">${title}</h2>
    ${bodyHtml}
    <p style="font-size:12px;color:#6B7FA3;margin-top:24px">Handmade with care · Lucy in Stitches</p>
  </div></body></html>`;
}

// Email to the OWNER when a new order arrives.
export function newOrderEmail(o: OrderEmailData) {
  const product = PRODUCT_LABELS[o.product_type] ?? o.product_type;
  return {
    subject: `New order ${o.order_number} — ${product}`,
    html: shell(
      `New order: ${o.order_number}`,
      `<p style="font-size:15px;line-height:1.5">
        <strong>${o.customer_name}</strong> just placed an order for a
        <strong>${product}</strong>.</p>
       <p style="font-size:15px;line-height:1.5;background:#F5F0E8;border-radius:10px;padding:12px">
        “${o.embroidery_request}”</p>
       <p style="font-size:14px">Contact: ${o.customer_email}</p>
       <a href="${APP_URL}/admin/orders" style="display:inline-block;margin-top:8px;background:#6B7FA3;color:#F5F0E8;text-decoration:none;padding:10px 18px;border-radius:10px;font-family:Arial,sans-serif;font-size:14px">Open dashboard</a>`
    ),
  };
}

// Email to the CUSTOMER when their order status changes.
export function statusChangeEmail(o: OrderEmailData) {
  const product = PRODUCT_LABELS[o.product_type] ?? o.product_type;
  const statusLabel = STATUS_LABELS[o.status] ?? o.status;
  const message = STATUS_MESSAGE[o.status] ?? '';
  const trackUrl = `${APP_URL}/track/${o.unique_tracking_token}`;
  return {
    subject: `Your order ${o.order_number} is now ${statusLabel}`,
    html: shell(
      `Order ${o.order_number}: ${statusLabel}`,
      `<p style="font-size:15px;line-height:1.5">Hi ${o.customer_name},</p>
       <p style="font-size:15px;line-height:1.5">${message}</p>
       <p style="font-size:14px;color:#6B7FA3">${product} · ${o.order_number}</p>
       <a href="${trackUrl}" style="display:inline-block;margin-top:8px;background:#6B7FA3;color:#F5F0E8;text-decoration:none;padding:10px 18px;border-radius:10px;font-family:Arial,sans-serif;font-size:14px">View your order</a>`
    ),
  };
}
