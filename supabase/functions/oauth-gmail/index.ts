import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface OAuthRequest {
  action: 'initiate' | 'callback' | 'refresh' | 'disconnect'
  code?: string
  state?: string
  refresh_token?: string
}

interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

// Required Gmail scopes for read-only access
const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/userinfo.email'
]

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authorization header required' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid user token' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, code, state, refresh_token }: OAuthRequest = await req.json()

    switch (action) {
      case 'initiate':
        return handleOAuthInitiation(user.id)

      case 'callback':
        if (!code || !state) {
          return new Response(
            JSON.stringify({ success: false, error: { code: 'MISSING_PARAMS', message: 'Code and state required' } }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        return handleOAuthCallback(supabaseClient, user.id, code, state)

      case 'refresh':
        if (!refresh_token) {
          return new Response(
            JSON.stringify({ success: false, error: { code: 'MISSING_REFRESH_TOKEN', message: 'Refresh token required' } }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        return handleTokenRefresh(supabaseClient, user.id, refresh_token)

      case 'disconnect':
        return handleOAuthDisconnect(supabaseClient, user.id)

      default:
        return new Response(
          JSON.stringify({ success: false, error: { code: 'INVALID_ACTION', message: 'Invalid action specified' } }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('OAuth Gmail Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Internal server error',
          details: Deno.env.get('NODE_ENV') === 'development' ? error.message : undefined
        } 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Generate OAuth initiation URL
function handleOAuthInitiation(userId: string) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI')

  if (!clientId || !redirectUri) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { code: 'CONFIG_ERROR', message: 'OAuth configuration missing' } 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Generate secure state parameter
  const state = crypto.randomUUID()
  
  // Store state temporarily (could use Redis in production)
  // For now, we'll include userId in state and verify on callback
  const stateData = {
    userId,
    timestamp: Date.now(),
    nonce: crypto.randomUUID()
  }
  
  const encodedState = btoa(JSON.stringify(stateData))

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', REQUIRED_SCOPES.join(' '))
  authUrl.searchParams.set('state', encodedState)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        auth_url: authUrl.toString(),
        state: encodedState
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Handle OAuth callback and exchange code for tokens
async function handleOAuthCallback(supabaseClient: any, userId: string, code: string, state: string) {
  try {
    // Verify state parameter
    const stateData = JSON.parse(atob(state))
    if (stateData.userId !== userId) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'INVALID_STATE', message: 'State parameter mismatch' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check state timestamp (expire after 10 minutes)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'EXPIRED_STATE', message: 'State parameter expired' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(code)
    
    // Verify required scopes
    const grantedScopes = tokenResponse.scope.split(' ')
    const missingScopes = REQUIRED_SCOPES.filter(scope => !grantedScopes.includes(scope))
    
    if (missingScopes.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { 
            code: 'INSUFFICIENT_SCOPES', 
            message: 'Required permissions not granted',
            details: { missing_scopes: missingScopes }
          } 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user email from Google
    const userInfo = await getUserInfo(tokenResponse.access_token)

    // Encrypt tokens before storing
    const encryptedAccessToken = await encryptToken(tokenResponse.access_token)
    const encryptedRefreshToken = tokenResponse.refresh_token ? await encryptToken(tokenResponse.refresh_token) : null

    // Store connection in database
    const { error: dbError } = await supabaseClient
      .from('provider_connections')
      .upsert({
        user_id: userId,
        provider: 'gmail',
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
        scopes: grantedScopes,
        status: 'active',
        connected_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id,provider' 
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to store connection' } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          provider: 'gmail',
          user_email: userInfo.email,
          scopes: grantedScopes,
          connected_at: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('OAuth callback error:', error)
    return new Response(
      JSON.stringify({ success: false, error: { code: 'CALLBACK_ERROR', message: 'OAuth callback failed' } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// Exchange authorization code for access tokens
async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
  const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI')

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri!,
    }),
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Token exchange failed: ${errorData}`)
  }

  return await response.json()
}

// Refresh access token using refresh token
async function handleTokenRefresh(supabaseClient: any, userId: string, refreshToken: string) {
  try {
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Token refresh failed: ${errorData}`)
    }

    const tokenData = await response.json()
    const encryptedAccessToken = await encryptToken(tokenData.access_token)

    // Update stored token
    const { error: dbError } = await supabaseClient
      .from('provider_connections')
      .update({
        access_token: encryptedAccessToken,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        status: 'active'
      })
      .eq('user_id', userId)
      .eq('provider', 'gmail')

    if (dbError) {
      throw new Error('Failed to update token in database')
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Token refresh error:', error)
    return new Response(
      JSON.stringify({ success: false, error: { code: 'REFRESH_ERROR', message: 'Token refresh failed' } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// Disconnect Gmail integration
async function handleOAuthDisconnect(supabaseClient: any, userId: string) {
  try {
    const { error: dbError } = await supabaseClient
      .from('provider_connections')
      .update({ status: 'revoked' })
      .eq('user_id', userId)
      .eq('provider', 'gmail')

    if (dbError) {
      throw new Error('Failed to disconnect provider')
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { message: 'Gmail connection disconnected successfully' }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Disconnect error:', error)
    return new Response(
      JSON.stringify({ success: false, error: { code: 'DISCONNECT_ERROR', message: 'Failed to disconnect' } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// Get user info from Google
async function getUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user info')
  }

  return await response.json()
}

// Simple token encryption (in production, use proper encryption)
async function encryptToken(token: string): Promise<string> {
  const encryptionKey = Deno.env.get('OAUTH_ENCRYPTION_KEY')
  if (!encryptionKey) {
    console.warn('No encryption key provided, storing token in plain text (development only)')
    return token
  }

  // In production, implement proper AES encryption
  // For now, use base64 encoding with key prefix
  return `encrypted:${btoa(token + ':' + encryptionKey.substring(0, 8))}`
}

// Decrypt token (companion to encryptToken)
async function decryptToken(encryptedToken: string): Promise<string> {
  if (!encryptedToken.startsWith('encrypted:')) {
    return encryptedToken // Plain text token (development)
  }

  const encryptionKey = Deno.env.get('OAUTH_ENCRYPTION_KEY')
  if (!encryptionKey) {
    throw new Error('Encryption key required to decrypt token')
  }

  // In production, implement proper AES decryption
  const encoded = encryptedToken.replace('encrypted:', '')
  const decoded = atob(encoded)
  const [token] = decoded.split(':')
  
  return token
} 