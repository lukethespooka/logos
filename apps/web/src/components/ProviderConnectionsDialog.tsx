import React, { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useFeatureFlags } from '../hooks/useFeatureFlags'
import { oauthService } from '../services/oauth'
import type { ProviderConnection, ProviderType } from '../types/sprint3'

interface ProviderConnectionsDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface ProviderInfo {
  id: ProviderType
  name: string
  description: string
  icon: string
  features: string[]
  enabled: boolean
}

const PROVIDERS: ProviderInfo[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail account for email insights and smart suggestions',
    icon: '📧',
    features: [
      'Email categorization and priority detection',
      'Automatic task extraction from emails',
      'Smart daily email summaries',
      'Read-only access (privacy-first)'
    ],
    enabled: true
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar', 
    description: 'Sync your calendar for intelligent scheduling',
    icon: '📅',
    features: [
      'Meeting preparation suggestions',
      'Calendar conflict detection',
      'Focus time optimization'
    ],
    enabled: false
  },
  {
    id: 'apple_calendar',
    name: 'Apple Calendar',
    description: 'Connect your Apple Calendar for scheduling integration',
    icon: '🍎',
    features: [
      'iCloud calendar synchronization',
      'Cross-platform scheduling'
    ],
    enabled: false
  }
]

export function ProviderConnectionsDialog({ 
  trigger, 
  open, 
  onOpenChange 
}: ProviderConnectionsDialogProps) {
  const { isEmailIntegrationEnabled, isCalendarIntegrationEnabled } = useFeatureFlags()
  const [connections, setConnections] = useState<ProviderConnection[]>([])
  const [loadingStates, setLoadingStates] = useState<Record<ProviderType, boolean>>({})
  const [errors, setErrors] = useState<Record<ProviderType, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  const availableProviders = PROVIDERS.map(provider => ({
    ...provider,
    enabled: provider.enabled && (
      (provider.id === 'gmail' && isEmailIntegrationEnabled) ||
      (provider.id === 'google_calendar' && isCalendarIntegrationEnabled) ||
      (provider.id === 'apple_calendar' && isCalendarIntegrationEnabled)
    )
  }))

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    setIsLoading(true)
    try {
      const userConnections = await oauthService.getConnections()
      setConnections(userConnections)
    } catch (error) {
      console.error('Error loading connections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (provider: ProviderType) => {
    setLoadingStates(prev => ({ ...prev, [provider]: true }))
    setErrors(prev => ({ ...prev, [provider]: '' }))

    try {
      const result = await oauthService.connectWithPopup(provider)
      
      if (result.success) {
        await loadConnections()
      } else {
        setErrors(prev => ({ 
          ...prev, 
          [provider]: result.error?.message || 'Connection failed' 
        }))
      }
    } catch (error) {
      console.error('Connection error:', error)
      setErrors(prev => ({ 
        ...prev, 
        [provider]: error instanceof Error ? error.message : 'Unknown error occurred' 
      }))
    } finally {
      setLoadingStates(prev => ({ ...prev, [provider]: false }))
    }
  }

  const handleDisconnect = async (provider: ProviderType) => {
    setLoadingStates(prev => ({ ...prev, [provider]: true }))
    
    try {
      const result = await oauthService.disconnect(provider)
      
      if (result.success) {
        await loadConnections()
      } else {
        setErrors(prev => ({ 
          ...prev, 
          [provider]: result.error?.message || 'Disconnection failed' 
        }))
      }
    } catch (error) {
      console.error('Disconnection error:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, [provider]: false }))
    }
  }

  const getConnectionStatus = (provider: ProviderType): ProviderConnection | null => {
    return connections.find(conn => conn.provider === provider) || null
  }

  const getConnectionBadge = (connection: ProviderConnection | null) => {
    if (!connection) {
      return <Badge variant="secondary">Not Connected</Badge>
    }

    const isExpired = connection.expires_at && 
      new Date(connection.expires_at) < new Date()

    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    }

    return <Badge variant="default" className="bg-green-500">Connected</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">🔗 Manage Connections</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🔗 Provider Connections</DialogTitle>
          <DialogDescription>
            Connect your accounts to enable AI-powered insights and smart workflows.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isEmailIntegrationEnabled && !isCalendarIntegrationEnabled && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  ⚠️ <span className="font-medium">Provider integrations are currently disabled</span>
                </div>
              </CardContent>
            </Card>
          )}

          {availableProviders.map((provider) => {
            const connection = getConnectionStatus(provider.id)
            const isConnected = !!connection
            const isLoading = loadingStates[provider.id] || false
            const error = errors[provider.id]

            return (
              <Card key={provider.id} className={!provider.enabled ? 'opacity-50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <CardDescription>{provider.description}</CardDescription>
                      </div>
                    </div>
                    {getConnectionBadge(connection)}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {provider.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <span>❌</span>
                        <span className="font-medium">Connection Error</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!isConnected ? (
                      <Button
                        onClick={() => handleConnect(provider.id)}
                        disabled={!provider.enabled || isLoading}
                        className="flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Connecting...
                          </>
                        ) : (
                          <>🔗 Connect {provider.name}</>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => handleDisconnect(provider.id)}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Disconnecting...
                          </>
                        ) : (
                          <>🗑️ Disconnect</>
                        )}
                      </Button>
                    )}
                  </div>

                  {provider.id === 'gmail' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <span>🔒</span>
                        <span className="font-medium text-sm">Privacy & Security</span>
                      </div>
                      <ul className="text-xs text-blue-600 mt-1 space-y-0.5">
                        <li>• Read-only access - we cannot send emails</li>
                        <li>• Email content processed locally, never stored</li>
                        <li>• Only AI summaries are saved</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
} 