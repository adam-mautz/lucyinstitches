-- Seed availability for the CURRENT month so the homepage shows slots.
-- used_slots starts at 0 and is maintained by triggers as orders come in.
-- Safe to re-run (idempotent on month + product_type).

insert into monthly_capacity (month, product_type, total_slots, used_slots)
select date_trunc('month', now())::date, pt, slots, 0
from (values
  ('shirt'::product_type, 10),
  ('hat', 8),
  ('jacket', 4),
  ('sweatshirt', 6),
  ('tank', 6),
  ('custom', 3)
) as v(pt, slots)
on conflict (month, product_type) do nothing;
