import { corsHeaders } from './cors.ts';

// Custom error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Error response format
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    request_id?: string;
  };
}

// Generate a unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Main error handler
export async function handleError(error: unknown, request?: Request): Promise<Response> {
  console.error('Error:', error);
  
  const requestId = generateRequestId();
  let errorResponse: ErrorResponse;

  if (error instanceof AppError) {
    errorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        request_id: requestId
      }
    };
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: error.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  if (error instanceof ValidationError) {
    errorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details,
        request_id: requestId
      }
    };
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  if (error instanceof AuthError) {
    errorResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: error.message,
        request_id: requestId
      }
    };
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  if (error instanceof DatabaseError) {
    errorResponse = {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: error.message,
        request_id: requestId
      }
    };
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // Handle other types of errors
  errorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      request_id: requestId
    }
  };

  // Log request details in case of unexpected errors
  if (request) {
    console.error('Request details:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });
  }

  return new Response(
    JSON.stringify(errorResponse),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// Request validation helper
export function validateRequest(data: unknown, requirements: Record<string, (value: any) => boolean>): void {
  const errors: Record<string, string> = {};

  for (const [field, validator] of Object.entries(requirements)) {
    if (!validator((data as any)?.[field])) {
      errors[field] = `Invalid or missing ${field}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

// Common validation functions
export const validators = {
  required: (value: unknown) => value !== undefined && value !== null && value !== '',
  string: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
  number: (value: unknown) => typeof value === 'number' && !isNaN(value),
  boolean: (value: unknown) => typeof value === 'boolean',
  email: (value: unknown) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  date: (value: unknown) => !isNaN(Date.parse(value as string)),
  array: (value: unknown) => Array.isArray(value),
  uuid: (value: unknown) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}; 