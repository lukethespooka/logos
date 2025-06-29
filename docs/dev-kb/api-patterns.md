# API Design Patterns

This document outlines the standard design patterns for all APIs (Supabase Edge Functions) in the LogOS project. The `@dev` and `@qa` agents must adhere to these patterns.

## Endpoint Naming Convention
- **Pattern:** All endpoints should be kebab-case and grouped by feature.
- **Example:** `/api/v1/daily-brief/generate`, `/api/v1/smart-inbox/cluster`
- **Rationale:** Provides a clear, predictable, and RESTful API structure.

## Request/Response Structure
- **Pattern:** All `POST` and `PUT` requests should use a JSON body. All responses should return a consistent JSON object.
- **Success Response:**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "A descriptive error message."
    }
  }
  ```
- **Rationale:** Ensures a predictable and easy-to-handle interface for the frontend.

## Authentication
- **Pattern:** All endpoints must be authenticated using the Supabase JWT. The user ID should be extracted from the JWT, not passed in the body.
- **Rationale:** Ensures security and prevents one user from accessing or modifying another user's data.

## Versioning
- **Pattern:** The API will be versioned in the URL path (e.g., `/api/v1/...`).
- **Rationale:** Allows for non-breaking changes and a clear upgrade path for clients.

## AI Router Integration
- **Pattern:** All AI-powered endpoints should use the hybrid AI router to determine local vs. cloud processing.
- **Request Headers:**
  ```typescript
  {
    "X-AI-Preference": "local" | "cloud" | "auto", // User preference
    "X-Privacy-Level": "high" | "medium" | "low"   // Content sensitivity
  }
  ```
- **Response Headers:**
  ```typescript
  {
    "X-AI-Provider": "ollama" | "openai" | "claude",  // Actual provider used
    "X-AI-Model": "mistral:7b" | "gpt-4o-mini",       // Model used
    "X-Cost-USD": "0.001234"                          // Actual cost incurred
  }
  ```
- **Rationale:** Provides transparency and cost tracking while respecting user privacy preferences.

## Provider Integration Patterns
- **OAuth Flow Pattern:**
  ```
  POST /api/v1/providers/connect
  Body: { "provider": "gmail", "scopes": ["read", "write"] }
  Response: { "auth_url": "...", "state": "..." }
  
  POST /api/v1/providers/callback
  Body: { "code": "...", "state": "..." }
  Response: { "success": true, "provider": "gmail" }
  ```
- **Data Sync Pattern:**
  ```
  GET /api/v1/providers/gmail/emails?since=2025-01-01
  Response: { "emails": [...], "next_page_token": "..." }
  
  POST /api/v1/providers/gmail/send
  Body: { "to": "...", "subject": "...", "body": "..." }
  ```
- **Rationale:** Standardizes OAuth flows and data access across all provider integrations.

## Error Handling for Provider APIs
- **Pattern:** Handle provider-specific errors gracefully with fallbacks.
- **Provider Error Response:**
  ```json
  {
    "success": false,
    "error": {
      "code": "PROVIDER_ERROR",
      "message": "Gmail API rate limit exceeded",
      "provider": "gmail",
      "retry_after": 3600,
      "fallback_available": true
    }
  }
  ```
- **Rate Limiting Pattern:** Implement exponential backoff for provider API calls.
- **Rationale:** Provides resilient integration that degrades gracefully when external services fail.

## Cost Control Patterns
- **Budget Middleware Pattern:**
  ```typescript
  // All AI endpoints should check budget before processing
  if (await budgetManager.wouldExceedLimit(request)) {
    return fallbackResponse(request);
  }
  ```
- **Cost Tracking:**
  ```json
  {
    "ai_usage": {
      "tokens_used": 1250,
      "cost_usd": 0.0025,
      "model": "mistral:7b-instruct",
      "provider": "local"
    }
  }
  ```
- **Rationale:** Ensures cost control and provides transparency for usage-based billing. 