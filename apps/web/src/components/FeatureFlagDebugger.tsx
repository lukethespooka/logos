import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { useFeatureFlags } from '../hooks/useFeatureFlags'
import type { Sprint3FeatureFlags } from '../types/sprint3'

interface FeatureFlagDebuggerProps {
  showInProduction?: boolean
}

export function FeatureFlagDebugger({ showInProduction = false }: FeatureFlagDebuggerProps) {
  const {
    flags,
    userOverrides,
    updateFlag,
    resetFlags,
    envControlledFlags,
    isEnvControlled
  } = useFeatureFlags()

  // Only show in development unless explicitly enabled for production
  if (!import.meta.env.DEV && !showInProduction) {
    return null
  }

  const flagDescriptions: Record<keyof Sprint3FeatureFlags, string> = {
    email_integration: 'Gmail OAuth connection and email insights processing',
    calendar_integration: 'Google/Apple Calendar sync and scheduling intelligence',
    ai_suggestions: 'Smart daily suggestions based on email and calendar data',
    local_ai_routing: 'Route AI processing to local models (Ollama) for privacy',
    cost_tracking: 'Track and limit AI processing costs',
    learning_mode: 'Machine learning from user interactions for better suggestions'
  }

  const flagImpact: Record<keyof Sprint3FeatureFlags, string[]> = {
    email_integration: [
      'Shows "Connect" tab in Settings',
      'Enables Gmail OAuth flow',
      'Activates email insights in Daily Brief'
    ],
    calendar_integration: [
      'Enables calendar provider connections',
      'Shows meeting preparation suggestions',
      'Adds calendar conflict detection'
    ],
    ai_suggestions: [
      'Shows smart suggestion cards in dashboard',
      'Enables proactive task recommendations',
      'Activates focus mode suggestions'
    ],
    local_ai_routing: [
      'Routes email processing to local AI models',
      'Reduces cloud AI costs by 90%+',
      'Processes sensitive data locally'
    ],
    cost_tracking: [
      'Tracks AI usage costs in real-time',
      'Shows cost breakdown in settings',
      'Enables budget alerts'
    ],
    learning_mode: [
      'Learns from user interactions',
      'Improves suggestion relevance over time',
      'Stores interaction metrics for ML'
    ]
  }

  const getStatusBadge = (flagKey: keyof Sprint3FeatureFlags) => {
    const isEnabled = flags[flagKey]
    const isEnvControlled = envControlledFlags.includes(flagKey)
    
    if (isEnabled) {
      return <Badge variant="default" className="bg-green-500">ON</Badge>
    } else {
      return <Badge variant="secondary">OFF</Badge>
    }
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          🛠️ Feature Flag Debugger
          <Badge variant="outline" className="text-xs">DEV ONLY</Badge>
        </CardTitle>
        <CardDescription className="text-yellow-700 dark:text-yellow-300">
          Toggle Sprint 3 features for testing. Changes are saved to localStorage.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              Object.keys(flags).forEach(key => {
                if (!isEnvControlled(key as keyof Sprint3FeatureFlags)) {
                  updateFlag(key as keyof Sprint3FeatureFlags, true)
                }
              })
            }}
            className="text-xs"
          >
            Enable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              Object.keys(flags).forEach(key => {
                if (!isEnvControlled(key as keyof Sprint3FeatureFlags)) {
                  updateFlag(key as keyof Sprint3FeatureFlags, false)
                }
              })
            }}
            className="text-xs"
          >
            Disable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFlags}
            className="text-xs"
          >
            Reset to Defaults
          </Button>
        </div>

        {/* Environment Controlled Notice */}
        {envControlledFlags.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <span>🌍</span>
              <span className="font-medium text-sm">Environment Controlled</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {envControlledFlags.join(', ')} are controlled by environment variables and cannot be changed here.
            </p>
          </div>
        )}

        {/* Feature Flags */}
        <div className="space-y-3">
          {Object.entries(flags).map(([flagKey, isEnabled]) => {
            const key = flagKey as keyof Sprint3FeatureFlags
            const canToggle = !isEnvControlled(key)
            
            return (
              <div 
                key={flagKey} 
                className={`p-3 border rounded-lg ${isEnabled ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isEnabled}
                      onCheckedChange={(checked) => {
                        if (canToggle) {
                          updateFlag(key, checked as boolean)
                        }
                      }}
                      disabled={!canToggle}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm capitalize">
                          {flagKey.replace(/_/g, ' ')}
                        </span>
                        {getStatusBadge(key)}
                        {!canToggle && (
                          <Badge variant="outline" className="text-xs">ENV</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {flagDescriptions[key]}
                      </p>
                    </div>
                  </div>
                </div>
                
                {flagImpact[key] && (
                  <div className="ml-6">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Impact:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {flagImpact[key].map((impact, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="text-green-500">•</span>
                          {impact}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Current State Summary */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-medium">Enabled Features:</span>
              <div className="mt-1">
                {Object.entries(flags).filter(([_, enabled]) => enabled).length} / {Object.keys(flags).length}
              </div>
            </div>
            <div>
              <span className="font-medium">User Overrides:</span>
              <div className="mt-1">
                {Object.keys(userOverrides).length} active
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 mb-1">
            <span>💡</span>
            <span className="font-medium text-sm">Testing Instructions</span>
          </div>
          <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
            <li>• Enable "email_integration" to see the Providers tab in Settings</li>
            <li>• Enable "ai_suggestions" to see smart suggestion cards</li>
            <li>• Enable "local_ai_routing" for privacy-first AI processing</li>
            <li>• Changes persist across browser sessions via localStorage</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 