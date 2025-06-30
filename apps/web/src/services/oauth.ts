import { supabase } from '../lib/supabase'
import type { 
  ProviderConnection, 
  ProviderType, 
  ApiResponse 
} from '../types/sprint3'

export interface OAuthInitiateResponse {
  auth_url: string
  state: string
}

export interface OAuthCallbackResponse {
  provider: ProviderType
  user_email: string
  scopes: string[]
  connected_at: string
}

export interface OAuthService {
  initiateConnection(provider: ProviderType): Promise<ApiResponse<OAuthInitiateResponse>>
  handleCallback(provider: ProviderType, code: string, state: string): Promise<ApiResponse<OAuthCallbackResponse>>
  refreshToken(provider: ProviderType): Promise<ApiResponse<{ expires_at: string }>>
  disconnect(provider: ProviderType): Promise<ApiResponse<{ message: string }>>
  getConnections(): Promise<ProviderConnection[]>
  getConnection(provider: ProviderType): Promise<ProviderConnection | null>
  isConnected(provider: ProviderType): Promise<boolean>
}

class OAuthServiceImpl implements OAuthService {
  private async makeRequest<T>(
    functionName: string, 
    payload: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated'
          }
        }
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (error) {
        console.error(`OAuth ${functionName} error:`, error)
        return {
          success: false,
          error: {
            code: 'FUNCTION_ERROR',
            message: error.message || 'Function call failed',
            details: error
          }
        }
      }

      return data as ApiResponse<T>

    } catch (error) {
      console.error(`OAuth service error:`, error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed'
        }
      }
    }
  }

  /**
   * Initiate OAuth connection flow for a provider
   */
  async initiateConnection(provider: ProviderType): Promise<ApiResponse<OAuthInitiateResponse>> {
    if (provider !== 'gmail') {
      return {
        success: false,
        error: {
          code: 'UNSUPPORTED_PROVIDER',
          message: `Provider ${provider} not yet supported`
        }
      }
    }

    return this.makeRequest<OAuthInitiateResponse>('oauth-gmail', {
      action: 'initiate'
    })
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleCallback(
    provider: ProviderType, 
    code: string, 
    state: string
  ): Promise<ApiResponse<OAuthCallbackResponse>> {
    if (provider !== 'gmail') {
      return {
        success: false,
        error: {
          code: 'UNSUPPORTED_PROVIDER',
          message: `Provider ${provider} not yet supported`
        }
      }
    }

    return this.makeRequest<OAuthCallbackResponse>('oauth-gmail', {
      action: 'callback',
      code,
      state
    })
  }

  /**
   * Refresh access token for a provider
   */
  async refreshToken(provider: ProviderType): Promise<ApiResponse<{ expires_at: string }>> {
    if (provider !== 'gmail') {
      return {
        success: false,
        error: {
          code: 'UNSUPPORTED_PROVIDER',
          message: `Provider ${provider} not yet supported`
        }
      }
    }

    // Get stored refresh token
    const connection = await this.getConnection(provider)
    if (!connection?.refresh_token) {
      return {
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'No refresh token available for this connection'
        }
      }
    }

    return this.makeRequest<{ expires_at: string }>('oauth-gmail', {
      action: 'refresh',
      refresh_token: connection.refresh_token
    })
  }

  /**
   * Disconnect a provider
   */
  async disconnect(provider: ProviderType): Promise<ApiResponse<{ message: string }>> {
    if (provider !== 'gmail') {
      return {
        success: false,
        error: {
          code: 'UNSUPPORTED_PROVIDER',
          message: `Provider ${provider} not yet supported`
        }
      }
    }

    return this.makeRequest<{ message: string }>('oauth-gmail', {
      action: 'disconnect'
    })
  }

  /**
   * Get all provider connections for current user
   */
  async getConnections(): Promise<ProviderConnection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return []
      }

      const { data, error } = await supabase
        .from('provider_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('connected_at', { ascending: false })

      if (error) {
        console.error('Error fetching connections:', error)
        return []
      }

      return data || []

    } catch (error) {
      console.error('Error in getConnections:', error)
      return []
    }
  }

  /**
   * Get specific provider connection
   */
  async getConnection(provider: ProviderType): Promise<ProviderConnection | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return null
      }

      const { data, error } = await supabase
        .from('provider_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .eq('status', 'active')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        console.error('Error fetching connection:', error)
        return null
      }

      return data

    } catch (error) {
      console.error('Error in getConnection:', error)
      return null
    }
  }

  /**
   * Check if a provider is connected
   */
  async isConnected(provider: ProviderType): Promise<boolean> {
    const connection = await this.getConnection(provider)
    
    if (!connection) {
      return false
    }

    // Check if token is expired
    if (connection.expires_at) {
      const expiresAt = new Date(connection.expires_at)
      const now = new Date()
      const bufferTime = 5 * 60 * 1000 // 5 minutes buffer
      
      if (expiresAt.getTime() - bufferTime < now.getTime()) {
        // Token is expired or will expire soon
        // Try to refresh if we have a refresh token
        if (connection.refresh_token) {
          const refreshResult = await this.refreshToken(provider)
          return refreshResult.success
        }
        return false
      }
    }

    return true
  }

  /**
   * Get user's email from a connected provider
   */
  async getConnectedEmail(provider: ProviderType): Promise<string | null> {
    try {
      const connection = await this.getConnection(provider)
      if (!connection) {
        return null
      }

      // In a real implementation, you might need to make an API call to get the email
      // For now, we could store it during connection or fetch from provider API
      
      if (provider === 'gmail') {
        // Could call Gmail API to get user profile
        // For now, return null - this would be implemented based on specific needs
        return null
      }

      return null

    } catch (error) {
      console.error('Error getting connected email:', error)
      return null
    }
  }

  /**
   * Check if provider needs scope updates
   */
  async needsScopeUpdate(provider: ProviderType, requiredScopes: string[]): Promise<boolean> {
    const connection = await this.getConnection(provider)
    
    if (!connection) {
      return true // Not connected at all
    }

    const grantedScopes = connection.scopes || []
    const missingScopes = requiredScopes.filter(scope => !grantedScopes.includes(scope))
    
    return missingScopes.length > 0
  }

  /**
   * Get OAuth redirect URL for provider callback handling
   */
  getRedirectUrl(provider: ProviderType): string {
    const baseUrl = window.location.origin
    return `${baseUrl}/auth/${provider}/callback`
  }

  /**
   * Handle OAuth popup window for better UX
   */
  async connectWithPopup(provider: ProviderType): Promise<ApiResponse<OAuthCallbackResponse>> {
    try {
      const initiateResult = await this.initiateConnection(provider)
      
      if (!initiateResult.success || !initiateResult.data) {
        return {
          success: false,
          error: initiateResult.error || {
            code: 'INITIATE_FAILED',
            message: 'Failed to initiate OAuth connection'
          }
        }
      }

      const { auth_url, state } = initiateResult.data

      // Open popup window
      const popup = window.open(
        auth_url,
        `oauth-${provider}`,
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        return {
          success: false,
          error: {
            code: 'POPUP_BLOCKED',
            message: 'Popup window was blocked. Please allow popups for this site.'
          }
        }
      }

      // Wait for popup to complete OAuth flow
      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            resolve({
              success: false,
              error: {
                code: 'POPUP_CLOSED',
                message: 'OAuth window was closed before completion'
              }
            })
          }
        }, 1000)

        // Listen for message from popup
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) {
            return
          }

          if (event.data.type === 'oauth-callback') {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageHandler)
            popup.close()

            const { code, state: returnedState } = event.data
            
            if (returnedState !== state) {
              resolve({
                success: false,
                error: {
                  code: 'STATE_MISMATCH',
                  message: 'OAuth state parameter mismatch'
                }
              })
              return
            }

            // Handle the callback
            this.handleCallback(provider, code, returnedState).then(resolve)
          }
        }

        window.addEventListener('message', messageHandler)

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          if (!popup.closed) {
            popup.close()
          }
          resolve({
            success: false,
            error: {
              code: 'TIMEOUT',
              message: 'OAuth flow timed out'
            }
          })
        }, 5 * 60 * 1000)
      })

    } catch (error) {
      console.error('OAuth popup error:', error)
      return {
        success: false,
        error: {
          code: 'POPUP_ERROR',
          message: error instanceof Error ? error.message : 'Popup OAuth failed'
        }
      }
    }
  }
}

// Export singleton instance
export const oauthService = new OAuthServiceImpl()

// Named exports for convenience
export const {
  initiateConnection,
  handleCallback,
  refreshToken,
  disconnect,
  getConnections,
  getConnection,
  isConnected,
  connectWithPopup
} = oauthService 