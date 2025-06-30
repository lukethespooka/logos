import { serve } from 'std/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { handleError, ValidationError } from '../_shared/error-handler.ts';
import { validateSchema, checkRateLimit, SchemaValidation } from '../_shared/validation.ts';
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

declare const Deno: {
  env: {
    get(key: keyof Env): string | undefined;
  };
};

// Task creation schema
const createTaskSchema: SchemaValidation = {
  type: 'object',
  required: true,
  properties: {
    title: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 200
    },
    description: {
      type: 'string',
      required: false,
      maxLength: 2000
    },
    due_date: {
      type: 'date',
      required: false
    },
    priority: {
      type: 'number',
      required: false,
      min: 1,
      max: 5
    },
    tags: {
      type: 'array',
      required: false,
      maxLength: 10,
      items: {
        type: 'string',
        maxLength: 50
      }
    }
  }
} as const;

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Validate request method
    if (req.method !== 'POST') {
      throw new ValidationError('Method not allowed', { allowedMethods: ['POST'] });
    }

    // Get request data
    const data = await req.json();

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new ValidationError('Missing authorization header');
    }
    const userId = authHeader.replace('Bearer ', '');

    // Rate limiting
    checkRateLimit(`create-task:${userId}`, {
      windowMs: 60 * 1000,  // 1 minute
      maxRequests: 10,      // 10 requests per minute
      message: 'Too many task creation attempts. Please try again later.'
    });

    // Validate request body
    validateSchema(data, createTaskSchema, [], { stripUnknown: true });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Create task
    const { data: task, error } = await supabaseClient
      .from('tasks')
      .insert({
        ...data,
        user_id: userId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, data: task }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      }
    );

  } catch (error) {
    return handleError(error, req);
  }
}); 