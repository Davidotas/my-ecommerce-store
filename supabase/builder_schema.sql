-- ============================================================
-- Visual Page Builder Schema
-- Run AFTER schema.sql and auth_schema.sql
-- ============================================================

create table if not exists builder_pages (
  id              uuid primary key default gen_random_uuid(),
  title           text not null default 'Untitled Page',
  slug            text not null unique,
  seo_description text not null default '',
  status          text not null default 'draft',  -- 'draft' | 'published'
  sections        jsonb not null default '[]',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Seed default pages (safe to re-run)
insert into builder_pages (id, title, slug, status, sections) values
  ('00000000-0000-0000-0000-000000000010', 'Home',    'home',    'published', '[]'),
  ('00000000-0000-0000-0000-000000000011', 'About',   'about',   'draft',     '[]'),
  ('00000000-0000-0000-0000-000000000012', 'Contact', 'contact', 'draft',     '[]'),
  ('00000000-0000-0000-0000-000000000013', 'FAQ',     'faq',     'draft',     '[]')
on conflict (slug) do nothing;

create index if not exists builder_pages_slug_idx   on builder_pages(slug);
create index if not exists builder_pages_status_idx on builder_pages(status);

-- RLS
alter table builder_pages enable row level security;

create policy if not exists "Public read published pages"
  on builder_pages for select to anon, authenticated
  using (status = 'published');

-- ============================================================
-- Notes:
-- • Admin writes bypass RLS via service role key (createAdminClient)
-- • Pages are accessible at /p/[slug]
-- • The homepage (slug='home') is also checked in src/app/page.tsx
-- ============================================================
