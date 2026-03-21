-- ============================================================
-- Run this in Supabase dashboard → SQL Editor
-- Safe to run on existing databases (uses IF NOT EXISTS / IF NOT EXISTS)
-- ============================================================

-- 1. Categories
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz default now()
);

-- 2. Products (fresh install includes all columns)
create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  price            integer not null,
  compare_at_price integer,
  description      text    not null default '',
  image_url        text    not null default '',
  images           text[]           default '{}',
  category         text             default '',
  category_id      uuid references categories(id) on delete set null,
  stock            integer not null default 0,
  created_at       timestamptz default now()
);

-- Upgrade existing products table (no-op if columns already exist)
alter table products add column if not exists compare_at_price integer;
alter table products add column if not exists images text[] default '{}';
alter table products add column if not exists category_id uuid references categories(id) on delete set null;
alter table products add column if not exists stock integer not null default 0;

-- 3. Store settings (single-row config)
create table if not exists store_settings (
  id              uuid primary key default gen_random_uuid(),
  store_name      text default 'MYSTORE',
  logo_url        text default '',
  hero_image_url  text default '',
  hero_title      text default 'New Season Arrivals',
  hero_subtitle   text default 'Discover curated pieces for the modern wardrobe.',
  base_currency   text default 'USD',
  updated_at      timestamptz default now()
);
-- Seed default row
insert into store_settings (id) values ('00000000-0000-0000-0000-000000000001') on conflict do nothing;

-- 4. Orders (basic)
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  stripe_session_id text,
  total_amount      integer,
  currency          text default 'usd',
  status            text default 'paid',
  created_at        timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table products      enable row level security;
alter table categories    enable row level security;
alter table store_settings enable row level security;
alter table orders        enable row level security;

-- Public reads
create policy if not exists "Public read products"       on products       for select to anon, authenticated using (true);
create policy if not exists "Public read categories"     on categories     for select to anon, authenticated using (true);
create policy if not exists "Public read store_settings" on store_settings for select to anon, authenticated using (true);

-- ============================================================
-- Storage: create "product-images" bucket in the dashboard
-- (Storage → New bucket → "product-images", Public = ON)
-- Then run:
-- ============================================================
create policy if not exists "Public read product images"
  on storage.objects for select to anon
  using (bucket_id = 'product-images');
