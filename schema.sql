-- AntiGravity — Additional tables to add to your existing Supabase project
-- Your existing tables: client_profiles, workout_logs, food_logs, weight_logs
-- Run this in: https://supabase.com/dashboard/project/txopwlqomvwkueohrcgm/sql

-- ─── Add missing columns to client_profiles ──────────────────────────────────
-- (skip any that already exist)

alter table public.client_profiles
  add column if not exists brand_name     text,
  add column if not exists accent_colour  text default '#a3e635',
  add column if not exists subscription_tier text default 'free';

alter table public.food_logs
  add column if not exists meal_type text default 'breakfast';

-- ─── Sleep logs — bedtime & wake time support ────────────────────────────────
-- Run this if your sleep_logs table already exists:
alter table public.sleep_logs
  add column if not exists sleep_time text,   -- e.g. "22:30"
  add column if not exists wake_time  text;   -- e.g. "06:15"

-- If sleep_logs doesn't exist yet, create it from scratch:
create table if not exists public.sleep_logs (
  id          uuid primary key default gen_random_uuid(),
  client_id   text not null,
  date        date not null,
  hours       numeric(4,1),
  quality     integer check (quality between 1 and 5),
  sleep_time  text,
  wake_time   text,
  created_at  timestamptz default now(),
  unique (client_id, date)
);

-- ─── Workouts (trainer-built plans) ──────────────────────────────────────────
create table if not exists public.workouts (
  id          uuid primary key default gen_random_uuid(),
  trainer_id  text,               -- matches client_profiles.id for trainers
  name        text not null,
  notes       text,
  exercises   jsonb default '[]', -- [{name, sets, reps, rest}]
  created_at  timestamptz default now()
);

-- ─── Assigned workouts (trainer → client) ────────────────────────────────────
create table if not exists public.assigned_workouts (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid references public.workouts(id) on delete cascade,
  client_id   text,               -- matches client_profiles.id
  status      text default 'active' check (status in ('active','completed','paused')),
  assigned_at timestamptz default now()
);

-- ─── Check-ins (weekly from mobile app) ──────────────────────────────────────
create table if not exists public.checkins (
  id           uuid primary key default gen_random_uuid(),
  client_id    text not null,     -- matches client_profiles.id
  week_start   date not null,
  sleep        integer check (sleep between 1 and 10),
  energy       integer check (energy between 1 and 10),
  soreness     integer check (soreness between 1 and 10),
  mood         integer check (mood between 1 and 10),
  notes        text,
  submitted_at timestamptz default now()
);

-- ─── Progress photos ─────────────────────────────────────────────────────────
create table if not exists public.progress_photos (
  id         uuid primary key default gen_random_uuid(),
  client_id  text not null,
  photo_url  text not null,
  notes      text,
  taken_at   timestamptz default now()
);

-- ─── Verify your existing tables have these columns ──────────────────────────
-- workout_logs: id, client_id, exercise, value, calories_burnt, created_at
-- food_logs:    id, client_id, name, calories, protein, carbs, fats, meal_type, created_at
-- weight_logs:  id, client_id, weight, created_at
-- client_profiles: id, name, username, password, role, subscription_tier, trainer_note, profile_photo_url, daily_goal, height
