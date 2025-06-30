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

# Gmail scopes (full access)
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.modify,https://www.googleapis.com/auth/gmail.compose,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.labels

# Google Calendar scopes (full access)
GOOGLE_CALENDAR_SCOPES=https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/calendar.events

# Google Drive scopes (for docs)
GOOGLE_DRIVE_SCOPES=https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/drive.file

# Google Tasks scopes
GOOGLE_TASKS_SCOPES=https://www.googleapis.com/auth/tasks

# Maps & Location scopes
GOOGLE_MAPS_SCOPES=https://www.googleapis.com/auth/maps.embed,https://www.googleapis.com/auth/maps.places,https://www.googleapis.com/auth/maps.places.reviews,https://www.googleapis.com/auth/geolocation

# User info scopes
GOOGLE_USER_SCOPES=https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile
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

## 🗺️ **Maps & Weather Configuration**

### Google Maps Platform
**Get credentials from:** [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
```bash
# Google Maps API Keys
GOOGLE_MAPS_API_KEY=your_maps_api_key
GOOGLE_PLACES_API_KEY=your_places_api_key
GOOGLE_GEOCODING_API_KEY=your_geocoding_api_key

# Optional Maps Configuration
GOOGLE_MAPS_DEFAULT_CENTER=37.7749,-122.4194
GOOGLE_MAPS_DEFAULT_ZOOM=12
GOOGLE_MAPS_LANGUAGE=en
GOOGLE_MAPS_REGION=US
```

### Weather Services
**Choose one or more providers:**

**OpenWeatherMap** - [Get API key](https://openweathermap.org/api)
```bash
OPENWEATHER_API_KEY=your_openweather_api_key
OPENWEATHER_UNITS=metric # or imperial
```

**WeatherAPI** - [Get API key](https://www.weatherapi.com/)
```bash
WEATHERAPI_KEY=your_weatherapi_key
WEATHERAPI_DAYS_FORECAST=7
```

**Tomorrow.io** - [Get API key](https://www.tomorrow.io/weather-api/)
```bash
TOMORROW_API_KEY=your_tomorrow_api_key
TOMORROW_UNITS=metric # or imperial
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

## Required Environment Variables

### OAuth Configuration
```bash
# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback/google

# Security
ENCRYPTION_KEY=your_secure_encryption_key  # Must be at least 32 characters
TOKEN_ENCRYPTION_KEY=${ENCRYPTION_KEY}     # For backwards compatibility
SESSION_SECRET=your_secure_session_secret

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

## Security Requirements

### Encryption Key Generation
For production, generate a secure encryption key:

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Key Requirements
- ENCRYPTION_KEY: Must be at least 32 characters
- SESSION_SECRET: Must be at least 32 characters
- All secrets should be randomly generated
- Never reuse keys across environments

### Key Rotation
The system supports key rotation through the `rotateTokenEncryption` utility:
1. Generate a new encryption key
2. Set both old and new keys in environment
3. Run the rotation script (to be implemented)
4. Remove old key after successful rotation

### Security Measures
- All OAuth tokens are encrypted at rest using AES-GCM
- Encryption uses unique salt and IV per token
- PBKDF2 key derivation with 100,000 iterations
- Automatic token refresh handling
- Circuit breaker pattern for external services
- Request correlation IDs for debugging
- Standardized error handling

## Local Development Setup

1. Copy this template to `.env.local`:
```bash
cp docs/sprint3-env-template.md .env.local
```

2. Generate secure keys:
```bash
# Generate encryption key
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env.local

# Generate session secret
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env.local
```

3. Set up OAuth credentials:
- Go to Google Cloud Console
- Create OAuth 2.0 credentials
- Add authorized redirect URIs
- Copy client ID and secret to .env.local

4. Validate setup:
```bash
# Start the development server
npm run dev

# Test encryption
curl http://localhost:5173/api/test-encryption
```

## Production Deployment

### Required Actions
1. Use a secure key management service
2. Set up automated key rotation
3. Enable request rate limiting
4. Configure proper CORS policies
5. Set up monitoring for:
   - Failed encryption/decryption attempts
   - Circuit breaker state changes
   - Token refresh failures
   - Request correlation tracking

### Security Checklist
- [ ] Secure key generation
- [ ] Key rotation plan
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Error monitoring
- [ ] Access logging
- [ ] Audit trail
- [ ] Backup strategy 