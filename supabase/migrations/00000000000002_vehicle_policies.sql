-- vehicles is a shared lookup table:
--   * read open to all authenticated users (so dedupe-by-VIN can find rows
--     created by other users)
--   * write restricted to authenticated users
-- Anonymous users can't read or write because /api/evaluate only persists
-- when a user is signed in.

alter table public.vehicles enable row level security;

drop policy if exists "vehicles read auth" on public.vehicles;
drop policy if exists "vehicles insert auth" on public.vehicles;

create policy "vehicles read auth"
  on public.vehicles for select
  to authenticated
  using (true);

create policy "vehicles insert auth"
  on public.vehicles for insert
  to authenticated
  with check (true);
