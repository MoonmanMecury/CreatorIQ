-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Saved niches table
create table public.saved_niches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  keyword text not null,
  opportunity_score numeric(5,1),
  growth_score numeric(5,1),
  monetization_score numeric(5,1),
  competition_score numeric(5,1),
  demand_score numeric(5,1),
  saturation_score numeric(5,1),
  opportunity_index numeric(5,1),
  verdict text,                          -- from Step 2: LOW | MEDIUM | HIGH | GOLDMINE
  monetization_verdict text,             -- from Step 5: POOR | WEAK | VIABLE | STRONG | ELITE
  market_maturity text,
  top_revenue_paths text[],              -- array of revenue path type strings
  notes text,
  tags text[],
  created_at timestamptz default now(),
  last_analyzed_at timestamptz default now(),
  unique(user_id, keyword)
);

-- Niche score history table (for change detection)
create table public.niche_score_history (
  id uuid default uuid_generate_v4() primary key,
  saved_niche_id uuid references public.saved_niches(id) on delete cascade,
  opportunity_score numeric(5,1),
  growth_score numeric(5,1),
  monetization_score numeric(5,1),
  competition_score numeric(5,1),
  demand_score numeric(5,1),
  recorded_at timestamptz default now()
);

-- Feed events table (activity timeline)
create table public.feed_events (
  id uuid default uuid_generate_v4() primary key,
  saved_niche_id uuid references public.saved_niches(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,              -- SAVED | SCORE_CHANGE | BREAKOUT | COMPETITION_ALERT | REANALYZED | NOTE_ADDED
  event_title text not null,
  event_description text,
  severity text default 'INFO',          -- INFO | WARNING | CRITICAL
  score_delta numeric(5,1),              -- positive or negative score change
  metadata jsonb,                        -- flexible extra data
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.saved_niches enable row level security;
alter table public.niche_score_history enable row level security;
alter table public.feed_events enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own saved niches"
  on public.saved_niches for select using (auth.uid() = user_id);

create policy "Users can insert own saved niches"
  on public.saved_niches for insert with check (auth.uid() = user_id);

create policy "Users can update own saved niches"
  on public.saved_niches for update using (auth.uid() = user_id);

create policy "Users can delete own saved niches"
  on public.saved_niches for delete using (auth.uid() = user_id);

create policy "Users can view own score history"
  on public.niche_score_history for select
  using (exists (
    select 1 from public.saved_niches
    where id = saved_niche_id and user_id = auth.uid()
  ));

create policy "Users can insert own score history"
  on public.niche_score_history for insert
  with check (exists (
    select 1 from public.saved_niches
    where id = saved_niche_id and user_id = auth.uid()
  ));

create policy "Users can view own feed events"
  on public.feed_events for select using (auth.uid() = user_id);

create policy "Users can insert own feed events"
  on public.feed_events for insert with check (auth.uid() = user_id);

-- Indexes for performance
create index idx_saved_niches_user_id on public.saved_niches(user_id);
create index idx_saved_niches_keyword on public.saved_niches(keyword);
create index idx_feed_events_user_id on public.feed_events(user_id);
create index idx_feed_events_niche_id on public.feed_events(saved_niche_id);
create index idx_score_history_niche_id on public.niche_score_history(saved_niche_id);
create index idx_feed_events_created_at on public.feed_events(created_at desc);
