-- Sprint 3 Tables Migration
-- Created: 2025-01-02
-- Purpose: Add tables for hybrid AI integration, OAuth provider connections, and learning systems

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- User roles for access control
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- RLS policies for user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON user_roles FOR ALL
  USING (
    auth.uid() IN (
      SELECT ur.user_id 
      FROM user_roles ur 
      WHERE ur.role = 'admin'
    )
  );

-- OAuth provider connections with encrypted tokens
CREATE TABLE provider_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'google_calendar', 'apple_calendar')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[] NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  
  UNIQUE(user_id, provider)
);

-- RLS policies for provider_connections
ALTER TABLE provider_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own connections"
  ON provider_connections FOR ALL
  USING (auth.uid() = user_id);

-- Email processing insights (not storing full content)
CREATE TABLE email_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_email_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('high_priority', 'client', 'marketing', 'personal')),
  summary TEXT,
  tasks_extracted TEXT[],
  urgency_score INTEGER CHECK (urgency_score BETWEEN 1 AND 10),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_model_used TEXT,
  
  UNIQUE(user_id, provider_email_id, provider)
);

-- RLS policies for email_insights
ALTER TABLE email_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own email insights"
  ON email_insights FOR ALL
  USING (auth.uid() = user_id);

-- AI interaction tracking for cost and learning
CREATE TABLE ai_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  model_used TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_usd DECIMAL(10,6) NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for ai_interactions
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI interactions"
  ON ai_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage AI interactions"
  ON ai_interactions FOR ALL
  USING (
    auth.uid() IN (
      SELECT ur.user_id 
      FROM user_roles ur 
      WHERE ur.role = 'admin'
    )
  );

-- Suggestion metrics for learning
CREATE TABLE suggestion_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL,
  suggestion_data JSONB NOT NULL,
  accepted BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- RLS policies for suggestion_metrics
ALTER TABLE suggestion_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own suggestion metrics"
  ON suggestion_metrics FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_connections_user_provider ON provider_connections(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_provider_connections_status ON provider_connections(status);
CREATE INDEX IF NOT EXISTS idx_email_insights_user_urgency ON email_insights(user_id, urgency_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_date ON ai_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestion_metrics_user_type ON suggestion_metrics(user_id, suggestion_type);

-- Functions for token management
CREATE OR REPLACE FUNCTION check_token_expiry() RETURNS trigger AS $$
BEGIN
  IF NEW.expires_at < NOW() THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_token_status
  BEFORE INSERT OR UPDATE ON provider_connections
  FOR EACH ROW
  EXECUTE FUNCTION check_token_expiry();

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data() RETURNS void AS $$
DECLARE
  retention_days INTEGER;
BEGIN
  -- Get retention days from settings
  retention_days := current_setting('app.settings.data_retention_days')::INTEGER;
  
  -- Delete old email insights
  DELETE FROM email_insights 
  WHERE processed_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  -- Delete old AI interactions
  DELETE FROM ai_interactions 
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  -- Delete old suggestion metrics
  DELETE FROM suggestion_metrics 
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Saved locations
CREATE TABLE saved_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  place_id TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  types TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Weather data cache
CREATE TABLE weather_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES saved_locations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openweathermap', 'weatherapi', 'tomorrow_io'
  current_data JSONB NOT NULL,
  forecast_data JSONB NOT NULL,
  alerts JSONB DEFAULT '[]',
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  
  UNIQUE(location_id, provider)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_connections_user_provider ON provider_connections(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_provider_connections_status ON provider_connections(user_id, status);

CREATE INDEX IF NOT EXISTS idx_email_insights_user_provider ON email_insights(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_email_insights_category ON email_insights(user_id, category, processed_at);
CREATE INDEX IF NOT EXISTS idx_email_insights_urgency ON email_insights(user_id, urgency_score DESC);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_date ON ai_interactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_cost ON ai_interactions(user_id, cost_usd, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_interactions(user_id, interaction_type);

CREATE INDEX IF NOT EXISTS idx_suggestion_metrics_learning ON suggestion_metrics(user_id, suggestion_type, accepted);
CREATE INDEX IF NOT EXISTS idx_suggestion_metrics_date ON suggestion_metrics(user_id, created_at);

-- Create index for weather cache cleanup
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather_cache (expires_at);

-- Create index for location search
CREATE INDEX IF NOT EXISTS idx_locations_coords ON saved_locations USING gist (
  ll_to_earth(latitude, longitude)
);

-- Function to find nearby locations
CREATE OR REPLACE FUNCTION find_nearby_locations(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  distance_meters FLOAT,
  latitude DECIMAL,
  longitude DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    earth_distance(
      ll_to_earth(l.latitude, l.longitude),
      ll_to_earth(p_latitude, p_longitude)
    ) AS distance_meters,
    l.latitude,
    l.longitude
  FROM saved_locations l
  WHERE earth_box(
    ll_to_earth(p_latitude, p_longitude),
    p_radius_meters
  ) @> ll_to_earth(l.latitude, l.longitude)
  AND earth_distance(
    ll_to_earth(l.latitude, l.longitude),
    ll_to_earth(p_latitude, p_longitude)
  ) < p_radius_meters
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE provider_connections IS 'OAuth connections to external providers (Gmail, Calendar, etc.)';
COMMENT ON TABLE email_insights IS 'AI-processed email insights (summaries, not full content for privacy)';
COMMENT ON TABLE ai_interactions IS 'Track all AI usage for cost control and performance monitoring';
COMMENT ON TABLE suggestion_metrics IS 'User interaction data for improving AI suggestion relevance';

COMMENT ON COLUMN provider_connections.access_token IS 'Encrypted OAuth access token';
COMMENT ON COLUMN provider_connections.refresh_token IS 'Encrypted OAuth refresh token';
COMMENT ON COLUMN email_insights.summary IS 'AI-generated summary of email content';
COMMENT ON COLUMN ai_interactions.cost_usd IS 'Actual cost in USD for this AI interaction';
COMMENT ON COLUMN suggestion_metrics.suggestion_data IS 'JSON data related to the suggestion'; 