// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"
import { corsHeaders } from '../_shared/cors.ts'
import { handleError, ValidationError } from '../_shared/error-handler.ts'
import { validateSchema, checkRateLimit, SchemaValidation } from '../_shared/validation.ts'
import { serve } from 'std/http/server.ts'

console.log("Starting update-task-status function...")

interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

declare const Deno: {
  env: {
    get(key: keyof Env): string | undefined
  }
}

// Status update schema
const statusUpdateSchema: SchemaValidation = {
  type: 'object',
  required: true,
  properties: {
    id: {
      type: 'string',
      required: true,
      custom: (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    },
    status: {
      type: 'string',
      required: true,
      enum: ['pending', 'in_progress', 'completed', 'archived']
    },
    completion_notes: {
      type: 'string',
      required: false,
      maxLength: 1000
    }
  }
} as const

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Validate request method
    if (req.method !== 'PATCH') {
      throw new ValidationError('Method not allowed', { allowedMethods: ['PATCH'] })
    }

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new ValidationError('Missing authorization header')
    }
    const userId = authHeader.replace('Bearer ', '')

    // Rate limiting
    checkRateLimit(`update-task-status:${userId}`, {
      windowMs: 60 * 1000,  // 1 minute
      maxRequests: 30,      // 30 requests per minute
      message: 'Too many status update attempts. Please try again later.'
    })

    // Parse and validate request body
    const data = await req.json()
    validateSchema(data, statusUpdateSchema, [], { stripUnknown: true })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Verify task ownership
    const { data: existingTask, error: fetchError } = await supabaseClient
      .from('tasks')
      .select('user_id, status')
      .eq('id', data.id)
      .single()

    if (fetchError) {
      throw new ValidationError('Task not found')
    }

    if (existingTask.user_id !== userId) {
      throw new ValidationError('Unauthorized to update this task')
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      status: data.status,
      updated_at: new Date().toISOString()
    }

    // Add completion-specific fields
    if (data.status === 'completed') {
      updateData.completed_at = new Date().toISOString()
      if (data.completion_notes) {
        updateData.completion_notes = data.completion_notes
      }
    }

    // Add archival timestamp
    if (data.status === 'archived') {
      updateData.archived_at = new Date().toISOString()
    }

    // Update task status
    const { data: updatedTask, error: updateError } = await supabaseClient
      .from('tasks')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedTask,
        previous_status: existingTask.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return handleError(error, req)
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/update-task-status' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
