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