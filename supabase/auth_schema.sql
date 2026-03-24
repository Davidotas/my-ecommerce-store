-- ============================================================
-- Auth & Orders schema — run in Supabase dashboard → SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ============================================================

-- 1. Profiles table (mirrors auth.users 1-to-1)
create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text,
  phone          text,
  address_line1  text,
  address_line2  text,
  city           text,
  state          text,
  postal_code    text,
  country        text default 'GB',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Trigger: auto-create profile row when a new user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. Upgrade orders table with auth + customer fields
alter table orders add column if not exists user_id              uuid references auth.users(id) on delete set null;
alter table orders add column if not exists customer_name        text;
alter table orders add column if not exists customer_email       text;
alter table orders add column if not exists items                jsonb default '[]';
alter table orders add column if not exists shipping_address     jsonb;
alter table orders add column if not exists stripe_payment_intent_id text;
alter table orders add column if not exists updated_at           timestamptz default now();

-- Set default status to 'pending' (was 'paid' in old schema)
alter table orders alter column status set default 'pending';

-- Index for fast user order lookups
create index if not exists orders_user_id_idx on orders(user_id);

-- 3. Carts table (persist cart across sessions)
create table if not exists carts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  items      jsonb not null default '[]',
  updated_at timestamptz default now()
);
create unique index if not exists carts_user_id_idx on carts(user_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table carts     enable row level security;

-- Profiles: users can only read/write their own row
create policy if not exists "Users read own profile"
  on profiles for select to authenticated
  using (auth.uid() = id);

create policy if not exists "Users update own profile"
  on profiles for update to authenticated
  using (auth.uid() = id);

create policy if not exists "Users insert own profile"
  on profiles for insert to authenticated
  with check (auth.uid() = id);

-- Orders: users can read their own orders
create policy if not exists "Users read own orders"
  on orders for select to authenticated
  using (auth.uid() = user_id);

-- Carts: users can read/write only their own cart
create policy if not exists "Users read own cart"
  on carts for select to authenticated
  using (auth.uid() = user_id);

create policy if not exists "Users upsert own cart"
  on carts for insert to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "Users update own cart"
  on carts for update to authenticated
  using (auth.uid() = user_id);

create policy if not exists "Users delete own cart"
  on carts for delete to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Notes:
-- • Run this AFTER the main schema.sql
-- • In Supabase dashboard → Authentication → Providers:
--     Enable Email and Google OAuth
-- • In Supabase dashboard → Authentication → URL Configuration:
--     Site URL: http://localhost:3000 (dev) or your production URL
--     Redirect URL: <your-url>/api/auth/callback
-- ============================================================
