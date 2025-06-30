import { ValidationError } from './error-handler.ts';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  message?: string;  // Custom error message
}

// In-memory store for rate limiting
// In production, use Redis or similar for distributed rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 */
export function checkRateLimit(key: string, config: RateLimitConfig): void {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    // First request
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return;
  }

  if (record.resetTime <= now) {
    // Window expired, reset counter
    record.count = 1;
    record.resetTime = now + config.windowMs;
    return;
  }

  if (record.count >= config.maxRequests) {
    const waitTime = Math.ceil((record.resetTime - now) / 1000);
    throw new ValidationError(
      config.message || `Rate limit exceeded. Please try again in ${waitTime} seconds.`,
      {
        retryAfter: waitTime,
        limit: config.maxRequests,
        window: config.windowMs / 1000
      }
    );
  }

  record.count++;
}

/**
 * Schema validation types and utilities
 */
export type SchemaType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'url'
  | 'uuid'
  | 'array'
  | 'object';

export interface SchemaValidation {
  type: SchemaType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  items?: SchemaValidation;  // For array type
  properties?: Record<string, SchemaValidation>;  // For object type
  custom?: (value: any) => boolean | string;  // Custom validation function
}

export interface ValidationOptions {
  stripUnknown?: boolean;  // Remove unknown properties
  abortEarly?: boolean;    // Stop on first error
}

/**
 * Validate a value against a schema
 */
export function validateSchema(
  value: unknown,
  schema: SchemaValidation,
  path: string[] = [],
  options: ValidationOptions = {}
): void {
  // Check required
  if (schema.required && (value === undefined || value === null)) {
    throw new ValidationError(`${path.join('.')} is required`);
  }

  // Skip validation if value is not required and not provided
  if (value === undefined || value === null) {
    return;
  }

  // Type validation
  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        throw new ValidationError(`${path.join('.')} must be a string`);
      }
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        throw new ValidationError(`${path.join('.')} must be at least ${schema.minLength} characters`);
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        throw new ValidationError(`${path.join('.')} must be at most ${schema.maxLength} characters`);
      }
      if (schema.pattern && !schema.pattern.test(value)) {
        throw new ValidationError(`${path.join('.')} has invalid format`);
      }
      if (schema.enum && !schema.enum.includes(value)) {
        throw new ValidationError(`${path.join('.')} must be one of: ${schema.enum.join(', ')}`);
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        throw new ValidationError(`${path.join('.')} must be a number`);
      }
      if (schema.min !== undefined && value < schema.min) {
        throw new ValidationError(`${path.join('.')} must be at least ${schema.min}`);
      }
      if (schema.max !== undefined && value > schema.max) {
        throw new ValidationError(`${path.join('.')} must be at most ${schema.max}`);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new ValidationError(`${path.join('.')} must be a boolean`);
      }
      break;

    case 'date':
      const date = new Date(value as any);
      if (isNaN(date.getTime())) {
        throw new ValidationError(`${path.join('.')} must be a valid date`);
      }
      break;

    case 'email':
      if (typeof value !== 'string' || !isValidEmail(value)) {
        throw new ValidationError(`${path.join('.')} must be a valid email address`);
      }
      break;

    case 'url':
      if (typeof value !== 'string' || !isValidUrl(value)) {
        throw new ValidationError(`${path.join('.')} must be a valid URL`);
      }
      break;

    case 'uuid':
      if (typeof value !== 'string' || !isValidUuid(value)) {
        throw new ValidationError(`${path.join('.')} must be a valid UUID`);
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        throw new ValidationError(`${path.join('.')} must be an array`);
      }
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        throw new ValidationError(`${path.join('.')} must contain at least ${schema.minLength} items`);
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        throw new ValidationError(`${path.join('.')} must contain at most ${schema.maxLength} items`);
      }
      if (schema.items) {
        value.forEach((item, index) => {
          validateSchema(item, schema.items!, [...path, index.toString()], options);
        });
      }
      break;

    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        throw new ValidationError(`${path.join('.')} must be an object`);
      }
      if (schema.properties) {
        const valueObj = value as Record<string, unknown>;
        
        // Check required properties
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          validateSchema(valueObj[key], propSchema, [...path, key], options);
        }

        // Remove unknown properties if stripUnknown is true
        if (options.stripUnknown) {
          for (const key of Object.keys(valueObj)) {
            if (!schema.properties[key]) {
              delete valueObj[key];
            }
          }
        }
      }
      break;
  }

  // Custom validation
  if (schema.custom) {
    const result = schema.custom(value);
    if (result !== true) {
      throw new ValidationError(
        typeof result === 'string' ? result : `${path.join('.')} failed custom validation`
      );
    }
  }
}

// Helper functions for validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  id: {
    type: 'string' as const,
    required: true,
    custom: isValidUuid
  },
  email: {
    type: 'email' as const,
    required: true,
    maxLength: 255
  },
  url: {
    type: 'url' as const,
    required: true,
    maxLength: 2048
  },
  date: {
    type: 'date' as const,
    required: true
  },
  pagination: {
    type: 'object' as const,
    properties: {
      limit: {
        type: 'number',
        min: 1,
        max: 100,
        required: false
      },
      offset: {
        type: 'number',
        min: 0,
        required: false
      }
    }
  }
}; 