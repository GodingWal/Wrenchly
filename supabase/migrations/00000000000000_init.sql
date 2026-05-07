-- Wrenchly base schema (Phase 0)
-- Tables: profiles, vehicles, deals, deal_outcomes, comps, repair_costs, waitlist

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- profiles: app-level user metadata, mirrors auth.users by id
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  tier          text not null default 'free' check (tier in ('free','flipper','pro','dealer')),
  stripe_customer_id text,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles self read"
  on public.profiles for select using (auth.uid() = id);

create policy "profiles self update"
  on public.profiles for update using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- vehicles
-- ----------------------------------------------------------------------------
create table if not exists public.vehicles (
  id            uuid primary key default uuid_generate_v4(),
  vin           text,
  year          integer not null,
  make          text not null,
  model         text not null,
  trim          text,
  engine        text,
  mileage       integer not null check (mileage >= 0),
  title_status  text not null check (title_status in ('clean','salvage','rebuilt','lien','parts_only')),
  created_at    timestamptz not null default now()
);

create index if not exists vehicles_ymm_idx on public.vehicles (year, make, model);
create index if not exists vehicles_vin_idx on public.vehicles (vin) where vin is not null;

-- ----------------------------------------------------------------------------
-- deals: one evaluation = one row
-- ----------------------------------------------------------------------------
create table if not exists public.deals (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  vehicle_id        uuid not null references public.vehicles(id) on delete restrict,
  asking_price      numeric(10,2) not null check (asking_price >= 0),
  target_price      numeric(10,2) check (target_price >= 0),
  zip               text not null,
  condition         jsonb not null,
  issues            jsonb not null default '[]'::jsonb,
  notes             text,
  verdict           text not null check (verdict in ('FLIP','MARGINAL','PART','WALK')),
  flip_profit_low   numeric(10,2),
  flip_profit_high  numeric(10,2),
  parts_profit      numeric(10,2),
  walk_threshold    numeric(10,2),
  engine_output     jsonb not null,
  created_at        timestamptz not null default now()
);

create index if not exists deals_user_idx on public.deals (user_id, created_at desc);

alter table public.deals enable row level security;

create policy "deals self read"
  on public.deals for select using (auth.uid() = user_id);

create policy "deals self insert"
  on public.deals for insert with check (auth.uid() = user_id);

create policy "deals self update"
  on public.deals for update using (auth.uid() = user_id);

create policy "deals self delete"
  on public.deals for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- deal_outcomes: how a deal actually went
-- ----------------------------------------------------------------------------
create table if not exists public.deal_outcomes (
  deal_id        uuid primary key references public.deals(id) on delete cascade,
  outcome        text not null check (outcome in ('bought','passed','sold','parted')),
  actual_profit  numeric(10,2),
  sold_at        timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.deal_outcomes enable row level security;

create policy "outcomes self read"
  on public.deal_outcomes for select
  using (exists (select 1 from public.deals d where d.id = deal_outcomes.deal_id and d.user_id = auth.uid()));

create policy "outcomes self write"
  on public.deal_outcomes for all
  using (exists (select 1 from public.deals d where d.id = deal_outcomes.deal_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.deals d where d.id = deal_outcomes.deal_id and d.user_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- comps: market comparable listings (populated by Phase 3 ingestion)
-- ----------------------------------------------------------------------------
create table if not exists public.comps (
  id           uuid primary key default uuid_generate_v4(),
  year         integer not null,
  make         text not null,
  model        text not null,
  mileage_band text not null,
  zip          text not null,
  price        numeric(10,2) not null,
  source       text not null,
  observed_at  timestamptz not null default now()
);

create index if not exists comps_lookup_idx
  on public.comps (year, make, model, zip, observed_at desc);

-- ----------------------------------------------------------------------------
-- repair_costs: regional repair pricing
-- ----------------------------------------------------------------------------
create table if not exists public.repair_costs (
  id          uuid primary key default uuid_generate_v4(),
  year        integer,
  make        text,
  model       text,
  issue_key   text not null,
  zip         text,
  low_usd     numeric(10,2) not null,
  high_usd    numeric(10,2) not null,
  source      text not null,
  observed_at timestamptz not null default now()
);

create index if not exists repair_costs_lookup_idx
  on public.repair_costs (issue_key, year, make, model);

-- ----------------------------------------------------------------------------
-- waitlist: pre-launch email capture
-- ----------------------------------------------------------------------------
create table if not exists public.waitlist (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null unique,
  created_at timestamptz not null default now()
);
