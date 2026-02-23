-- CreatorIQ Database Schema
-- Last Updated: 2026-02-22
-- Target: Supabase (PostgreSQL)

-- Enable extension for UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. PROFILES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 2. NICHES / SEARCHES
-- ---------------------------------------------------------------------------
-- The root record for a keyword analysis. All other data links here.
CREATE TABLE IF NOT EXISTS niches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  niche_score INTEGER DEFAULT 0,
  trend_velocity DECIMAL DEFAULT 0,
  competition_density TEXT,
  revenue_potential INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_niches_user_id ON niches(user_id);
CREATE INDEX idx_niches_keyword ON niches(keyword);

ALTER TABLE niches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own niches" ON niches
  FOR ALL USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. TREND DISCOVERY (Step 2)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trend_discovery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  niche_id UUID UNIQUE REFERENCES niches(id) ON DELETE CASCADE,
  trend_data JSONB, -- Time-series points: [{date, value}]
  keyword_clusters JSONB, -- [{keyword, volume, growth}]
  subtopics JSONB, -- [{keyword, growth_rate, competition_score, recommendation}]
  opportunity_insights JSONB, -- {underserved_angles, emerging_keywords, recommended_format}
  youtube_metrics JSONB, -- {total_views, average_engagement, supply_count}
  last_computed TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4. OPPORTUNITY ANALYSIS (Step 3)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS opportunity_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  niche_id UUID UNIQUE REFERENCES niches(id) ON DELETE CASCADE,
  opportunity_index INTEGER DEFAULT 0,
  classification TEXT, -- PRIME ENTRY, STRONG, etc.
  gap_signals JSONB, -- {weakCompetition, underservedDemand, smallCreatorAdvantage, freshnessGap}
  competition_insights TEXT[],
  entry_insights TEXT[],
  last_computed TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS breakout_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunity_analysis(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  channel_name TEXT,
  views BIGINT,
  outperformance_ratio DECIMAL,
  thumbnail_url TEXT,
  video_url TEXT,
  publish_date TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS underserved_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunity_analysis(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  growth_rate DECIMAL,
  competition_level TEXT,
  search_volume_trend TEXT,
  is_long_tail BOOLEAN
);

-- ---------------------------------------------------------------------------
-- 5. MONETIZATION INSIGHTS (Step 5)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monetization_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  niche_id UUID UNIQUE REFERENCES niches(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  verdict TEXT,
  verdict_label TEXT,
  verdict_description TEXT,
  cpm_tier TEXT,
  market_maturity TEXT,
  score_breakdown JSONB, -- {adDemand, audienceValue, revenuePathScore, etc.}
  revenue_paths JSONB, -- [{type, label, confidenceScore, reasoning, timeToRevenue}]
  top_opportunities TEXT[],
  risks TEXT[],
  last_computed TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 6. CONTENT STRATEGY (Step 6)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  niche_id UUID UNIQUE REFERENCES niches(id) ON DELETE CASCADE,
  posting_plan JSONB, -- {cadence, longFormPerWeek, shortFormPerWeek, totalViewsGoal}
  pillars JSONB, -- [{name, description, weight, subTopics}]
  top_formats JSONB, -- [{label, justification, difficulty}]
  differentiation_strategies JSONB, -- [{strategy, executionTip}]
  quick_wins JSONB, -- [{action, impact, difficulty}]
  last_computed TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS video_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID REFERENCES content_strategies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  hook TEXT,
  format TEXT,
  pillar TEXT,
  difficulty TEXT,
  potential_views BIGINT,
  rationale TEXT,
  target_audience TEXT
);

-- ---------------------------------------------------------------------------
-- 7. GROWTH BLUEPRINT (Step 7)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS growth_blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  niche_id UUID UNIQUE REFERENCES niches(id) ON DELETE CASCADE,
  executive_summary TEXT,
  current_stage TEXT, -- LAUNCH, TRACTION, etc.
  projected_authority_weeks INTEGER,
  total_weekly_hours_launch INTEGER,
  total_weekly_hours_scale INTEGER,
  subscriber_milestones JSONB, -- [{target, label, estimatedWeeks, features, etc.}]
  cadence_phases JSONB, -- [{phase, label, volume, hours, etc.}]
  weekly_schedule JSONB, -- 12-week grid: [{week, topic, count, etc.}]
  platform_recommendations JSONB, -- [{platform, priority, adaptation, etc.}]
  kpi_targets JSONB, -- [{metric, targetValue, unit, stage}]
  alerts JSONB, -- [{id, severity, title, action, etc.}]
  last_computed TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 8. TRIGGERS FOR UPDATED_AT
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_niches_modtime BEFORE UPDATE ON niches FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ---------------------------------------------------------------------------
-- 9. HELPER VIEWS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW niche_full_analysis AS
SELECT 
  n.id, 
  n.user_id, 
  n.keyword, 
  n.niche_score,
  o.opportunity_index,
  m.score as monetization_score,
  m.verdict as monetization_verdict,
  g.projected_authority_weeks
FROM niches n
LEFT JOIN opportunity_analysis o ON n.id = o.niche_id
LEFT JOIN monetization_insights m ON n.id = m.niche_id
LEFT JOIN growth_blueprints g ON n.id = g.niche_id;
