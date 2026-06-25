# Serverless functions (Vercel)

Server-side only. These functions hold the **secrets that must never reach
the client bundle**:

- `SUPABASE_SERVICE_KEY` — privileged Supabase access (bypasses RLS)
- `RESEND_API_KEY` — transactional email

Planned endpoints (added in later phases):

- `POST /api/orders` — create an order, decrement capacity, notify owner
- `POST /api/notify` — send Resend status-change emails to customers
- `GET /api/signed-url` — mint signed URLs for private inspiration images

Each file in this directory becomes an endpoint at `/api/<filename>`.
Configure the env vars in the Vercel dashboard (and `.env.local` for
local dev with `vercel dev`).
