-- ============================================================
-- Settings V2 — add hero button + marquee color columns
-- Run this in Supabase dashboard → SQL Editor
-- ============================================================

alter table store_settings add column if not exists hero_button_text  text default 'Shop Now';
alter table store_settings add column if not exists hero_button_link  text default '/#products';
alter table store_settings add column if not exists marquee_bg_color  text default '#111111';
alter table store_settings add column if not exists marquee_text_color text default '#ffffff';
