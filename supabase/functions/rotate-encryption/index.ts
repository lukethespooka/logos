import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { handleError, AuthError, ValidationError } from '../_shared/error-handler.ts';
import { rotateTokenEncryption } from '../_shared/encryption.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface RotationStats {
  total: number;
  rotated: number;
  failed: number;
  failures: Array<{ id: string; error: string }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new AuthError('Authorization header required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      throw new AuthError('Invalid user token');
    }

    // Verify user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      throw new AuthError('Admin access required');
    }

    // Get all provider connections
    const { data: connections, error: fetchError } = await supabase
      .from('provider_connections')
      .select('id, access_token, refresh_token')
      .order('id');

    if (fetchError) {
      throw new Error('Failed to fetch provider connections');
    }

    const stats: RotationStats = {
      total: connections?.length || 0,
      rotated: 0,
      failed: 0,
      failures: []
    };

    // Process each connection
    for (const connection of connections || []) {
      try {
        // Rotate access token
        if (connection.access_token) {
          const newAccessToken = await rotateTokenEncryption(connection.access_token);
          
          // Rotate refresh token if present
          const newRefreshToken = connection.refresh_token 
            ? await rotateTokenEncryption(connection.refresh_token)
            : null;

          // Update the connection with new tokens
          const { error: updateError } = await supabase
            .from('provider_connections')
            .update({
              access_token: newAccessToken,
              refresh_token: newRefreshToken,
              updated_at: new Date().toISOString()
            })
            .eq('id', connection.id);

          if (updateError) {
            throw new Error(`Failed to update connection: ${updateError.message}`);
          }

          stats.rotated++;
        }
      } catch (error) {
        stats.failed++;
        stats.failures.push({
          id: connection.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Return rotation results
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          message: 'Key rotation completed',
          stats
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return handleError(error, req);
  }
}); 