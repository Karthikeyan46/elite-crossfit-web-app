-- FitCoach AI Database Schema
-- Run this in the Supabase SQL Editor

-- 1. Users table (Extends Supabase Auth)
create table if not exists public.users (
  id          uuid references auth.users on delete cascade primary key,
  name        text,
  role        text check (role in ('trainer', 'client')),
  trainer_id  uuid references public.users(id),
  created_at  timestamptz default now()
);

-- 2. Foods table
create table if not exists public.foods (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  calories      numeric(10,2) default 0,
  protein       numeric(10,2) default 0,
  carbs         numeric(10,2) default 0,
  fat           numeric(10,2) default 0,
  serving_unit  text default 'serving',
  synonyms      text[],
  created_at    timestamptz default now()
);

-- 3. Food logs
create table if not exists public.food_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  food_id     uuid references public.foods(id),
  name        text, 
  quantity    numeric(10,2) default 1,
  calories    numeric(10,2) default 0,
  protein     numeric(10,2) default 0,
  carbs       numeric(10,2) default 0,
  fat         numeric(10,2) default 0,
  timestamp   timestamptz default now()
);

-- 4. Workouts
create table if not exists public.workouts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

-- 5. Workout logs
create table if not exists public.workout_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  workout_id  uuid references public.workouts(id),
  status      text check (status in ('pending', 'completed')) default 'completed',
  timestamp   timestamptz default now()
);

-- 6. Clients mapping
create table if not exists public.clients (
  trainer_id  uuid references public.users(id) on delete cascade,
  client_id   uuid references public.users(id) on delete cascade,
  primary key (trainer_id, client_id)
);

-- Enable Realtime for relevant tables
alter publication supabase_realtime add table public.food_logs;
alter publication supabase_realtime add table public.workout_logs;
alter publication supabase_realtime add table public.users;

-- RLS Policies (Simplified for development)
alter table public.users enable row level security;
create policy "Users can view all users" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

alter table public.food_logs enable row level security;
create policy "Users can view own logs" on public.food_logs for select using (auth.uid() = user_id OR (select role from public.users where id = auth.uid()) = 'trainer');
create policy "Users can insert own logs" on public.food_logs for insert with check (auth.uid() = user_id);

alter table public.workout_logs enable row level security;
create policy "Users can view own workouts" on public.workout_logs for select using (auth.uid() = user_id OR (select role from public.users where id = auth.uid()) = 'trainer');
create policy "Users can insert own workouts" on public.workout_logs for insert with check (auth.uid() = user_id);

alter table public.foods enable row level security;
create policy "All can view foods" on public.foods for select using (true);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user row on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
