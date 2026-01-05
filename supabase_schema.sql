create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  role text not null check (role in ('vendedor','gestor','adm')),
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cidade text not null default '',
  cnpj text not null default '',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  cliente_nome text not null,
  cidade text not null default '',
  produto text not null check (produto in ('vegaspay','agregados','cartoes','credenciamento','clube')),
  status text not null check (status in ('negociacao','ativo','sem_interesse')),
  prox_acao text not null default '',
  prox_data date,
  volume numeric not null default 0,
  licencas integer not null default 0,
  cartoes_qtd integer not null default 0,
  detalhes jsonb not null default '{}'::jsonb,
  geo jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_actions_updated on public.actions;
create trigger trg_actions_updated before update on public.actions for each row execute procedure public.set_updated_at();

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('presencial','remota')),
  lat double precision,
  lon double precision,
  accuracy_m numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.actions enable row level security;
alter table public.checkins enable row level security;

create or replace function public.current_role()
returns text language sql stable as $$ select role from public.profiles where id = auth.uid(); $$;

-- profiles: self + gestor/adm
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select using (id = auth.uid());
drop policy if exists profiles_admin on public.profiles;
create policy profiles_admin on public.profiles for select using (public.current_role() in ('gestor','adm'));

-- clients
drop policy if exists clients_ins on public.clients;
create policy clients_ins on public.clients for insert to authenticated with check (created_by = auth.uid());
drop policy if exists clients_sel on public.clients;
create policy clients_sel on public.clients for select to authenticated using (public.current_role() in ('gestor','adm') or created_by = auth.uid());

-- actions
drop policy if exists actions_ins on public.actions;
create policy actions_ins on public.actions for insert to authenticated with check (user_id = auth.uid());
drop policy if exists actions_sel on public.actions;
create policy actions_sel on public.actions for select to authenticated using (public.current_role() in ('gestor','adm') or user_id = auth.uid());
drop policy if exists actions_upd on public.actions;
create policy actions_upd on public.actions for update to authenticated using (public.current_role() in ('gestor','adm') or user_id = auth.uid())
with check (public.current_role() in ('gestor','adm') or user_id = auth.uid());

-- checkins
drop policy if exists checkins_ins on public.checkins;
create policy checkins_ins on public.checkins for insert to authenticated with check (user_id = auth.uid());
drop policy if exists checkins_sel on public.checkins;
create policy checkins_sel on public.checkins for select to authenticated using (public.current_role() in ('gestor','adm') or user_id = auth.uid());
