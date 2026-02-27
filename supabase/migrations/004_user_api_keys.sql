CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_hint VARCHAR(10) NOT NULL,
  model_preference VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_verified_at TIMESTAMPTZ NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE TABLE user_conductor_preferences (
  user_id VARCHAR(255) PRIMARY KEY,
  active_provider VARCHAR(50) NOT NULL DEFAULT 'anthropic',
  active_model VARCHAR(100) NOT NULL,
  fallback_provider VARCHAR(50) NULL,
  fallback_model VARCHAR(100) NULL,
  streaming_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON user_api_keys(user_id);
