# Sprint 3 Prerequisites: Critical Missing Implementations

**Created**: 2025-01-02  
**Purpose**: Address critical gaps identified before Sprint 3 can begin successfully  
**Status**: 🔴 **BLOCKING** - These items must be completed before Sprint 3 implementation

---

## 🚨 **Critical Foundation Tasks**

### **1. Database Migrations** ⚡ **HIGH PRIORITY**

**Status**: ❌ Not Created  
**Impact**: Sprint 3 cannot store AI interactions, OAuth tokens, or email insights

**Required Migrations**:
```sql
-- Create: supabase/migrations/20250102_sprint3_tables.sql

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
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Index for cost tracking and analytics
  INDEX idx_ai_interactions_user_date ON ai_interactions(user_id, created_at),
  INDEX idx_ai_interactions_cost ON ai_interactions(user_id, cost_usd, created_at)
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
  feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5),
  
  -- Index for learning algorithm queries
  INDEX idx_suggestion_metrics_learning ON suggestion_metrics(user_id, suggestion_type, clicked)
);

-- RLS Policies
ALTER TABLE provider_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_metrics ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage own provider connections" ON provider_connections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own email insights" ON email_insights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI interactions" ON ai_interactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own suggestion metrics" ON suggestion_metrics
  FOR ALL USING (auth.uid() = user_id);
```

### **2. Environment Configuration** ⚡ **HIGH PRIORITY**

**Status**: ❌ Not Created  
**Impact**: No OAuth credentials, AI settings, or cost controls

**Required Files**:

```bash
# .env.local (for development)
# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback/google

# AI Configuration
OPENAI_API_KEY=your_openai_api_key
OLLAMA_URL=http://localhost:11434
AI_ROUTER_URL=http://localhost:3001

# Cost Controls
DAILY_AI_BUDGET_USD=1.00
COST_ALERT_WEBHOOK_URL=
AUTO_FALLBACK_ENABLED=true

# Privacy Settings  
DEFAULT_AI_PREFERENCE=local
SENSITIVE_DATA_LOCAL_ONLY=true
DATA_RETENTION_DAYS=7

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_GMAIL_INTEGRATION=true
ENABLE_CALENDAR_INTEGRATION=true
ENABLE_BIDIRECTIONAL_SYNC=false

# Development
LOG_LEVEL=debug
MOCK_AI_RESPONSES=false
MOCK_PROVIDER_APIS=false
```

```bash
# .env.production
# Production environment with secure secrets management
GOOGLE_OAUTH_CLIENT_ID=${GOOGLE_OAUTH_CLIENT_ID}
GOOGLE_OAUTH_CLIENT_SECRET=${GOOGLE_OAUTH_CLIENT_SECRET}
OPENAI_API_KEY=${OPENAI_API_KEY}

# Production cost controls
DAILY_AI_BUDGET_USD=1.00
COST_MONITORING_ENABLED=true
AUTOMATIC_SCALING_ENABLED=true

# Security
TOKEN_ENCRYPTION_KEY=${TOKEN_ENCRYPTION_KEY}
SESSION_SECRET=${SESSION_SECRET}
```

### **3. TypeScript Interface Definitions** ⚡ **MEDIUM PRIORITY**

**Status**: ❌ Not Created  
**Impact**: No type safety for new Sprint 3 features

**Required Files**:

```typescript
// apps/web/src/types/providers.ts
export interface ProviderConnection {
  id: string;
  user_id: string;
  provider: 'gmail' | 'google_calendar' | 'apple_calendar' | 'outlook';
  scopes: string[];
  connected_at: string;
  last_sync: string | null;
  status: 'active' | 'expired' | 'revoked';
}

export interface EmailInsight {
  id: string;
  provider_email_id: string;
  provider: string;
  category: 'high_priority' | 'client' | 'marketing' | 'personal';
  summary: string;
  tasks_extracted: string[];
  urgency_score: number;
  processed_at: string;
  ai_model_used: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  attendees: string[];
  location?: string;
  description?: string;
  meeting_url?: string;
  conflict_detected?: boolean;
  preparation_suggestions?: string[];
}
```

```typescript
// apps/web/src/types/ai.ts
export interface AITask {
  type: 'email-triage' | 'calendar-analysis' | 'brief-generation' | 'task-planning';
  prompt: string;
  context?: Record<string, any>;
  privacy_level: 'high' | 'medium' | 'low';
  user_preference: 'local' | 'cloud' | 'auto';
}

export interface AIResponse {
  provider: 'ollama' | 'openai' | 'claude';
  model: string;
  response: string;
  confidence_score?: number;
  cost_usd: number;
  response_time_ms: number;
  fallback_used: boolean;
}

export interface CostControl {
  daily_budget_usd: number;
  current_spend: number;
  alert_thresholds: number[];
  auto_actions: {
    at_50_percent: 'warn_user';
    at_80_percent: 'prefer_local_ai';
    at_95_percent: 'disable_cloud_ai'; 
    at_100_percent: 'full_offline_mode';
  };
}
```

### **4. Feature Flag System** ⚡ **MEDIUM PRIORITY**

**Status**: ❌ Not Created  
**Impact**: No way to gradually roll out AI features or quickly disable if issues arise

**Required Implementation**:

```typescript
// apps/web/src/hooks/useFeatureFlags.ts
interface FeatureFlags {
  ai_enhanced_briefs: boolean;
  gmail_integration: boolean;  
  calendar_integration: boolean;
  bidirectional_sync: boolean;
  local_ai_processing: boolean;
  cost_controls: boolean;
  suggestion_learning: boolean;
}

export function useFeatureFlags(): FeatureFlags {
  // Implementation with localStorage/remote config
}
```

### **5. Error Boundary Components** ⚡ **MEDIUM PRIORITY**

**Status**: ❌ Not Created  
**Impact**: AI feature failures could crash entire app

**Required Components**:

```typescript
// apps/web/src/components/AIErrorBoundary.tsx
export function AIErrorBoundary({ children, fallback }: {
  children: React.ReactNode;
  fallback: React.ComponentType<{ error: Error; retry: () => void }>;
}) {
  // Catches AI-related errors, shows fallback UI, allows retry
}
```

---

## 📋 **Immediate Action Plan**

### **Phase 1: Foundation (Days 1-2)**
1. **Database Migrations**
   - [ ] Create and test Sprint 3 migration file
   - [ ] Validate RLS policies work correctly
   - [ ] Add indexes for performance

2. **Environment Setup** 
   - [ ] Obtain Google OAuth credentials
   - [ ] Set up OpenAI API access and billing
   - [ ] Create environment configuration files
   - [ ] Test local AI setup script on team machines

### **Phase 2: Type Safety (Days 3-4)**
1. **TypeScript Interfaces**
   - [ ] Define provider data types
   - [ ] Define AI interaction types
   - [ ] Define cost control types
   - [ ] Update existing components to use new types

2. **Feature Flags**
   - [ ] Implement basic feature flag system
   - [ ] Add flags for all Sprint 3 features
   - [ ] Test enabling/disabling features

### **Phase 3: Error Handling (Days 4-5)**
1. **Error Boundaries**
   - [ ] Create AI-specific error boundary
   - [ ] Create provider API error boundary
   - [ ] Add fallback UI components
   - [ ] Test error scenarios

2. **Testing Infrastructure**
   - [ ] Set up OAuth flow testing
   - [ ] Create AI response mocking
   - [ ] Set up cost tracking tests

---

## ✅ **Definition of Ready for Sprint 3**

Sprint 3 can only begin when ALL of the following are complete:

- [ ] Database migrations created and tested
- [ ] Environment configuration working on all team machines
- [ ] TypeScript interfaces defined and validated
- [ ] Feature flag system implemented
- [ ] Error boundaries created and tested
- [ ] At least one team member has validated local AI setup
- [ ] Google OAuth credentials obtained and tested
- [ ] OpenAI API access confirmed with billing setup
- [ ] Team decision made on MVP vs. full scope approach

**Estimated Time to Complete Prerequisites**: 3-5 days  
**Responsible**: All team members (divide tasks)  
**Blocker Resolution**: Daily check-ins until all items complete

---

## 🎯 **Team Assignments Needed**

**Database & Backend** (1 person, 2 days):
- Create migration files
- Set up environment configuration  
- Test Supabase integration

**Frontend & Types** (1 person, 2 days):
- Define TypeScript interfaces
- Implement feature flags
- Create error boundaries

**Infrastructure & Testing** (1 person, 2 days):
- Validate local AI setup
- Test OAuth flow
- Set up monitoring/logging

**Product & Research** (1 person, ongoing):
- Identify test users (Alex persona types)
- Define success metrics
- Plan user feedback collection

---

**Next Steps**: Assign team members to each category and set completion deadline before Sprint 3 begins! 🚀 