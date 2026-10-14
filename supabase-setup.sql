create extension if not exists pgcrypto;

create table if not exists public.prevention_assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_demo boolean not null default false,
  language text not null default 'te' check (language in ('en','te')),
  prevention_methods jsonb not null default '[]'::jsonb,
  uncovered_container boolean not null default false,
  cleaning_frequency text not null default 'unknown' check (cleaning_frequency in ('weekly','sometimes','rarely','unknown')),
  surroundings_cleaning_frequency text not null default 'unknown' check (surroundings_cleaning_frequency in ('daily','several_week','weekly','sometimes','never','unknown')),
  stagnant_water boolean not null default false,
  open_drain boolean not null default false,
  garbage_nearby boolean not null default false,
  open_water_tank boolean not null default false,
  waste_collecting_items boolean not null default false,
  mosquito_entry_sources jsonb not null default '[]'::jsonb,
  mosquito_presence text not null default 'unknown' check (mosquito_presence in ('often','sometimes','rarely','unknown')),
  barrier text not null default 'not_sure' check (barrier in ('knowledge','routine','resources','shared','none','not_sure')),
  issue_scope text not null default 'unknown' check (issue_scope in ('household','shared_public','unknown')),
  recommendations jsonb not null default '[]'::jsonb,
  action_status text not null default 'pending' check (action_status in ('pending','completed','unresolved')),
  recurrence_reported boolean not null default false
);

alter table public.prevention_assessments add column if not exists prevention_methods jsonb not null default '[]'::jsonb;
alter table public.prevention_assessments add column if not exists surroundings_cleaning_frequency text not null default 'unknown';
alter table public.prevention_assessments add column if not exists garbage_nearby boolean not null default false;
alter table public.prevention_assessments add column if not exists open_water_tank boolean not null default false;
alter table public.prevention_assessments add column if not exists mosquito_entry_sources jsonb not null default '[]'::jsonb;

create index if not exists prevention_assessments_created_at_idx
  on public.prevention_assessments (created_at desc);

alter table public.prevention_assessments enable row level security;

revoke all on public.prevention_assessments from anon, authenticated;
grant select on public.prevention_assessments to anon;
grant insert (language, prevention_methods, uncovered_container, cleaning_frequency, surroundings_cleaning_frequency, stagnant_water, open_drain, garbage_nearby, open_water_tank, waste_collecting_items, mosquito_entry_sources, mosquito_presence, barrier, issue_scope, recommendations, action_status, recurrence_reported) on public.prevention_assessments to anon;
grant update (action_status, updated_at) on public.prevention_assessments to anon;

drop policy if exists "anon can read anonymous assessments" on public.prevention_assessments;
create policy "anon can read anonymous assessments"
  on public.prevention_assessments for select to anon using (true);

drop policy if exists "anon can submit assessments" on public.prevention_assessments;
create policy "anon can submit assessments"
  on public.prevention_assessments for insert to anon
  with check (is_demo = false);

drop policy if exists "anon can update action status" on public.prevention_assessments;
create policy "anon can update action status"
  on public.prevention_assessments for update to anon
  using (true) with check (true);
