-- ============================================================
-- Page Builder Tables
-- Run this in Supabase dashboard → SQL Editor
-- ============================================================

-- Marquee items
create table if not exists marquee_items (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  order_index integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

insert into marquee_items (text, order_index) values
  ('FREE SHIPPING ON ORDERS OVER $100', 0),
  ('NEW ARRIVALS EVERY WEEK', 1),
  ('EXCLUSIVE MEMBER DROPS', 2),
  ('FREE RETURNS WITHIN 30 DAYS', 3),
  ('SUSTAINABLY MADE', 4),
  ('WORLDWIDE DELIVERY', 5)
on conflict do nothing;

-- Page sections (visibility/ordering)
create table if not exists page_sections (
  id          uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title       text not null,
  is_visible  boolean not null default true,
  order_index integer not null default 0
);

insert into page_sections (section_key, title, order_index) values
  ('hero',          'Hero Banner',        0),
  ('marquee',       'Announcement Bar',   1),
  ('categories',    'Featured Categories',2),
  ('new_arrivals',  'New Arrivals',        3),
  ('editorial',     'Editorial Banner',   4),
  ('newsletter',    'Newsletter Signup',  5)
on conflict (section_key) do nothing;

-- Navigation links
create table if not exists nav_links (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  href        text not null,
  order_index integer not null default 0,
  is_active   boolean not null default true,
  target      text default '_self'
);

insert into nav_links (label, href, order_index) values
  ('New Arrivals', '/', 0),
  ('About', '/about', 1)
on conflict do nothing;

-- Footer config (single-row)
create table if not exists footer_config (
  id                  uuid primary key default gen_random_uuid(),
  copyright_text      text default '',
  social_instagram    text default 'https://instagram.com',
  social_tiktok       text default 'https://tiktok.com',
  social_pinterest    text default 'https://pinterest.com',
  info_links          jsonb default '[{"label":"About Us","href":"/about"},{"label":"Sustainability","href":"/about"},{"label":"Careers","href":"/about"},{"label":"Press","href":"/about"}]',
  support_links       jsonb default '[{"label":"FAQ","href":"/faq"},{"label":"Shipping & Returns","href":"/shipping"},{"label":"Contact Us","href":"/contact"}]',
  updated_at          timestamptz default now()
);

insert into footer_config (id) values ('00000000-0000-0000-0000-000000000002') on conflict do nothing;

-- Banners
create table if not exists banners (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  subtitle    text default '',
  image_url   text default '',
  link_url    text default '/',
  is_active   boolean not null default true,
  order_index integer not null default 0,
  created_at  timestamptz default now()
);

-- RLS
alter table marquee_items  enable row level security;
alter table page_sections  enable row level security;
alter table nav_links      enable row level security;
alter table footer_config  enable row level security;
alter table banners        enable row level security;

create policy if not exists "Public read marquee_items"  on marquee_items  for select to anon, authenticated using (true);
create policy if not exists "Public read page_sections"  on page_sections  for select to anon, authenticated using (true);
create policy if not exists "Public read nav_links"      on nav_links      for select to anon, authenticated using (true);
create policy if not exists "Public read footer_config"  on footer_config  for select to anon, authenticated using (true);
create policy if not exists "Public read banners"        on banners        for select to anon, authenticated using (true);
