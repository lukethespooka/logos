# Sprint 3 Environment Configuration Guide

> **Copy the environment variables below to your `.env.local` file and fill in your actual values**

## 🔧 **Existing Configuration (Keep Current Values)**

```bash
# Supabase (keep your existing values)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔐 **OAuth Provider Configurations**

### Gmail & Google Calendar
**Get credentials from:** [Google Developer Console](https://console.developers.google.com/)

```bash
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Gmail scopes (read-only for privacy)
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.labels

# Google Calendar scopes
GOOGLE_CALENDAR_SCOPES=https://www.googleapis.com/auth/calendar.readonly,https://www.googleapis.com/auth/calendar.events
```

### Apple Calendar (iOS/macOS)
**Get credentials from:** [Apple Developer Portal](https://developer.apple.com/)

```bash
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret
APPLE_REDIRECT_URI=http://localhost:5173/auth/apple/callback
```

## 🤖 **AI Router Configuration**

### Local AI (Ollama)
**Install with:** `scripts/setup-local-ai.sh`

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_ENABLED=true
```

### Cloud AI Providers

**OpenAI** - [Get API key](https://platform.openai.com/api-keys)
```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=your_openai_org_id
OPENAI_ENABLED=true
```

**Claude (Optional)** - [Get API key](https://console.anthropic.com/)
```bash
CLAUDE_API_KEY=your_claude_api_key
CLAUDE_ENABLED=false
```

## 💰 **Cost Control Settings**

```bash
# Daily/weekly/monthly budgets (USD)
AI_DAILY_BUDGET_USD=1.00
AI_WEEKLY_BUDGET_USD=5.00
AI_MONTHLY_BUDGET_USD=20.00

# Router behavior
AI_PREFER_LOCAL=true
AI_FALLBACK_ENABLED=true
AI_PRIVACY_MODE=true

# Cost thresholds for routing decisions
AI_LOCAL_THRESHOLD_USD=0.01
AI_CLOUD_THRESHOLD_USD=0.05
```

## 🧠 **Model Configurations**

```bash
# Local models (downloaded by setup script)
LOCAL_EMAIL_MODEL=mistral:7b-instruct
LOCAL_CALENDAR_MODEL=llama3.1:8b
LOCAL_QUICK_MODEL=phi3:mini
LOCAL_CODE_MODEL=codellama:7b

# Cloud models for complex tasks
CLOUD_CREATIVE_MODEL=gpt-4o-mini
CLOUD_COMPLEX_MODEL=gpt-4
CLOUD_FALLBACK_MODEL=gpt-4o-mini
```

## 🚩 **Feature Flags**

```bash
# Sprint 3 features (enable gradually)
FEATURE_EMAIL_INTEGRATION=false
FEATURE_CALENDAR_INTEGRATION=false
FEATURE_AI_SUGGESTIONS=false
FEATURE_LOCAL_AI_ROUTING=true
FEATURE_COST_TRACKING=true
FEATURE_LEARNING_MODE=false

# Daily brief configuration
FEATURE_DAILY_BRIEF=false
DAILY_BRIEF_TIME=08:00
DAILY_BRIEF_MAX_EMAILS=10
```

## 🔒 **Security & Encryption**

```bash
# Generate with: openssl rand -hex 32
OAUTH_ENCRYPTION_KEY=your_32_character_hex_encryption_key
AI_ROUTER_JWT_SECRET=your_32_character_hex_jwt_secret
```

## 🐛 **Development Settings**

```bash
# Logging and debugging
LOG_LEVEL=info
AI_DEBUG_MODE=false
OAUTH_DEBUG_MODE=false

# Mock data for development
USE_MOCK_EMAIL_DATA=false
USE_MOCK_CALENDAR_DATA=false
USE_MOCK_AI_RESPONSES=false

# Cost tracking in development
TRACK_DEV_COSTS=true
DEV_COST_MULTIPLIER=0.1
```

## ⚡ **Performance Tuning**

```bash
# Timeouts (milliseconds)
LOCAL_AI_TIMEOUT_MS=30000
CLOUD_AI_TIMEOUT_MS=60000

# Cache settings (seconds)
AI_RESPONSE_CACHE_TTL_SECONDS=3600
EMAIL_INSIGHTS_CACHE_TTL_SECONDS=1800
CALENDAR_CACHE_TTL_SECONDS=900

# Rate limiting
AI_REQUESTS_PER_MINUTE=60
OAUTH_REFRESH_RATE_LIMIT=10
```

## 📊 **Monitoring (Optional)**

```bash
# Cost alerts
COST_ALERT_WEBHOOK_URL=
COST_ALERT_THRESHOLD_USD=0.50

# Analytics (privacy-focused)
ENABLE_ANONYMOUS_ANALYTICS=false
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true
```

---

## 🛠️ **Setup Instructions**

### 1. Create Environment File
```bash
cp docs/sprint3-env-template.md .env.local.template
# Edit .env.local with your actual values
```

### 2. Generate Encryption Keys
```bash
# OAuth encryption key
openssl rand -hex 32

# AI router JWT secret
openssl rand -hex 32
```

### 3. Setup OAuth Providers

#### Google (Gmail + Calendar)
1. Go to [Google Developer Console](https://console.developers.google.com/)
2. Create new project or select existing
3. Enable Gmail API and Calendar API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:5173/auth/google/callback` to authorized redirect URIs

#### Apple (Calendar)
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create App ID with CalendarKit capability
3. Generate client credentials
4. Configure redirect URI

### 4. Setup Local AI
```bash
# Run the setup script
chmod +x scripts/setup-local-ai.sh
./scripts/setup-local-ai.sh
```

### 5. Verify Configuration
```bash
# Check that all required vars are set
npm run check-env
```

---

## ✅ **Pre-Sprint Checklist**

Before starting Sprint 3 development:

- [ ] All OAuth provider credentials configured
- [ ] Ollama installed and running with required models
- [ ] At least one AI provider (OpenAI or local) working
- [ ] Encryption keys generated (32 hex characters each)
- [ ] Database migration applied (Sprint 3 tables)
- [ ] Feature flags set to appropriate values
- [ ] Cost limits configured appropriately
- [ ] Environment variables validated

---

## ⚠️ **Security Warnings**

- **NEVER** commit `.env.local` to version control
- Use different keys for development vs production
- Rotate OAuth credentials regularly
- Monitor AI costs daily during development
- Enable `OAUTH_ENCRYPTION_KEY` in production
- Review OAuth scopes - use minimal permissions needed

---

## 📋 **Example Values (Development)**

For reference during development setup:

```bash
# Example values (replace with your actual credentials)
GOOGLE_CLIENT_ID=123456789-abcdefgh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret_here
OPENAI_API_KEY=sk-your_actual_openai_key_here
OAUTH_ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef
AI_ROUTER_JWT_SECRET=f9e8d7c6b5a4321098765432109876543210fedcba
``` 