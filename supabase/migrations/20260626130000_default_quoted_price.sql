-- Default quoted_price to the product's listed starting price at creation,
-- so the owner doesn't have to remember the quote. 'custom' stays NULL
-- (quote-on-request). Keeps the same signature/grants as before.

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
  v_quote numeric(10,2);
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

  -- Starting quote = product's listed price (kept in sync with products.ts).
  v_quote := case p_product_type
    when 'shirt' then 35
    when 'hat' then 28
    when 'jacket' then 75
    when 'sweatshirt' then 48
    when 'tank' then 30
    else null
  end;

  insert into orders (
    customer_name, customer_email, customer_phone, product_type,
    embroidery_request, notes, inspiration_image_path, month, status,
    quoted_price
  ) values (
    trim(p_customer_name), trim(p_customer_email), trim(p_customer_phone),
    p_product_type, trim(p_embroidery_request), nullif(trim(p_notes), ''),
    p_inspiration_image_path, p_month, 'pending', v_quote
  ) returning * into v_order;

  return json_build_object(
    'orderNumber', v_order.order_number,
    'uniqueTrackingToken', v_order.unique_tracking_token
  );
end;
$$;
