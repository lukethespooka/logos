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

## Validation & Security

### Input Validation
- **Pattern:** All endpoints must use the shared validation utility (`_shared/validation.ts`).
- **Schema Validation:**
  ```typescript
  import { validateInput } from '../_shared/validation';
  
  const taskSchema = {
    title: { type: 'string', required: true, maxLength: 100 },
    description: { type: 'string', maxLength: 1000 },
    dueDate: { type: 'date', required: true },
    priority: { type: 'number', min: 1, max: 5 }
  };
  
  // In your handler:
  const validatedData = await validateInput(request.body, taskSchema);
  ```
- **Rate Limiting:**
  - Create Task: 10 requests/minute
  - Update Task: 20 requests/minute
  - Get Tasks: 30 requests/minute
  - Delete Task: 10 requests/minute
  - Status Updates: 30 requests/minute
- **Input Sanitization:** All string inputs are automatically sanitized for XSS and SQL injection.

### Error Handling
- **Pattern:** Use the shared error handler (`_shared/error-handler.ts`).
- **Standard Error Codes:**
  ```typescript
  export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
  }
  ```
- **Error Response Format:**
  ```typescript
  throw new ApiError({
    code: ErrorCode.VALIDATION_ERROR,
    message: 'Invalid task data provided',
    details: validationErrors // Optional detailed error info
  });
  ```

### Circuit Breakers
- **Pattern:** Use the shared circuit breaker (`_shared/circuit-breaker.ts`) for external service calls.
- **Configuration:**
  ```typescript
  const breaker = new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 30000,
    fallbackFn: async () => ({ ... }) // Fallback response
  });
  ```
- **Usage:**
  ```typescript
  const result = await breaker.execute(() => externalApiCall());
  ```

### Request Correlation
- **Pattern:** All requests must include a correlation ID for tracing.
- **Header:** `X-Correlation-ID: uuid`
- **Logging:** All errors are logged with the correlation ID.

### Authentication & Authorization
- **Pattern:** All endpoints must verify authentication and check permissions.
- **JWT Validation:** Verify Supabase JWT token.
- **Ownership Checks:** Verify user owns or has access to the resource.
- **Example:**
  ```typescript
  const userId = await validateAuth(request);
  await verifyOwnership(userId, resourceId);
  ```

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