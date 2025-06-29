-- Sprint 3 Tables Migration
-- Created: 2025-01-02
-- Purpose: Add tables for hybrid AI integration, OAuth provider connections, and learning systems

-- OAuth provider connections
CREATE TABLE provider_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'gmail', 'google_calendar', 'apple_calendar'
  access_token TEXT, -- Encrypted in application layer
  refresh_token TEXT, -- Encrypted in application layer
  expires_at TIMESTAMP,
  scopes TEXT[] NOT NULL,
  connected_at TIMESTAMP DEFAULT NOW(),
  last_sync TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  
  UNIQUE(user_id, provider)
);

-- Email processing insights (not storing full content)
CREATE TABLE email_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_email_id TEXT NOT NULL, -- Gmail/Outlook message ID
  provider TEXT NOT NULL,
  category TEXT NOT NULL, -- 'high_priority', 'client', 'marketing', 'personal'
  summary TEXT, -- AI-generated summary
  tasks_extracted TEXT[], -- Potential tasks identified
  urgency_score INTEGER CHECK (urgency_score BETWEEN 1 AND 10),
  processed_at TIMESTAMP DEFAULT NOW(),
  ai_model_used TEXT, -- 'mistral:7b', 'gpt-4o-mini'
  
  UNIQUE(user_id, provider_email_id, provider)
);

-- AI interaction tracking for cost and learning
CREATE TABLE ai_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'brief', 'email_triage', 'calendar_analysis'
  ai_provider TEXT NOT NULL, -- 'ollama', 'openai', 'claude'
  model_used TEXT NOT NULL, -- 'mistral:7b-instruct', 'gpt-4o-mini'
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd DECIMAL(8,6), -- Precise cost tracking
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Suggestion effectiveness tracking for learning
CREATE TABLE suggestion_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL, -- 'review_emails', 'prep_meeting', 'focus_block'
  context JSONB, -- time_of_day, recent_activity, focus_mode_active
  suggested_at TIMESTAMP DEFAULT NOW(),
  clicked BOOLEAN,
  clicked_at TIMESTAMP,
  outcome TEXT, -- 'completed', 'dismissed', 'deferred'
  feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5)
);

-- Indexes for performance
CREATE INDEX idx_provider_connections_user_provider ON provider_connections(user_id, provider);
CREATE INDEX idx_provider_connections_status ON provider_connections(user_id, status);

CREATE INDEX idx_email_insights_user_provider ON email_insights(user_id, provider);
CREATE INDEX idx_email_insights_category ON email_insights(user_id, category, processed_at);
CREATE INDEX idx_email_insights_urgency ON email_insights(user_id, urgency_score DESC);

CREATE INDEX idx_ai_interactions_user_date ON ai_interactions(user_id, created_at);
CREATE INDEX idx_ai_interactions_cost ON ai_interactions(user_id, cost_usd, created_at);
CREATE INDEX idx_ai_interactions_type ON ai_interactions(user_id, interaction_type);

CREATE INDEX idx_suggestion_metrics_learning ON suggestion_metrics(user_id, suggestion_type, clicked);
CREATE INDEX idx_suggestion_metrics_date ON suggestion_metrics(user_id, suggested_at);

-- Enable Row Level Security
ALTER TABLE provider_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can manage own provider connections" ON provider_connections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own email insights" ON email_insights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI interactions" ON ai_interactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own suggestion metrics" ON suggestion_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE provider_connections IS 'OAuth connections to external providers (Gmail, Calendar, etc.)';
COMMENT ON TABLE email_insights IS 'AI-processed email insights (summaries, not full content for privacy)';
COMMENT ON TABLE ai_interactions IS 'Track all AI usage for cost control and performance monitoring';
COMMENT ON TABLE suggestion_metrics IS 'User interaction data for improving AI suggestion relevance';

COMMENT ON COLUMN provider_connections.access_token IS 'Encrypted OAuth access token';
COMMENT ON COLUMN provider_connections.refresh_token IS 'Encrypted OAuth refresh token';
COMMENT ON COLUMN email_insights.summary IS 'AI-generated summary of email content';
COMMENT ON COLUMN ai_interactions.cost_usd IS 'Actual cost in USD for this AI interaction';
COMMENT ON COLUMN suggestion_metrics.context IS 'JSON context when suggestion was made (time, focus mode, etc.)'; 