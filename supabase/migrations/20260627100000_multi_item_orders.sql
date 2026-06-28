-- Multi-item orders: an order becomes a container; order_items hold the
-- per-item product details. Capacity is counted per item.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Schema: order_items carry the product details; order-level product
--    fields become legacy/nullable.
-- ─────────────────────────────────────────────────────────────────────────
alter table order_items
  add column product_type           product_type,
  add column embroidery_request     text,
  add column item_notes             text,
  add column inspiration_image_path text;

alter table orders alter column product_type drop not null;
alter table orders alter column embroidery_request drop not null;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Drop the old order-level capacity triggers BEFORE backfilling items
--    (so the backfill doesn't double-count).
-- ─────────────────────────────────────────────────────────────────────────
drop trigger if exists orders_sync_capacity_insert on orders;
drop trigger if exists orders_sync_capacity_update on orders;
drop trigger if exists orders_sync_capacity_delete on orders;
drop function if exists sync_capacity_usage();

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Backfill: every existing (single-item) order becomes one line item.
-- ─────────────────────────────────────────────────────────────────────────
-- Existing order_items rows (admin tags) get the parent's product details.
update order_items oi
set product_type           = o.product_type,
    embroidery_request     = coalesce(oi.embroidery_request, o.embroidery_request),
    item_notes             = coalesce(oi.item_notes, o.notes),
    inspiration_image_path = coalesce(oi.inspiration_image_path, o.inspiration_image_path)
from orders o
where oi.order_id = o.id and oi.product_type is null;

-- Orders with no items at all get one created from their order-level fields.
insert into order_items (
  order_id, product_type, embroidery_request, item_notes,
  inspiration_image_path, label, is_complete
)
select o.id, o.product_type, o.embroidery_request, o.notes,
       o.inspiration_image_path, 'Item 1', false
from orders o
where not exists (select 1 from order_items oi where oi.order_id = o.id);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. New capacity model — counted per non-cancelled item.
-- ─────────────────────────────────────────────────────────────────────────
-- Item inserted (e.g. via create_order): bump its product's slot.
create or replace function capacity_on_item_insert() returns trigger
language plpgsql as $$
declare m date; s order_status;
begin
  if new.product_type is null then return new; end if;
  select month, status into m, s from orders where id = new.order_id;
  if s is distinct from 'cancelled' then
    update monthly_capacity set used_slots = used_slots + 1
      where month = m and product_type = new.product_type;
  end if;
  return new;
end; $$;

create trigger order_items_capacity_insert
  after insert on order_items
  for each row execute function capacity_on_item_insert();

-- Order cancelled / un-cancelled: free or reclaim all its items' slots.
create or replace function capacity_on_order_status() returns trigger
language plpgsql as $$
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    update monthly_capacity mc set used_slots = greatest(mc.used_slots - sub.qty, 0)
    from (
      select product_type as pt, count(*) as qty from order_items
      where order_id = new.id and product_type is not null group by product_type
    ) sub
    where mc.month = new.month and mc.product_type = sub.pt;
  elsif old.status = 'cancelled' and new.status is distinct from 'cancelled' then
    update monthly_capacity mc set used_slots = mc.used_slots + sub.qty
    from (
      select product_type as pt, count(*) as qty from order_items
      where order_id = new.id and product_type is not null group by product_type
    ) sub
    where mc.month = new.month and mc.product_type = sub.pt;
  end if;
  return new;
end; $$;

create trigger orders_capacity_status
  after update on orders
  for each row execute function capacity_on_order_status();

-- Order deleted (no UI for this; admin/DB only): free its items' slots.
create or replace function capacity_on_order_delete() returns trigger
language plpgsql as $$
begin
  if old.status is distinct from 'cancelled' then
    update monthly_capacity mc set used_slots = greatest(mc.used_slots - sub.qty, 0)
    from (
      select product_type as pt, count(*) as qty from order_items
      where order_id = old.id and product_type is not null group by product_type
    ) sub
    where mc.month = old.month and mc.product_type = sub.pt;
  end if;
  return old;
end; $$;

create trigger orders_capacity_delete
  before delete on orders
  for each row execute function capacity_on_order_delete();

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Recompute used_slots authoritatively under the new model.
-- ─────────────────────────────────────────────────────────────────────────
update monthly_capacity mc
set used_slots = coalesce((
  select count(*) from order_items oi
  join orders o on o.id = oi.order_id
  where o.month = mc.month
    and oi.product_type = mc.product_type
    and o.status <> 'cancelled'
), 0);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. Multi-item create_order. Takes the whole cart as JSON.
-- ─────────────────────────────────────────────────────────────────────────
drop function if exists create_order(
  product_type, text, text, text, text, date, text, text
);

create or replace function create_order(
  p_customer_name  text,
  p_customer_email text,
  p_customer_phone text,
  p_month          date,
  p_items          jsonb   -- [{productType, embroideryRequest, notes?, inspirationImagePath?}]
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order   orders;
  v_item    jsonb;
  v_pt      product_type;
  v_total   int;
  v_used    int;
  v_quote   numeric(10,2) := 0;
  v_label_n int := 0;
  v_need    record;
begin
  if coalesce(trim(p_customer_name), '') = ''
     or coalesce(trim(p_customer_email), '') = ''
     or coalesce(trim(p_customer_phone), '') = '' then
    raise exception 'Missing required contact fields';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty';
  end if;

  -- Validate every item.
  for v_item in select value from jsonb_array_elements(p_items) loop
    if (v_item->>'productType') is null
       or coalesce(trim(v_item->>'embroideryRequest'), '') = '' then
      raise exception 'Each item needs a product and an embroidery request';
    end if;
  end loop;

  -- Capacity check per product type, locking rows to prevent overbooking.
  for v_need in
    select (value->>'productType')::product_type as pt, count(*)::int as qty
    from jsonb_array_elements(p_items)
    group by (value->>'productType')::product_type
  loop
    select total_slots, used_slots into v_total, v_used
      from monthly_capacity
      where month = p_month and product_type = v_need.pt
      for update;
    if not found then
      raise exception 'Orders for one of your items are not open this month';
    end if;
    if v_used + v_need.qty > v_total then
      raise exception 'Not enough availability for one of your items this month';
    end if;
  end loop;

  -- Create the order container.
  insert into orders (customer_name, customer_email, customer_phone, month, status)
  values (
    trim(p_customer_name), trim(p_customer_email), trim(p_customer_phone),
    p_month, 'pending'
  )
  returning * into v_order;

  -- Insert items (capacity bumps via trigger); sum the quote from list prices.
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_label_n := v_label_n + 1;
    v_pt := (v_item->>'productType')::product_type;
    insert into order_items (
      order_id, product_type, embroidery_request, item_notes,
      inspiration_image_path, label, is_complete
    ) values (
      v_order.id, v_pt, trim(v_item->>'embroideryRequest'),
      nullif(trim(coalesce(v_item->>'notes', '')), ''),
      nullif(v_item->>'inspirationImagePath', ''),
      'Item ' || v_label_n, false
    );
    v_quote := v_quote + case v_pt
      when 'shirt' then 35 when 'hat' then 28 when 'jacket' then 75
      when 'sweatshirt' then 48 when 'tank' then 30 else 0 end;
  end loop;

  update orders set quoted_price = nullif(v_quote, 0) where id = v_order.id;

  return json_build_object(
    'orderNumber', v_order.order_number,
    'uniqueTrackingToken', v_order.unique_tracking_token
  );
end;
$$;

grant execute on function create_order(text, text, text, date, jsonb)
  to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 7. Public read RPCs reflect items.
-- ─────────────────────────────────────────────────────────────────────────
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
    'status', o.status,
    'uniqueTrackingToken', o.unique_tracking_token,
    'createdAt', o.created_at,
    'items', coalesce((
      select json_agg(json_build_object(
        'id', i.id,
        'productType', i.product_type,
        'embroideryRequest', i.embroidery_request,
        'notes', i.item_notes,
        'label', i.label,
        'isComplete', i.is_complete
      ) order by i.created_at)
      from order_items i where i.order_id = o.id
    ), '[]'::json),
    'statusHistory', coalesce((
      select json_agg(json_build_object(
        'id', s.id, 'status', s.status, 'note', s.note, 'createdAt', s.created_at
      ) order by s.created_at)
      from status_events s where s.order_id = o.id
    ), '[]'::json)
  )
  from orders o
  where o.unique_tracking_token = p_token;
$$;

create or replace function lookup_orders(p_query text)
returns json
language sql
security definer
set search_path = public
as $$
  select coalesce(json_agg(json_build_object(
    'orderNumber', o.order_number,
    'customerName', o.customer_name,
    'status', o.status,
    'uniqueTrackingToken', o.unique_tracking_token,
    'itemCount', (select count(*) from order_items i where i.order_id = o.id)
  )), '[]'::json)
  from orders o
  where lower(o.order_number) = lower(trim(p_query))
     or (
       length(regexp_replace(p_query, '\D', '', 'g')) >= 7
       and regexp_replace(o.customer_phone, '\D', '', 'g')
           = regexp_replace(p_query, '\D', '', 'g')
     );
$$;
