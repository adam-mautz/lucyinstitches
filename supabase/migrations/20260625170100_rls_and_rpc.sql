-- Lucy in Stitches — Phase 2 RLS + public RPCs
--
-- Security model (approved):
--   • anon (public):  may ONLY read monthly_capacity. No direct access to
--     orders / order_items / status_events.
--   • authenticated (the owner): full read/write on everything.
--   • Public reads/writes go through SECURITY DEFINER functions that expose
--     only safe columns (never internal_notes, prices, other customers' data).

-- ─────────────────────────────────────────────────────────────────────────
-- Enable RLS on every table
-- ─────────────────────────────────────────────────────────────────────────
alter table monthly_capacity enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table status_events    enable row level security;

-- ─────────────────────────────────────────────────────────────────────────
-- Table privileges (RLS gates rows; GRANT gates the operation at all)
-- ─────────────────────────────────────────────────────────────────────────
grant select on monthly_capacity to anon, authenticated;
grant insert, update, delete on monthly_capacity to authenticated;

grant select, insert, update, delete on orders        to authenticated;
grant select, insert, update, delete on order_items   to authenticated;
grant select, insert, update, delete on status_events to authenticated;

-- Admin may create orders directly (the trigger reads the sequence as the
-- calling role on a direct insert).
grant usage on sequence order_number_seq to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Policies — monthly_capacity
-- ─────────────────────────────────────────────────────────────────────────
create policy "capacity: public read"
  on monthly_capacity for select
  to anon, authenticated
  using (true);

create policy "capacity: admin write"
  on monthly_capacity for all
  to authenticated
  using (true) with check (true);

-- ─────────────────────────────────────────────────────────────────────────
-- Policies — orders / order_items / status_events: admin-only direct access.
-- (Public access is exclusively via the SECURITY DEFINER functions below.)
-- ─────────────────────────────────────────────────────────────────────────
create policy "orders: admin all"
  on orders for all
  to authenticated
  using (true) with check (true);

create policy "order_items: admin all"
  on order_items for all
  to authenticated
  using (true) with check (true);

create policy "status_events: admin all"
  on status_events for all
  to authenticated
  using (true) with check (true);

-- ═════════════════════════════════════════════════════════════════════════
-- Public RPCs (SECURITY DEFINER) — run as owner, bypassing RLS, returning
-- only public-safe fields.
-- ═════════════════════════════════════════════════════════════════════════

-- One order by tracking token: request, items, and status history.
-- Deliberately EXCLUDES internal_notes, email, phone, prices, time.
create or replace function get_order_by_token(p_token uuid)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'id', o.id,
    'orderNumber', o.order_number,
    'customerName', o.customer_name,
    'productType', o.product_type,
    'embroideryRequest', o.embroidery_request,
    'notes', o.notes,
    'status', o.status,
    'uniqueTrackingToken', o.unique_tracking_token,
    'createdAt', o.created_at,
    'items', coalesce((
      select json_agg(json_build_object(
        'id', i.id, 'label', i.label,
        'description', i.description, 'isComplete', i.is_complete
      ) order by i.created_at)
      from order_items i where i.order_id = o.id
    ), '[]'::json),
    'statusHistory', coalesce((
      select json_agg(json_build_object(
        'id', s.id, 'status', s.status,
        'note', s.note, 'createdAt', s.created_at
      ) order by s.created_at)
      from status_events s where s.order_id = o.id
    ), '[]'::json)
  )
  from orders o
  where o.unique_tracking_token = p_token;
$$;

-- Lookup by exact order number OR matching phone (>= 7 digits). Returns a
-- minimal list including the tracking token so the UI can link to status.
create or replace function lookup_orders(p_query text)
returns json
language sql
security definer
set search_path = public
as $$
  select coalesce(json_agg(json_build_object(
    'orderNumber', o.order_number,
    'productType', o.product_type,
    'customerName', o.customer_name,
    'status', o.status,
    'uniqueTrackingToken', o.unique_tracking_token
  )), '[]'::json)
  from orders o
  where lower(o.order_number) = lower(trim(p_query))
     or (
       length(regexp_replace(p_query, '\D', '', 'g')) >= 7
       and regexp_replace(o.customer_phone, '\D', '', 'g')
           = regexp_replace(p_query, '\D', '', 'g')
     );
$$;

-- Create an order from the public form. Forces status='pending' and never
-- accepts price/status/internal fields, so the client cannot tamper. Locks
-- the capacity row to prevent overbooking under concurrency.
create or replace function create_order(
  p_product_type           product_type,
  p_customer_name          text,
  p_customer_email         text,
  p_customer_phone         text,
  p_embroidery_request     text,
  p_month                  date,
  p_notes                  text default null,
  p_inspiration_image_path text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cap   monthly_capacity;
  v_order orders;
begin
  if coalesce(trim(p_customer_name), '')  = ''
     or coalesce(trim(p_customer_email), '') = ''
     or coalesce(trim(p_customer_phone), '') = ''
     or coalesce(trim(p_embroidery_request), '') = '' then
    raise exception 'Missing required order fields';
  end if;

  select * into v_cap from monthly_capacity
   where month = p_month and product_type = p_product_type
   for update;

  if not found then
    raise exception 'Orders for this item are not open this month';
  end if;
  if v_cap.used_slots >= v_cap.total_slots then
    raise exception 'Sorry — this item is fully booked this month';
  end if;

  insert into orders (
    customer_name, customer_email, customer_phone, product_type,
    embroidery_request, notes, inspiration_image_path, month, status
  ) values (
    trim(p_customer_name), trim(p_customer_email), trim(p_customer_phone),
    p_product_type, trim(p_embroidery_request), nullif(trim(p_notes), ''),
    p_inspiration_image_path, p_month, 'pending'
  ) returning * into v_order;

  return json_build_object(
    'orderNumber', v_order.order_number,
    'uniqueTrackingToken', v_order.unique_tracking_token
  );
end;
$$;

-- Expose the RPCs to the public + owner.
grant execute on function get_order_by_token(uuid) to anon, authenticated;
grant execute on function lookup_orders(text)       to anon, authenticated;
grant execute on function create_order(
  product_type, text, text, text, text, date, text, text
) to anon, authenticated;
