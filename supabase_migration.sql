-- League 247 Command Center — Initial Schema
-- Run this in Supabase: Dashboard → SQL Editor → New query

-- Agent activity logs
create table if not exists public.agent_logs (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  agent        text not null,
  action       text not null,
  details      text default '',
  type         text default 'system',
  session_id   uuid
);

-- Daily command briefs
create table if not exists public.daily_briefs (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz default now(),
  greeting             text default '',
  priorities           jsonb default '[]',
  client_attention     jsonb default '[]',
  sales_opportunities  jsonb default '[]',
  riley_tasks          jsonb default '[]',
  production_queue     jsonb default '[]',
  ghl_follow_ups       jsonb default '[]',
  team_assignments     jsonb default '[]',
  revenue_opportunities jsonb default '[]',
  rob_should_do_first  jsonb default '[]',
  end_of_day_checklist jsonb default '[]',
  raw_response         text default ''
);

-- Voice interaction sessions
create table if not exists public.voice_sessions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  transcript   text default '',
  response     text default '',
  agent        text default 'BIG_HOMIE',
  duration_ms  int default 0
);

-- Revenue snapshots
create table if not exists public.revenue_snapshots (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  current_mrr    numeric default 0,
  mrr_target     numeric default 20000,
  total_clients  int default 0,
  pipeline_value numeric default 0,
  source         text default 'sheets',
  raw_data       jsonb default '{}'
);

-- Disable RLS for development (re-enable and add policies before going to production)
alter table public.agent_logs       disable row level security;
alter table public.daily_briefs     disable row level security;
alter table public.voice_sessions   disable row level security;
alter table public.revenue_snapshots disable row level security;
