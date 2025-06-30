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

interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: number;
  due_date?: string;
  tags?: string[];
}

// Update task schema
const updateTaskSchema: SchemaValidation = {
  type: 'object',
  required: true,
  properties: {
    id: {
      type: 'string',
      required: true,
      custom: (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    },
    title: {
      type: 'string',
      required: false,
      minLength: 1,
      maxLength: 200
    },
    description: {
      type: 'string',
      required: false,
      maxLength: 2000
    },
    status: {
      type: 'string',
      required: false,
      enum: ['pending', 'in_progress', 'completed', 'archived']
    },
    priority: {
      type: 'number',
      required: false,
      min: 1,
      max: 5
    },
    due_date: {
      type: 'date',
      required: false
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
    if (req.method !== 'PATCH') {
      throw new ValidationError('Method not allowed', { allowedMethods: ['PATCH'] });
    }

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new ValidationError('Missing authorization header');
    }
    const userId = authHeader.replace('Bearer ', '');

    // Rate limiting
    checkRateLimit(`update-task:${userId}`, {
      windowMs: 60 * 1000,  // 1 minute
      maxRequests: 20,      // 20 requests per minute
      message: 'Too many task update attempts. Please try again later.'
    });

    // Parse and validate request body
    const data: UpdateTaskRequest = await req.json();
    validateSchema(data, updateTaskSchema, [], { stripUnknown: true });

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

    // Verify task ownership
    const { data: existingTask, error: fetchError } = await supabaseClient
      .from('tasks')
      .select('user_id')
      .eq('id', data.id)
      .single();

    if (fetchError) {
      throw new ValidationError('Task not found');
    }

    if (existingTask.user_id !== userId) {
      throw new ValidationError('Unauthorized to update this task');
    }

    // Update task
    const { data: updatedTask, error: updateError } = await supabaseClient
      .from('tasks')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedTask
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    return handleError(error, req);
  }
}); 