# MyShopLink

This project now runs as a Next.js app using the App Router.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- SQLite via `better-sqlite3` for local/dev fallback
- Supabase Postgres + Storage for Vercel deployment
- Cookie-based auth with server-rendered protected routes

## Run locally

Prerequisites: Node.js 20+

1. Install dependencies with `npm install`
2. Start the app with `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Deploy on Supabase + Vercel

1. Create a Supabase project.
2. Run [supabase/schema.sql](/Users/mohit/SAAS_Project/micro-store-builder-nextjs/supabase/schema.sql) in the Supabase SQL editor.
3. Create the env vars from [.env.example](/Users/mohit/SAAS_Project/micro-store-builder-nextjs/.env.example) in Vercel:
   - `SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `APP_URL`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy the app to Vercel.
5. Add your custom domain in Vercel and point DNS there.

When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, the app switches to Supabase-backed persistence automatically. Without them, it keeps using the local SQLite + filesystem setup.

## Stripe Connect checkout

ShopLink can now let each merchant connect their own Stripe account and accept payments directly on their checkout page.

Required env vars:

- `STRIPE_SECRET_KEY`
- `STRIPE_CONNECT_CLIENT_ID`
- `STRIPE_CONNECT_WEBHOOK_SECRET`
- `STRIPE_CONNECT_APPLICATION_FEE_BPS` optional, defaults to `0`
- `STRIPE_CONNECT_COUNTRY` optional, defaults to `IN`

Webhook endpoint:

- `/api/payments/stripe/webhook`

OAuth callback:

- `/api/payments/stripe/callback`

Recommended live schema updates for older Supabase projects:

```sql
alter table public.orders add column if not exists payment_provider text;
alter table public.orders add column if not exists payment_status text;
alter table public.orders add column if not exists payment_reference text;
alter table public.stores add column if not exists payment_json jsonb;
alter table public.products add column if not exists collections_json jsonb;
alter table public.products add column if not exists variants_json jsonb;
```

## Available scripts

- `npm run dev` starts the Next.js dev server
- `npm run build` creates a production build
- `npm run start` runs the production server
- `npm run lint` runs TypeScript checks
- `npm run test:smoke` builds the app and runs an end-to-end smoke test against the production server

## Routes

- `/` landing page
- `/signup` signup/login flow
- `/dashboard` merchant dashboard
- `/products` product management
- `/settings` store and account settings
- `/[storeId]` public storefront
- `/[storeId]/product/[productId]` public product detail
- `/api/health` health check
- `/api/auth/*` auth and session APIs
- `/api/dashboard`, `/api/orders`, `/api/analytics/track` merchant dashboard data APIs

## Demo merchant

The seeded demo merchant can log in with:

- `john@example.com`
- `password123`
