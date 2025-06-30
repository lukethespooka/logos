// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { handleError, ValidationError, AuthError, DatabaseError } from '../_shared/error-handler.ts'
import { checkRateLimit } from '../_shared/validation.ts'
import { ServiceRegistry } from '../_shared/service-registry.ts'
import { decryptToken } from '../_shared/encryption.ts'
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { corsHeaders, handleCors, wrapResponse } from '../_shared/cors.ts'

console.log("Starting get-tasks function...")
console.log("Listening on http://localhost:9999/")

// Initialize service registry
const registry = ServiceRegistry.getInstance()

// Initialize circuit breaker for task fetching
const taskBreaker = registry.registerService({
  name: 'task-fetch',
  failureThreshold: 3,
  resetTimeout: 30000
})

interface TaskFilters {
  status?: ('pending' | 'in_progress' | 'completed' | 'archived')[]
  priority?: ('low' | 'medium' | 'high')[]
  due_date_start?: string
  due_date_end?: string
  tags?: string[]
  search?: string
  parent_id?: string | null
  provider?: string
  limit?: number
  offset?: number
}

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

declare const Deno: {
  env: {
    get(key: keyof Env): string | undefined;
  };
};

serve(async (req) => {
  try {
    // Handle CORS preflight
    const corsResponse = await handleCors(req);
    if (corsResponse) return corsResponse;

    // Validate request method
    if (req.method !== 'POST') {
      throw new ValidationError('Method not allowed', { allowedMethods: ['POST'] })
    }

    // Extract token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
    });
    
    // Verify token using JWT verification
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError) {
      console.error('Auth error:', userError);
      throw new AuthError('Invalid token');
    }

    // Extract user ID from the JWT claims
    const userId = user.id;

    // Parse request body for filters
    const { project_id, tag_ids, urgency, completed, due_date_start, due_date_end } = await req.json();

    // Query tasks with filters
    let query = supabase
      .from('tasks')
      .select(`
        *,
        project:projects(name),
        tags:task_tags(tag:tags(name))
      `)
      .eq('user_id', userId);

    // Apply filters
    if (project_id) query = query.eq('project_id', project_id);
    if (urgency) query = query.eq('urgency', urgency);
    if (completed !== undefined) query = query.is('completed_at', completed ? 'NOT NULL' : 'NULL');
    if (due_date_start) query = query.gte('due_date', due_date_start);
    if (due_date_end) query = query.lte('due_date', due_date_end);
    if (tag_ids?.length) {
      query = query.in('id', supabase
        .from('task_tags')
        .select('task_id')
        .in('tag_id', tag_ids)
      );
    }

    // Execute query
    const { data: tasks, error: dbError } = await query;

    if (dbError) {
      console.error('Database error:', dbError);
      throw new DatabaseError('Failed to fetch tasks');
    }

    // Return the tasks with CORS headers
    return wrapResponse(new Response(
      JSON.stringify({
        success: true,
        data: tasks
      }),
      { headers: { 'Content-Type': 'application/json' } }
    ));
  } catch (error) {
    console.error('Function error:', error)
    const errorResponse = await handleError(error)
    return wrapResponse(new Response(
      JSON.stringify({
        success: false,
        error: errorResponse.body
      }),
      {
        status: errorResponse.status,
        headers: { 'Content-Type': 'application/json' }
      }
    ));
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-tasks' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
