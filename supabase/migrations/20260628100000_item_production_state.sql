-- Per-item internal production state (replaces the is_complete boolean).
-- Stored as free text governed by an app-defined ordered list, so the
-- pipeline can evolve without enum migrations. NOT exposed to customers.

alter table order_items
  add column production_state text not null default 'not_started';

-- Migrate existing completion flags: done -> terminal state.
update order_items
set production_state = case when is_complete then 'shipped' else 'not_started' end;

-- Recreate the public RPC WITHOUT is_complete (states are internal) before
-- dropping the column it referenced.
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
        'notes', i.item_notes
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

alter table order_items drop column is_complete;
