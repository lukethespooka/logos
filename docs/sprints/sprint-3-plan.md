# Sprint 3 Plan: Hybrid AI Integration & Bidirectional Sync

**Sprint Goal:** Transform LogOS into an intelligent productivity co-pilot using hybrid local/cloud AI with bidirectional email, calendar, and document synchronization while maintaining privacy and cost efficiency.

**Timeline:** Week 9 - Week 14 (Realistic timeline for production-ready hybrid AI integration)

## ⚠️ **Critical Implementation Gaps Identified**

### **Missing Foundation Components**
- **Database Migrations**: New tables (`provider_connections`, `email_insights`, `ai_interactions`, `suggestion_metrics`) not yet created
- **Environment Configuration**: OAuth credentials, AI preferences, cost controls need centralized config
- **TypeScript Interfaces**: Provider data types, AI routing configs, hybrid response types missing
- **Testing Strategy**: No OAuth flow testing, AI routing validation, or provider resilience testing defined
- **Security Implementation**: Token encryption, prompt injection prevention, rate limiting not implemented

### **Risk Mitigation Gaps**
- **Failure Scenarios**: What happens when local AI fails, OAuth expires, or provider APIs are down?
- **Cost Overrun Protection**: Real-time budget monitoring and automatic fallbacks not implemented
- **Development Experience**: No mock modes for developers without full AI stack
- **Feature Flags**: No gradual rollout mechanism for hybrid AI features

### **UX Journey Missing**
- **Onboarding Flow**: OAuth consent, AI preference selection, privacy explanation
- **Progressive Enhancement**: How to introduce AI features without overwhelming users
- **Cost Transparency**: Users should see their AI usage and understand trade-offs

---

## Current State Assessment

✅ **Completed Foundation (Sprints 1-2):**
- Complete task management system (CRUD, search, filter, subtasks)
- Hierarchical task display with expand/collapse functionality
- Enhanced dashboard with 2-column layout and visual celebrations
- Comprehensive navigation (QuickNavDock, breadcrumbs, keyboard shortcuts)
- Settings reorganization with keyboard shortcuts documentation
- Configurable inactive notifications and focus mode
- Stable backend with proper CORS and error handling
- Responsive UI with accessibility features and smooth animations

🎯 **Sprint 3 Focus:** Implement core LogOS blueprint vision with hybrid AI architecture

---

## 🎯 **Team Discussion: MVP vs. Full Implementation**

### **Current Scope Challenge**
Our Sprint 3 plan is ambitious with **5 major user stories** covering OAuth, hybrid AI, email/calendar integration, learning systems, and bidirectional sync. **This is realistically 6-8 weeks of production-ready work, not 4 weeks.**

### **MVP-First Recommendation**

**Proposed MVP Focus**: **AI-Enhanced Daily Brief** as single killer feature

**Why This Approach:**
- ✅ **Demonstrates core value**: Real AI insights using real data
- ✅ **Validates hybrid architecture**: Tests local/cloud routing in production
- ✅ **Manageable scope**: One feature done exceptionally well
- ✅ **User feedback loop**: Learn before building more features
- ✅ **Technical foundation**: OAuth + AI router + provider integration

**MVP User Story**: 
*"As Alex, I want my daily brief to analyze my real emails and calendar to provide actionable insights that help me start each day with clarity and focus."*

### **MVP Implementation (4 weeks)**
- **Week 1**: Local AI setup + basic Google OAuth (read-only Gmail/Calendar)
- **Week 2**: Email processing with local AI triage + calendar analysis  
- **Week 3**: Enhanced DailyBriefWidget with real data + cost controls
- **Week 4**: Polish, testing, and user feedback collection

### **Full Implementation (Post-MVP)**
- **Phase 2**: Bidirectional sync (send emails, create calendar events)
- **Phase 3**: Smart context suggestions with learning
- **Phase 4**: Global AI search across all data
- **Phase 5**: Advanced calendar management features

### **Team Decision Framework**

**Decision 1: Scope Strategy** 🎯 **NEEDS TEAM INPUT**
- **Option A**: MVP-first (AI-Enhanced Daily Brief only) - Lower risk, faster feedback
- **Option B**: Full scope (all 5 user stories) - Higher value, higher risk
- **Decision Criteria**: Team capacity, risk tolerance, timeline flexibility

**Decision 2: Timeline Management**
- **4 weeks**: MVP only, focus on one killer feature
- **6 weeks**: Full implementation with all features
- **Hybrid**: MVP in 4 weeks, iterate based on feedback

**Decision 3: Technical Implementation**
- **Local AI Priority**: Start with hybrid architecture or cloud-first then migrate?
- **Provider Strategy**: Google-only initially or multi-provider from start?
- **Testing Approach**: Manual testing or automated OAuth/AI testing?

**Decision 4: User Validation**
- **Test Users**: Do we have Alex persona types available for feedback?
- **Success Metrics**: How do we measure AI feature effectiveness?
- **Iteration Plan**: How quickly can we pivot based on user feedback?

### **Immediate Team Action Items** ⚡

**Before Sprint 3 Starts:**
1. **Team Vote**: MVP-first vs. full scope approach
2. **Resource Check**: Who can work on OAuth implementation?  
3. **Infrastructure Review**: Docker/AI setup capacity on team machines
4. **User Research**: Identify 3-5 Alex-type users for testing
5. **Risk Appetite**: Agree on acceptable failure scenarios and rollback plans

**Week 1 Prerequisites:**
1. **Environment Setup**: Google OAuth credentials obtained
2. **OpenAI Access**: API keys and billing setup
3. **Local AI Testing**: At least one team member validates `./scripts/setup-local-ai.sh`
4. **Database Plan**: Agree on migration strategy for new tables
5. **Feature Flags**: Implement basic on/off switches for AI features

---

## User Stories

### Story 0: As Alex, I want secure access to my email, calendar, and documents so LogOS can provide intelligent insights while protecting my privacy.

**Acceptance Criteria:**
- OAuth integration with Google (Gmail, Calendar, Docs) and Apple (iCloud, Calendar)
- Bidirectional sync capabilities (read and write permissions)
- Privacy-first approach: sensitive data processed locally, creative tasks in cloud
- User-controlled permissions with easy disconnect options
- Secure token management and refresh handling

**Tasks:**
- **`@dev`**: Implement Google OAuth with Gmail, Calendar, Docs read/write scopes
- **`@dev`**: Set up Apple integration (CalDAV/CardDAV for calendar, limited mail API)
- **`@dev`**: Create secure token storage and refresh system
- **`@dev`**: Build privacy consent UI with granular permissions
- **`@dev`**: Implement bidirectional sync foundation
- **`@qa`**: Test OAuth flows, token security, and permission management

### Story 1: As Alex, I want AI-generated daily briefs using my real email and calendar data so I can start each day with relevant, actionable insights.

**Acceptance Criteria:**
- `DailyBriefWidget` displays AI-generated summary using real email/calendar data
- Brief includes: priority emails, calendar conflicts, task recommendations
- Processes overnight emails for intelligent clustering and priority assessment
- "Regenerate" button provides fresh perspective with updated data
- Local AI processing for privacy-sensitive calendar/email analysis
- Cloud AI for creative brief generation and natural language summaries

**Tasks:**
- **`@dev`**: Set up local LLM stack (Ollama + Docker) with recommended models
- **`@dev`**: Implement hybrid AI router (local for privacy, cloud for creativity)
- **`@dev`**: Create email processing pipeline with local triage (Mistral 7B)
- **`@dev`**: Build calendar analysis with conflict detection (LLaMA 3.1 8B)
- **`@dev`**: Enhanced `DailyBriefWidget` with real data integration
- **`@dev`**: Implement cost controls and usage monitoring
- **`@qa`**: Test hybrid AI routing, data accuracy, and privacy compliance

### Story 2: As Alex, I want my email inbox intelligently organized and actionable so I can quickly identify what needs my attention.

**Acceptance Criteria:**
- `PrioritizedInboxWidget` displays real Gmail data with AI clustering
- Email categories: High Priority, Client Communication, Marketing, Personal
- AI extracts actionable tasks from emails and suggests task creation
- Local AI processing for email content analysis (privacy-sensitive)
- Bidirectional capabilities: mark as read, archive, create drafts
- Integration with task system for seamless workflow

**Tasks:**
- **`@dev`**: Replace mock data with real Gmail API integration
- **`@dev`**: Implement local email triage using Mistral 7B for categorization
- **`@dev`**: Build task extraction pipeline from email content
- **`@dev`**: Create email action handlers (mark read, archive, draft)
- **`@dev`**: Design email-to-task conversion workflow
- **`@qa`**: Test email categorization accuracy and task creation flow

### Story 3: As Alex, I want intelligent context-aware suggestions that learn from my behavior so the app proactively helps me stay productive.

**Acceptance Criteria:**
- `ContextRibbon` analyzes current state and suggests relevant actions
- Suggestions include: "Review priority emails", "Prep for next meeting", "Plan focused work block"
- Context awareness based on: real calendar events, email urgency, task deadlines
- Suggestions learn from user behavior patterns (clicked vs. ignored)
- Integration with Focus Mode for ADHD-friendly cognitive load management
- Maximum 2-3 suggestions to avoid cognitive overload

**Tasks:**
- **`@dev`**: Implement context analysis engine using real email/calendar data
- **`@dev`**: Create suggestion algorithms based on meeting proximity and email urgency
- **`@dev`**: Build learning system tracking suggestion effectiveness
- **`@dev`**: Integrate with Focus Mode for adaptive suggestion timing
- **`@dev`**: Design suggestion UI with clear, actionable call-to-actions
- **`@qa`**: Test suggestion relevance, learning behavior, and Focus Mode integration

### Story 4: As Alex, I want global AI-powered search across all my data so I can find anything instantly with natural language.

**Acceptance Criteria:**
- ⌘K command palette includes hybrid AI search across tasks, emails, calendar, documents
- Natural language queries: "Find emails about the Johnson project", "Show tomorrow's meetings"
- Local AI for privacy-sensitive searches (email content, calendar details)
- Cloud AI for complex reasoning and action interpretation
- Search results ranked by relevance with smart suggestions
- Direct actions: "Create task from this email", "Schedule meeting about this"

**Tasks:**
- **`@dev`**: Enhance command palette with hybrid AI search integration
- **`@dev`**: Implement local search using Phi3 for email/calendar queries
- **`@dev`**: Create cross-platform indexing (tasks, emails, calendar, docs)
- **`@dev`**: Build cloud AI integration for complex query interpretation
- **`@dev`**: Implement search-to-action workflows with bidirectional sync
- **`@qa`**: Test search accuracy, privacy compliance, and action execution

### Story 5: As Alex, I want intelligent calendar management with real-time conflict detection and meeting preparation.

**Acceptance Criteria:**
- `UpcomingScheduleWidget` displays real calendar data with conflict detection
- AI suggests meeting preparation based on attendees and agenda
- Automatic focus block scheduling around existing meetings
- Smart meeting insights: "This conflicts with your focus time preference"
- Bidirectional calendar management: create, edit, delete events
- Integration with email for meeting-related communications

**Tasks:**
- **`@dev`**: Replace mock data with real Google/Apple calendar integration
- **`@dev`**: Implement local conflict detection using LLaMA 3.1 8B
- **`@dev`**: Build meeting preparation suggestions based on email context
- **`@dev`**: Create focus block scheduling algorithm around real meetings
- **`@dev`**: Implement bidirectional calendar operations (create/edit/delete)
- **`@qa`**: Test calendar accuracy, conflict detection, and bidirectional sync

---

## Technical Implementation

### Hybrid AI Architecture
```
Frontend (React) → AI Router → Local LLM (Ollama)
                            ↘ Cloud LLM (OpenAI)
                 ↘ Supabase Edge Functions → Provider APIs (Gmail/Calendar)
                 ↘ Vector Database (pgvector) → Semantic Search
```

### Local LLM Stack (Ollama + Docker)
```yaml
# Recommended Local Models
mistral:7b-instruct   # Email triage, privacy-sensitive tasks (4.1GB)
llama3.1:8b          # Calendar analysis, conflict detection (4.7GB)  
phi3:mini            # Quick Q&A, fast responses (2.3GB)
codellama:7b         # Code tasks, debugging (3.8GB)
```

### AI Task Routing Strategy
```typescript
interface AITaskRouter {
  // Privacy-sensitive: Local LLM (90% of tasks)
  'email-triage': 'local',
  'calendar-analysis': 'local',
  'document-processing': 'local',
  'meeting-notes': 'local',
  
  // Creative/Complex: Cloud LLM (10% of tasks)
  'email-drafting': 'cloud',
  'task-planning': 'cloud',
  'complex-reasoning': 'cloud'
}
```

### Provider Integration (Bidirectional)
```typescript
interface ProviderCapabilities {
  gmail: {
    read: ['emails', 'labels', 'threads'],
    write: ['send', 'draft', 'label', 'archive', 'delete']
  },
  googleCalendar: {
    read: ['events', 'calendars', 'attendees'],
    write: ['create', 'update', 'delete', 'invite']
  },
  googleDocs: {
    read: ['content', 'comments', 'metadata'],
    write: ['create', 'edit', 'comment', 'share']
  }
}
```

### Updated Data Models
```sql
-- OAuth tokens and provider connections
CREATE TABLE provider_connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider TEXT, -- 'gmail', 'google_calendar', 'apple_calendar'
  access_token TEXT ENCRYPTED,
  refresh_token TEXT ENCRYPTED,
  expires_at TIMESTAMP,
  scopes TEXT[],
  connected_at TIMESTAMP DEFAULT NOW()
);

-- Email processing results (not storing full content)
CREATE TABLE email_insights (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email_id TEXT, -- Provider email ID
  category TEXT, -- 'high_priority', 'client', 'marketing'
  summary TEXT,
  tasks_extracted TEXT[],
  processed_at TIMESTAMP DEFAULT NOW()
);

-- AI interaction tracking with hybrid routing
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  interaction_type TEXT, -- 'brief', 'search', 'suggestion'
  ai_provider TEXT, -- 'local', 'openai', 'claude'
  model_used TEXT, -- 'mistral:7b', 'gpt-4o-mini'
  query TEXT,
  response JSONB,
  feedback INTEGER, -- -1, 0, 1 for learning
  cost_usd DECIMAL(8,4), -- Track actual costs
  created_at TIMESTAMP DEFAULT NOW()
);

-- Suggestion effectiveness tracking
CREATE TABLE suggestion_metrics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  suggestion_type TEXT,
  context JSONB, -- time_of_day, focus_mode, recent_activity
  clicked BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Cost Optimization Strategy
- **Target**: <$1/day per user (vs. original $5/day)
- **Local compute**: 90% of tasks processed locally
- **Cloud usage**: Only for creative tasks, heavily cached
- **Fallbacks**: Static content when budget limits reached
- **Monitoring**: Real-time cost tracking with automatic controls

---

## Implementation Timeline Options

### **Option A: MVP-First Timeline (4 weeks) 🎯 RECOMMENDED**

**Week 1: Foundation & Local AI**
**Day 1-2: Critical Foundation Work**
- Create database migrations for new tables (`provider_connections`, `ai_interactions`)
- Set up environment configuration for OAuth and AI settings
- Define TypeScript interfaces for provider data and AI responses
- Create feature flags for gradual AI rollout

**Day 3-5: Local AI Infrastructure**
- Docker + Ollama setup with recommended models (using `./scripts/setup-local-ai.sh`)
- Basic AI router implementation with fallback mechanisms
- Cost tracking and budget controls implementation

**Day 6-7: OAuth Foundation**
- Google OAuth setup (Gmail + Calendar read-only)
- Secure token storage with encryption
- Basic privacy consent UI

**Week 2: Email & Calendar Integration**
**Day 1-3: Email Processing**
- Gmail API integration with error handling
- Local AI email triage using Mistral 7B
- Email categorization pipeline with fallbacks

**Day 4-7: Calendar Analysis**
- Google Calendar API integration
- Local AI calendar analysis using LLaMA 3.1
- Conflict detection and meeting preparation insights

**Week 3: AI-Enhanced Daily Brief**
**Day 1-4: Real Data Integration**
- Enhanced DailyBriefWidget with real email/calendar data
- Hybrid AI routing for brief generation
- Cost monitoring and automatic fallbacks

**Day 5-7: Polish & Error Handling**
- Comprehensive error boundaries for AI failures
- OAuth token refresh handling
- User-friendly error messages and fallbacks

**Week 4: Testing & User Feedback**
**Day 1-3: Testing & Validation**
- OAuth flow testing across different scenarios
- AI routing reliability testing
- Cost control validation

**Day 4-7: User Experience & Feedback**
- Polish onboarding flow and privacy messaging
- Deploy to test users (Alex persona types)
- Collect feedback for post-MVP features

### **Option B: Full Implementation Timeline (6 weeks)**

**Weeks 1-4: As above (MVP)**
**Week 5: Bidirectional Features**
- Email sending and drafting capabilities
- Calendar event creation and editing
- Smart context suggestions with learning

**Week 6: Advanced Features**
- Global AI search across all data
- Advanced learning algorithms
- Complete testing and optimization

### **Critical Foundation Tasks (Must Do First)**
```sql
-- Database migrations needed
CREATE TABLE provider_connections (...);
CREATE TABLE email_insights (...);
CREATE TABLE ai_interactions (...);
CREATE TABLE suggestion_metrics (...);
```

```typescript
// TypeScript interfaces needed  
interface ProviderConnection { ... }
interface EmailInsight { ... }
interface AIResponse { ... }
interface CostControl { ... }
```

```bash
# Environment configuration needed
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
OPENAI_API_KEY=
DAILY_AI_BUDGET_USD=1.00
DEFAULT_AI_PREFERENCE=local
```

---

## Sprint Review Goals
- **Real Data Integration**: All widgets display actual email/calendar data
- **Privacy-First AI**: Sensitive data processed locally, creative tasks in cloud
- **Bidirectional Sync**: Users can read and write across all integrated platforms
- **Smart Context**: ContextRibbon learns from behavior and provides relevant suggestions
- **Cost Efficiency**: Total AI costs under $1/day per active user
- **ADHD-Friendly**: Focus Mode integration reduces cognitive overload

---

## Success Metrics (Blueprint-Aligned)
- **Primary**: Focus blocks completed and tasks completed (blueprint metrics)
- **AI Engagement**: >40% of users interact with AI features daily
- **Suggestion Effectiveness**: >40% click-through rate for learned suggestions
- **Search Accuracy**: >70% of natural language searches return relevant results
- **Performance**: Local AI <2s, Cloud AI <5s response times
- **Cost Control**: <$1/day per user with 90% local processing
- **Privacy Compliance**: 100% sensitive data processed locally

---

## Comprehensive Risk Mitigation

### **Technical Failure Scenarios**
```typescript
interface FailureStrategy {
  local_ai_down: {
    detection: "Health check fails 3 times";
    response: "Fall back to cloud AI or static content";
    user_message: "Local AI unavailable, using cloud processing";
  };
  
  cloud_budget_exceeded: {
    detection: "Daily spend > $1.00";
    response: "Disable creative features, local-only mode";
    user_message: "Daily AI budget reached, switching to offline mode";
  };
  
  oauth_token_expired: {
    detection: "Provider API returns 401";
    response: "Automatic refresh → re-auth flow → readonly mode";
    user_message: "Please reconnect your Google account";
  };
  
  provider_api_down: {
    detection: "Provider returns 5xx errors";
    response: "Use cached data, retry with exponential backoff";
    user_message: "Gmail temporarily unavailable, showing cached data";
  };
}
```

### **Cost Control Implementation**
```typescript
interface CostControl {
  daily_budget_usd: 1.00;
  alert_thresholds: [0.5, 0.8, 0.95]; // 50%, 80%, 95%
  auto_actions: {
    at_50_percent: "warn_user";
    at_80_percent: "prefer_local_ai";
    at_95_percent: "disable_cloud_ai";
    at_100_percent: "full_offline_mode";
  };
  manual_overrides: {
    allow_budget_increase: boolean;
    emergency_cloud_access: boolean;
  };
}
```

### **Privacy & Security Risks**
- **Prompt Injection**: Sanitize all user inputs before AI processing
- **Token Security**: Encrypt OAuth tokens at rest, secure transmission
- **Data Retention**: Auto-delete email content after processing, keep only insights
- **User Consent**: Clear opt-in for AI processing, easy disconnect options

### **Development & Deployment Risks**
- **Local AI Setup Complexity**: Docker installation issues, model download failures
- **Development Environment**: Mock modes for devs without full AI stack
- **Feature Flag Management**: Gradual rollout to prevent widespread failures
- **Rollback Strategy**: Quick disable switches for problematic AI features

### **User Experience Risks**
- **Overwhelming Features**: Progressive disclosure, start with basic AI
- **Privacy Concerns**: Clear explanation of local vs cloud processing
- **Performance Expectations**: Set realistic expectations for AI response times
- **Cost Transparency**: Show users their AI usage and costs

### **Business Continuity**
- **Vendor Lock-in**: Design provider-agnostic APIs for email/calendar
- **Regulatory Changes**: GDPR, privacy law compliance for AI processing
- **Competitive Response**: Other apps adding similar AI features
- **User Adoption**: What if users don't value AI features? 