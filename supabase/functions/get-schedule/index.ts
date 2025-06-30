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

console.log("Starting get-schedule function...")
console.log("Listening on http://localhost:9999/")

// Initialize service registry
const registry = ServiceRegistry.getInstance()

// Initialize circuit breaker for schedule fetching
const scheduleBreaker = registry.registerService({
  name: 'schedule-fetch',
  failureThreshold: 3,
  resetTimeout: 30000
})

interface ScheduleFilters {
  start_date?: string
  end_date?: string
  providers?: string[]
  include_tasks?: boolean
  include_completed?: boolean
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
      throw new AuthError('Invalid authorization token');
    }

    // Extract user ID from the JWT claims
    const userId = user.id;

    // Parse request body for filters
    const { start_date, end_date, providers, include_tasks, include_completed, limit, offset } = await req.json();

    try {
      // Call the database function with the correct parameters
      const { data: scheduleItems, error: dbError } = await supabase
        .rpc('get_user_schedule', {
          p_user_id: userId,
          p_start_date: start_date,
          p_end_date: end_date,
          p_providers: providers,
          p_include_tasks: include_tasks,
          p_include_completed: include_completed,
          p_limit: limit,
          p_offset: offset
        });

      if (dbError) {
        console.error('Schedule error:', dbError);
        throw new DatabaseError('Failed to fetch schedule');
      }

      // Return the schedule items with CORS headers
      return wrapResponse(new Response(
        JSON.stringify({
          success: true,
          data: scheduleItems
        }),
        { headers: { 'Content-Type': 'application/json' } }
      ));
    } catch (error) {
      console.error('Schedule error:', error);
      throw new DatabaseError('Failed to fetch schedule: ' + error.message);
    }
  } catch (error) {
    console.error('Function error:', error);
    const errorResponse = await handleError(error);
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
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-schedule' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
