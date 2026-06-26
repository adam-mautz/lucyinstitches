# Supabase

Database schema, RLS policies, RPC functions, and storage for Lucy in Stitches.

## Files

| File | Purpose |
| --- | --- |
| `migrations/20260625170000_init.sql` | Enums, tables, sequence, indexes, triggers |
| `migrations/20260625170100_rls_and_rpc.sql` | RLS policies, grants, public `SECURITY DEFINER` RPCs |
| `migrations/20260625170200_storage.sql` | Private `inspiration` bucket + storage policies |
| `seed.sql` | Current-month availability so the homepage has data |

## Security model

- **anon (public):** may only `SELECT` `monthly_capacity`. No direct access to
  orders/items/status. Public actions go through RPCs that expose only safe
  columns (`get_order_by_token`, `lookup_orders`, `create_order`).
- **authenticated (owner):** full access to everything.
- `internal_notes`, prices, time, email, and phone are never returned by the
  public RPCs.

## Applying it

### Option A — Supabase CLI (recommended for ongoing work)

```bash
# one-time
supabase login                 # opens browser
supabase link --project-ref ttfttxafqeoihcfizuxe   # asks for DB password

# apply schema + RLS + storage
supabase db push

# load seed data
supabase db execute --file supabase/seed.sql
# (or: psql "$DATABASE_URL" -f supabase/seed.sql)

# regenerate TypeScript types after schema changes
supabase gen types typescript --linked > src/types/database.ts
```

### Option B — Dashboard SQL Editor (no install)

Open the SQL Editor in the Supabase dashboard and run, in order:
1. `migrations/20260625170000_init.sql`
2. `migrations/20260625170100_rls_and_rpc.sql`
3. `migrations/20260625170200_storage.sql`
4. `seed.sql`

## Verifying RLS (do this before launch)

- As **anon**: can read `monthly_capacity`; cannot select `orders`.
- `create_order(...)` succeeds as anon and returns an order # + token.
- `get_order_by_token(token)` returns the order **without** `internal_notes`.
