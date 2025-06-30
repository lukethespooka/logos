import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { handleError, validateRequest, validators, AuthError, ValidationError } from '../_shared/error-handler.ts'
import { ServiceRegistry } from '../_shared/service-registry.ts'
import { encryptToken, decryptToken } from '../_shared/encryption.ts'

const registry = ServiceRegistry.getInstance()
const googleAuthBreaker = registry.registerService({
  name: 'google-auth',
  failureThreshold: 3,
  resetTimeout: 30000
})

const googleTokenBreaker = registry.registerService({
  name: 'google-token',
  failureThreshold: 3,
  resetTimeout: 30000
})

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
  scope: string
  token_type: string
}

// Required Gmail scopes for comprehensive access
const REQUIRED_SCOPES = [
  // Gmail - Full access
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.labels',
  
  // Calendar - Full access
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  
  // Drive - Full access for docs
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  
  // Tasks - Full access
  'https://www.googleapis.com/auth/tasks',
  
  // Maps & Location
  'https://www.googleapis.com/auth/maps.embed',
  'https://www.googleapis.com/auth/maps.places',
  'https://www.googleapis.com/auth/maps.places.reviews',
  'https://www.googleapis.com/auth/geolocation',
  
  // User info
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]

Deno.serve(async (req) => {
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
      throw new AuthError('Authorization header required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new AuthError('Invalid user token')
    }

    // Parse and validate request body
    const requestData = await req.json().catch(() => {
      throw new ValidationError('Invalid JSON payload')
    })

    const oauthRequest = validateOAuthRequest(requestData)

    switch (oauthRequest.action) {
      case 'initiate':
        return await googleAuthBreaker.execute(async () => {
          const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
          const redirectUri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI')

          if (!clientId || !redirectUri) {
            throw new Error('Missing OAuth configuration')
          }

          const state = crypto.randomUUID()
          
          // Store state for verification
          await supabaseClient
            .from('oauth_states')
            .insert({
              user_id: user.id,
              state,
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
            })

          const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
          authUrl.searchParams.set('client_id', clientId)
          authUrl.searchParams.set('redirect_uri', redirectUri)
          authUrl.searchParams.set('response_type', 'code')
          authUrl.searchParams.set('scope', REQUIRED_SCOPES.join(' '))
          authUrl.searchParams.set('access_type', 'offline')
          authUrl.searchParams.set('state', state)
          authUrl.searchParams.set('prompt', 'consent')

          return new Response(
            JSON.stringify({
              success: true,
              data: { auth_url: authUrl.toString() }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        })

      case 'callback':
        return await googleTokenBreaker.execute(async () => {
          // Verify state
          const { data: storedState, error: stateError } = await supabaseClient
            .from('oauth_states')
            .select('state')
            .eq('user_id', user.id)
            .eq('state', oauthRequest.state)
            .single()

          if (stateError || !storedState) {
            throw new ValidationError('Invalid state parameter')
          }

          // Exchange code for tokens
          const tokens = await exchangeCodeForTokens(oauthRequest.code!)

          // Encrypt tokens before storage
          const encryptedAccessToken = await encryptToken(tokens.access_token)
          const encryptedRefreshToken = tokens.refresh_token ? 
            await encryptToken(tokens.refresh_token) : null

          // Store the connection
          const { error: connectionError } = await supabaseClient
            .from('provider_connections')
            .upsert({
              user_id: user.id,
              provider: 'gmail',
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken,
              expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
              scopes: tokens.scope.split(' '),
              status: 'active'
            })

          if (connectionError) {
            throw new Error(`Failed to store connection: ${connectionError.message}`)
          }

          // Clean up used state
          await supabaseClient
            .from('oauth_states')
            .delete()
            .eq('state', oauthRequest.state)

          return new Response(
            JSON.stringify({
              success: true,
              data: { message: 'Gmail connection established' }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        })

      case 'refresh':
        return await googleTokenBreaker.execute(async () => {
          // Get existing connection
          const { data: connection, error: connectionError } = await supabaseClient
            .from('provider_connections')
            .select('refresh_token')
            .eq('user_id', user.id)
            .eq('provider', 'gmail')
            .single()

          if (connectionError || !connection?.refresh_token) {
            throw new ValidationError('No valid Gmail connection found')
          }

          // Decrypt stored refresh token
          const decryptedRefreshToken = await decryptToken(connection.refresh_token)

          // Refresh the access token
          const tokens = await refreshAccessToken(decryptedRefreshToken)

          // Encrypt new tokens
          const encryptedAccessToken = await encryptToken(tokens.access_token)
          const encryptedRefreshToken = tokens.refresh_token ? 
            await encryptToken(tokens.refresh_token) : connection.refresh_token

          // Update the connection
          const { error: updateError } = await supabaseClient
            .from('provider_connections')
            .update({
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken,
              expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('provider', 'gmail')

          if (updateError) {
            throw new Error(`Failed to update connection: ${updateError.message}`)
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: { message: 'Access token refreshed' }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        })

      case 'disconnect':
        return await googleAuthBreaker.execute(async () => {
          // Get existing connection
          const { data: connection, error: connectionError } = await supabaseClient
            .from('provider_connections')
            .select('access_token')
            .eq('user_id', user.id)
            .eq('provider', 'gmail')
            .single()

          if (connectionError || !connection?.access_token) {
            throw new ValidationError('No valid Gmail connection found')
          }

          // Decrypt access token
          const decryptedAccessToken = await decryptToken(connection.access_token)

          // Revoke access
          const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${decryptedAccessToken}`, {
            method: 'POST'
          })

          if (!response.ok) {
            console.error('Failed to revoke token:', await response.text())
          }

          // Delete the connection
          const { error: deleteError } = await supabaseClient
            .from('provider_connections')
            .delete()
            .eq('user_id', user.id)
            .eq('provider', 'gmail')

          if (deleteError) {
            throw new Error(`Failed to delete connection: ${deleteError.message}`)
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: { message: 'Gmail connection removed' }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        })

      default:
        throw new ValidationError('Invalid action specified')
    }

  } catch (error) {
    return handleError(error, req)
  }
})

// Exchange authorization code for access tokens
async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')
  const redirectUri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI')

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing OAuth configuration')
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to exchange code: ${error.error_description || error.error}`)
  }

  return response.json()
}

// Refresh access token using refresh token
async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    throw new Error('Missing OAuth configuration')
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to refresh token: ${error.error_description || error.error}`)
  }

  return response.json()
}

// Validation schema
const validateOAuthRequest = (data: unknown): OAuthRequest => {
  const request = data as OAuthRequest
  
  if (!request.action) {
    throw new ValidationError('Action is required')
  }

  if (!['initiate', 'callback', 'refresh', 'disconnect'].includes(request.action)) {
    throw new ValidationError('Invalid action')
  }

  switch (request.action) {
    case 'callback':
      if (!request.code) {
        throw new ValidationError('Code is required for callback action')
      }
      if (!request.state) {
        throw new ValidationError('State is required for callback action')
      }
      break
    case 'refresh':
      if (!request.refresh_token) {
        throw new ValidationError('Refresh token is required for refresh action')
      }
      break
  }

  return request
} 