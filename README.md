# Lucy in Stitches

A warm, handmade-feeling web app for a custom embroidery business. Customers
check availability and place structured orders; the owner manages capacity and
tracks orders end-to-end from an admin dashboard.

## Tech stack

- **React + TypeScript** (Vite, strict mode)
- **Tailwind CSS** — custom brand palette
- **React Router** — public + protected admin routes
- **Zustand** — global UI state (admin session, order filters)
- **TanStack React Query** — server state
- **Supabase** — Postgres, Auth (admin only), Storage
- **Resend** — transactional email
- **Vercel** — hosting + serverless functions (`/api`)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run dev
```

App runs at http://localhost:5173.

## Scripts

| Command             | Description             |
| ------------------- | ----------------------- |
| `npm run dev`       | Start the dev server    |
| `npm run build`     | Typecheck + production build |
| `npm run preview`   | Preview the production build |
| `npm run lint`      | ESLint                  |
| `npm run format`    | Prettier write          |
| `npm run typecheck` | TypeScript, no emit     |

## Environment variables

See `.env.example`. Client-safe vars are prefixed `VITE_`. The
`SUPABASE_SERVICE_KEY` and `RESEND_API_KEY` are **server-side only** and must
never appear in the client bundle — they're used by the `/api` serverless
functions.

## Project structure

```
api/                 Vercel serverless functions (server-side secrets)
src/
  components/        Shared UI (Button, Card, StatusBadge, layouts)
  features/
    orders/          Order form, confirmation, status, lookup
    capacity/        Availability display, homepage, capacity manager
    admin/           Dashboard, order list, order detail, admin shell
    auth/            Admin login, protected route guard
  hooks/             Shared cross-feature hooks
  lib/               Supabase client, query client, utils
  store/             Zustand stores
  types/             Shared TypeScript domain types
  assets/            Brand assets
```

## Build phases

1. **Phase 1** — Customer + admin UI with mock data (current).
2. **Phase 2** — Supabase: tables, RLS, storage; wire order form + capacity.
3. **Phase 3** — Admin dashboard with real data.
4. **Phase 4** — Resend email notifications.
5. **Phase 5** — Public order lookup + tracking links.
6. **Phase 6** — CSV export, charts, polish.
