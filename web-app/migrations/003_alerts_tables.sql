CREATE TABLE alerts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
  niche_id VARCHAR(255) NOT NULL,
  keyword VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  metric_changed VARCHAR(100) NOT NULL,
  previous_value DECIMAL NOT NULL,
  current_value DECIMAL NOT NULL,
  change_delta DECIMAL NOT NULL,
  change_percent DECIMAL NOT NULL,
  related_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_status ON alerts(user_id, status);
CREATE INDEX idx_alerts_created_at ON alerts(user_id, created_at DESC);

CREATE TABLE notification_queue (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  alert_id VARCHAR(255) NOT NULL REFERENCES alerts(id),
  scheduled_for TIMESTAMPTZ NOT NULL,
  delivered BOOLEAN NOT NULL DEFAULT FALSE,
  delivered_at TIMESTAMPTZ NULL,
  channel VARCHAR(20) NOT NULL
);

CREATE INDEX idx_queue_pending ON notification_queue(user_id, delivered, scheduled_for);

CREATE TABLE user_alert_preferences (
  user_id VARCHAR(255) PRIMARY KEY,
  enabled_alert_types TEXT[] NOT NULL DEFAULT ARRAY['BREAKOUT_DETECTED','OPPORTUNITY_INCREASED','OPPORTUNITY_DECLINED','COMPETITION_SPIKE','MONETIZATION_IMPROVED','NEW_EMERGING_OPPORTUNITY','TREND_ACCELERATING','FRESHNESS_WINDOW_OPENED'],
  minimum_severity VARCHAR(20) NOT NULL DEFAULT 'LOW',
  notification_frequency VARCHAR(20) NOT NULL DEFAULT 'INSTANT',
  email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  in_app_enabled BOOLEAN NOT NULL TRUE,
  thresholds JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE niche_alert_settings (
  user_id VARCHAR(255) NOT NULL,
  niche_id VARCHAR(255) NOT NULL,
  keyword VARCHAR(255) NOT NULL,
  alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  enabled_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  PRIMARY KEY (user_id, niche_id)
);
