-- Enable extension for UUID generation
create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Core entities
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('expense', 'income')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric(14,2) not null check (amount > 0),
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid not null references public.accounts(id) on delete restrict,
  destination_account_id uuid references public.accounts(id) on delete restrict,
  date date not null default current_date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfer_destination_check check (
    (type <> 'transfer' and destination_account_id is null)
    or (type = 'transfer' and destination_account_id is not null and destination_account_id <> account_id)
  )
);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  balance numeric(14,2) not null default 0,
  interest_rate numeric(8,4) not null default 0,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  outstanding numeric(14,2) not null default 0,
  interest_rate numeric(8,4) not null default 0,
  due_date date,
  limit_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loans_given (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person text not null,
  amount numeric(14,2) not null check (amount >= 0),
  paid boolean not null default false,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  contributions numeric(14,2) not null default 0,
  withdrawals numeric(14,2) not null default 0,
  current_value numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  limit_amount numeric(14,2) not null default 0,
  saved_amount numeric(14,2) not null default 0,
  interest_rate numeric(8,4) not null default 0,
  frequency text not null default 'monthly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  limit_amount numeric(14,2) not null default 0,
  saved_amount numeric(14,2) not null default 0,
  interest_rate numeric(8,4) not null default 0,
  frequency text not null default 'monthly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(14,2) not null default 0,
  frequency text not null default 'monthly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  initial_amount numeric(14,2) not null default 0,
  interest_rate numeric(8,4) not null default 0,
  start_date date,
  maturity_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(14,2) not null default 0,
  frequency text not null default 'monthly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fixed_incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(14,2) not null default 0,
  frequency text not null default 'monthly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.allocation_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  savings_percent numeric(6,2) not null default 20,
  monthly_expenses_percent numeric(6,2) not null default 60,
  investments_percent numeric(6,2) not null default 20,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals add column if not exists target_date date;

-- Updated at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for updated_at
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_accounts_updated_at before update on public.accounts for each row execute function public.set_updated_at();
create trigger trg_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger trg_transactions_updated_at before update on public.transactions for each row execute function public.set_updated_at();
create trigger trg_debts_updated_at before update on public.debts for each row execute function public.set_updated_at();
create trigger trg_credit_cards_updated_at before update on public.credit_cards for each row execute function public.set_updated_at();
create trigger trg_loans_updated_at before update on public.loans_given for each row execute function public.set_updated_at();
create trigger trg_investments_updated_at before update on public.investments for each row execute function public.set_updated_at();
create trigger trg_budgets_updated_at before update on public.budgets for each row execute function public.set_updated_at();
create trigger trg_goals_updated_at before update on public.goals for each row execute function public.set_updated_at();
create trigger trg_subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger trg_policies_updated_at before update on public.policies for each row execute function public.set_updated_at();
create trigger trg_fixed_expenses_updated_at before update on public.fixed_expenses for each row execute function public.set_updated_at();
create trigger trg_fixed_incomes_updated_at before update on public.fixed_incomes for each row execute function public.set_updated_at();
create trigger trg_allocation_plans_updated_at before update on public.allocation_plans for each row execute function public.set_updated_at();

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Account balance sync on transactions
create or replace function public.adjust_account_balance(p_user_id uuid, p_account_id uuid, p_delta numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_account_id is null then
    return;
  end if;

  update public.accounts
  set balance = coalesce(balance, 0) + coalesce(p_delta, 0)
  where id = p_account_id and user_id = p_user_id;
end;
$$;

create or replace function public.sync_account_balances_from_transactions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.type = 'income' then
      perform public.adjust_account_balance(new.user_id, new.account_id, new.amount);
    elsif new.type = 'expense' then
      perform public.adjust_account_balance(new.user_id, new.account_id, -new.amount);
    elsif new.type = 'transfer' then
      perform public.adjust_account_balance(new.user_id, new.account_id, -new.amount);
      perform public.adjust_account_balance(new.user_id, new.destination_account_id, new.amount);
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.type = 'income' then
      perform public.adjust_account_balance(old.user_id, old.account_id, -old.amount);
    elsif old.type = 'expense' then
      perform public.adjust_account_balance(old.user_id, old.account_id, old.amount);
    elsif old.type = 'transfer' then
      perform public.adjust_account_balance(old.user_id, old.account_id, old.amount);
      perform public.adjust_account_balance(old.user_id, old.destination_account_id, -old.amount);
    end if;
    return old;
  end if;

  if tg_op = 'UPDATE' then
    -- revert old
    if old.type = 'income' then
      perform public.adjust_account_balance(old.user_id, old.account_id, -old.amount);
    elsif old.type = 'expense' then
      perform public.adjust_account_balance(old.user_id, old.account_id, old.amount);
    elsif old.type = 'transfer' then
      perform public.adjust_account_balance(old.user_id, old.account_id, old.amount);
      perform public.adjust_account_balance(old.user_id, old.destination_account_id, -old.amount);
    end if;

    -- apply new
    if new.type = 'income' then
      perform public.adjust_account_balance(new.user_id, new.account_id, new.amount);
    elsif new.type = 'expense' then
      perform public.adjust_account_balance(new.user_id, new.account_id, -new.amount);
    elsif new.type = 'transfer' then
      perform public.adjust_account_balance(new.user_id, new.account_id, -new.amount);
      perform public.adjust_account_balance(new.user_id, new.destination_account_id, new.amount);
    end if;

    return new;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_sync_accounts_on_tx on public.transactions;
create trigger trg_sync_accounts_on_tx
after insert or update or delete on public.transactions
for each row execute function public.sync_account_balances_from_transactions();

-- Enable RLS
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
alter table public.policies enable row level security;
alter table public.fixed_expenses enable row level security;
alter table public.fixed_incomes enable row level security;
alter table public.allocation_plans enable row level security;

-- Standard policies: only own data
create policy "profiles_own" on public.profiles
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "accounts_own" on public.accounts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "categories_own" on public.categories
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_own" on public.transactions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "debts_own" on public.debts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "credit_cards_own" on public.credit_cards
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "loans_given_own" on public.loans_given
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "investments_own" on public.investments
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets_own" on public.budgets
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_own" on public.goals
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "subscriptions_own" on public.subscriptions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "policies_own" on public.policies
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "fixed_expenses_own" on public.fixed_expenses
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "fixed_incomes_own" on public.fixed_incomes
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "allocation_plans_own" on public.allocation_plans
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
