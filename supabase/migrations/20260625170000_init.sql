-- Lucy in Stitches — Phase 2 schema
-- Tables, enums, sequence, indexes, and triggers. No RLS here (see 0002).

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ─────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────
create type product_type as enum (
  'shirt', 'hat', 'jacket', 'sweatshirt', 'tank', 'custom'
);

create type order_status as enum (
  'pending', 'confirmed', 'in_progress', 'completed', 'shipped', 'cancelled'
);

-- ─────────────────────────────────────────────────────────────────────────
-- monthly_capacity
-- used_slots is a real column, kept in sync by a trigger on orders so the
-- public can read availability without ever touching the orders table.
-- ─────────────────────────────────────────────────────────────────────────
create table monthly_capacity (
  id            uuid primary key default gen_random_uuid(),
  month         date not null,
  product_type  product_type not null,
  total_slots   int not null default 0 check (total_slots >= 0),
  used_slots    int not null default 0 check (used_slots >= 0),
  closed_message text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (month, product_type)
);

-- ─────────────────────────────────────────────────────────────────────────
-- orders
-- ─────────────────────────────────────────────────────────────────────────
create sequence order_number_seq start 1;

create table orders (
  id                     uuid primary key default gen_random_uuid(),
  order_number           text not null unique,
  customer_name          text not null,
  customer_email         text not null,
  customer_phone         text not null,
  product_type           product_type not null,
  embroidery_request     text not null,
  notes                  text,                 -- customer-supplied
  inspiration_image_path text,                 -- storage path (private bucket)
  status                 order_status not null default 'pending',
  internal_notes         text,                 -- ADMIN ONLY — never exposed to public
  quoted_price           numeric(10,2),
  final_price            numeric(10,2),
  time_spent_minutes     int,
  month                  date not null,        -- capacity month it counts against
  unique_tracking_token  uuid not null default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index orders_month_idx on orders (month);
create index orders_status_idx on orders (status);
create index orders_token_idx on orders (unique_tracking_token);

-- ─────────────────────────────────────────────────────────────────────────
-- order_items
-- ─────────────────────────────────────────────────────────────────────────
create table order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  label       text not null,
  description text,
  is_complete boolean not null default false,
  created_at  timestamptz not null default now()
);

create index order_items_order_idx on order_items (order_id);

-- ─────────────────────────────────────────────────────────────────────────
-- status_events
-- ─────────────────────────────────────────────────────────────────────────
create table status_events (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  status     order_status not null,
  note       text,
  created_at timestamptz not null default now()
);

create index status_events_order_idx on status_events (order_id);

-- ═════════════════════════════════════════════════════════════════════════
-- Triggers
-- ═════════════════════════════════════════════════════════════════════════

-- updated_at maintenance
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

create trigger capacity_set_updated_at
  before update on monthly_capacity
  for each row execute function set_updated_at();

-- Human-readable order number (LIS-0001) assigned on insert if absent.
create or replace function set_order_number() returns trigger
language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'LIS-' || lpad(nextval('order_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger orders_set_order_number
  before insert on orders
  for each row execute function set_order_number();

-- Status history: log the initial status on insert, and any change on update.
create or replace function log_status_event() returns trigger
language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    insert into status_events (order_id, status) values (new.id, new.status);
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into status_events (order_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$;

create trigger orders_log_status_insert
  after insert on orders
  for each row execute function log_status_event();

create trigger orders_log_status_update
  after update on orders
  for each row execute function log_status_event();

-- Keep monthly_capacity.used_slots in sync. A 'cancelled' order frees its
-- slot. Handles status flips and (rare) month/product changes.
create or replace function sync_capacity_usage() returns trigger
language plpgsql as $$
declare
  old_counts boolean;
  new_counts boolean;
begin
  if (tg_op = 'INSERT') then
    if new.status <> 'cancelled' then
      update monthly_capacity set used_slots = used_slots + 1
        where month = new.month and product_type = new.product_type;
    end if;
    return new;

  elsif (tg_op = 'DELETE') then
    if old.status <> 'cancelled' then
      update monthly_capacity set used_slots = greatest(used_slots - 1, 0)
        where month = old.month and product_type = old.product_type;
    end if;
    return old;

  elsif (tg_op = 'UPDATE') then
    old_counts := old.status <> 'cancelled';
    new_counts := new.status <> 'cancelled';

    if old_counts and (not new_counts
        or old.month <> new.month or old.product_type <> new.product_type) then
      update monthly_capacity set used_slots = greatest(used_slots - 1, 0)
        where month = old.month and product_type = old.product_type;
    end if;

    if new_counts and (not old_counts
        or old.month <> new.month or old.product_type <> new.product_type) then
      update monthly_capacity set used_slots = used_slots + 1
        where month = new.month and product_type = new.product_type;
    end if;
    return new;
  end if;
  return null;
end;
$$;

create trigger orders_sync_capacity_insert
  after insert on orders
  for each row execute function sync_capacity_usage();

create trigger orders_sync_capacity_update
  after update on orders
  for each row execute function sync_capacity_usage();

create trigger orders_sync_capacity_delete
  after delete on orders
  for each row execute function sync_capacity_usage();
