# Wrenchly

> Should you flip it, part it, or walk?

Wrenchly is a decision tool for car flippers and small independent dealers. Enter a vehicle and the asking price; get back a verdict — **FLIP**, **MARGINAL**, **PART**, or **WALK** — with the math behind it, in under two minutes.

## Repo layout

```
wrenchly/
├── apps/
│   └── web/             # Next.js 15 (App Router) + Tailwind
├── packages/
│   ├── engine/          # Pure TS — flip / parts / walk calculators
│   └── types/           # Shared Zod schemas + TS types
└── supabase/
    └── migrations/      # SQL schema migrations
```

The engine and types are pure TypeScript packages so they can be reused by a future Expo / React Native app without rewriting business logic.

## Getting started

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # fill in Supabase + Stripe keys
pnpm dev
```

The web app runs at http://localhost:3000.

## Stack

- **Web**: Next.js 15, TypeScript, Tailwind, shadcn/ui
- **Auth + DB**: Supabase (Postgres + Auth)
- **Payments**: Stripe
- **Hosting**: Vercel (web) + Supabase (DB)

## Phase plan

- **Phase 0** — Foundations (this branch)
- **Phase 1** — Manual-input MVP, engine, verdict screen, deal log
- **Phase 2** — Stripe tiers, PDF export, landing page
- **Phase 3** — VIN decode, comp data integration, repair-cost API
- **Phase 4** — Expo mobile app sharing `packages/engine`
