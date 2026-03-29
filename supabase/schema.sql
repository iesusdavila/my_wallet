create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique,
  updated_at timestamptz default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  balance numeric not null default 0,
  color text,
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  created_at timestamptz default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  amount numeric not null,
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  destination_account_id uuid references public.accounts(id) on delete set null,
  date date not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  balance numeric not null default 0,
  interest_rate numeric not null default 0,
  due_date date,
  created_at timestamptz default now()
);

create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  outstanding numeric not null default 0,
  credit_limit numeric not null default 0,
  closing_day int not null default 1,
  due_day int not null default 1,
  monthly_rate numeric not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.loans_given (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person text not null,
  amount numeric not null,
  paid numeric not null default 0,
  description text,
  created_at date default now()
);

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  contributions numeric not null default 0,
  withdrawals numeric not null default 0,
  current_value numeric not null default 0,
  updated_at date default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null,
  scope_id uuid,
  name text not null,
  monthly_limit numeric not null default 0,
  spent numeric not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null default 0,
  saved_amount numeric not null default 0,
  interest_rate numeric not null default 0,
  deadline date,
  created_at timestamptz default now()
);

alter table public.goals add column if not exists interest_rate numeric not null default 0;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null default 0,
  cadence text not null,
  next_charge_date date,
  created_at timestamptz default now()
);

create table if not exists public.recurring_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  description text,
  amount numeric not null default 0,
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  frequency text not null,
  day_of_month int,
  active boolean not null default true,
  last_generated_at timestamptz,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.debts enable row level security;
alter table public.credit_cards enable row level security;
alter table public.loans_given enable row level security;
alter table public.investments enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;
alter table public.subscriptions enable row level security;
alter table public.recurring_templates enable row level security;

drop policy if exists "profiles owner" on public.profiles;

create policy "profiles owner" on public.profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "accounts owner" on public.accounts;

create policy "accounts owner" on public.accounts
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "categories owner" on public.categories;

create policy "categories owner" on public.categories
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "transactions owner" on public.transactions;

create policy "transactions owner" on public.transactions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "debts owner" on public.debts;

create policy "debts owner" on public.debts
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "credit cards owner" on public.credit_cards;

create policy "credit cards owner" on public.credit_cards
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "loans owner" on public.loans_given;

create policy "loans owner" on public.loans_given
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "investments owner" on public.investments;

create policy "investments owner" on public.investments
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "budgets owner" on public.budgets;

create policy "budgets owner" on public.budgets
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "goals owner" on public.goals;

create policy "goals owner" on public.goals
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "subscriptions owner" on public.subscriptions;

create policy "subscriptions owner" on public.subscriptions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "recurring owner" on public.recurring_templates;

create policy "recurring owner" on public.recurring_templates
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
