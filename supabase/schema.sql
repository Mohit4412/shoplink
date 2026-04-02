create extension if not exists "pgcrypto";

create table if not exists public.users (
  id text primary key,
  email text not null unique,
  username text not null unique,
  password_hash text not null,
  first_name text,
  last_name text,
  bio text,
  whatsapp_number text not null,
  avatar_url text,
  plan text not null,
  subscription_renewal_date text not null default '',
  razorpay_subscription_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.stores (
  username text primary key references public.users(username) on update cascade on delete cascade,
  user_id text not null unique references public.users(id) on update cascade on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  user_bio text,
  whatsapp_number text not null,
  avatar_url text,
  plan text not null,
  subscription_renewal_date text not null default '',
  logo_url text,
  store_name text not null,
  tagline text not null,
  store_bio text,
  currency text not null,
  theme text,
  sections_json jsonb,
  trust_badges_json jsonb,
  banners_json jsonb,
  legal_json jsonb,
  payment_json jsonb,
  custom_domain text,
  custom_domain_status text
);

create table if not exists public.products (
  store_username text not null references public.stores(username) on update cascade on delete cascade,
  product_id text not null,
  image_url text not null,
  images_json jsonb,
  name text not null,
  price numeric not null,
  description text not null,
  status text not null,
  created_at timestamptz not null,
  category text not null,
  stock integer not null,
  collection_name text,
  collections_json jsonb,
  highlights_json jsonb,
  variants_json jsonb,
  reviews_json jsonb,
  is_demo boolean not null default false,
  primary key (store_username, product_id)
);

create index if not exists products_store_username_created_at_idx on public.products (store_username, created_at desc);

create table if not exists public.sessions (
  token text primary key,
  user_id text not null references public.users(id) on update cascade on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists sessions_expires_at_idx on public.sessions (expires_at);

create table if not exists public.orders (
  id text primary key,
  store_username text not null references public.stores(username) on update cascade on delete cascade,
  product_id text not null,
  quantity integer not null,
  revenue numeric not null,
  date timestamptz not null,
  notes text,
  status text not null,
  payment_provider text,
  payment_status text,
  payment_reference text
);

create index if not exists orders_store_username_date_idx on public.orders (store_username, date desc);

create table if not exists public.analytics_daily (
  store_username text not null references public.stores(username) on update cascade on delete cascade,
  metric_date date not null,
  views integer not null default 0,
  clicks integer not null default 0,
  primary key (store_username, metric_date)
);

create table if not exists public.analytics_events (
  id text primary key,
  store_username text not null references public.stores(username) on update cascade on delete cascade,
  event_type text not null,
  metric_date date not null,
  source text,
  referrer_host text,
  country_code text,
  page_path text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_store_username_created_at_idx on public.analytics_events (store_username, created_at desc);

insert into storage.buckets (id, name, public)
values ('myshoplink-assets', 'myshoplink-assets', true)
on conflict (id) do nothing;
