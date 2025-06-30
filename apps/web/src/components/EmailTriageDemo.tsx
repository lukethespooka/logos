import { useState } from 'react'
import { emailTriageService, mockEmailData } from '../services/emailTriage'
import { aiRouter } from '../services/aiRouter'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import type { EmailTriageResponse } from '../types/sprint3'

interface TriageResult extends EmailTriageResponse {
  error?: string
}

export function EmailTriageDemo() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [spendingStatus, setSpendingStatus] = useState<any>(null)

  const handleTestTriage = async () => {
    setIsProcessing(true)
    setResult(null)

    try {
      console.log('🧪 Starting Email Triage Test...')
      
      // Get current spending status
      const spending = aiRouter.getSpendingStatus()
      setSpendingStatus(spending)
      
      // Test with mock data
      const triageResult = await emailTriageService.triageEmails(mockEmailData)
      
      if (triageResult.success && triageResult.data) {
        setResult(triageResult.data)
        console.log('✅ Triage successful!', triageResult.data)
      } else {
        setResult({ 
          insights: [], 
          suggested_actions: [], 
          processing_stats: { total_processed: 0, ai_model_used: 'mistral:7b-instruct', processing_time_ms: 0, cost_usd: 0 },
          error: triageResult.error?.message || 'Unknown error'
        })
        console.error('❌ Triage failed:', triageResult.error)
      }
    } catch (error) {
      console.error('❌ Test error:', error)
      setResult({ 
        insights: [], 
        suggested_actions: [], 
        processing_stats: { total_processed: 0, ai_model_used: 'mistral:7b-instruct', processing_time_ms: 0, cost_usd: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      high_priority: 'bg-red-100 text-red-800',
      client: 'bg-blue-100 text-blue-800', 
      marketing: 'bg-yellow-100 text-yellow-800',
      personal: 'bg-green-100 text-green-800',
      automated: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getUrgencyColor = (score: number) => {
    if (score >= 8) return 'bg-red-500 text-white'
    if (score >= 6) return 'bg-orange-500 text-white'
    if (score >= 4) return 'bg-yellow-500 text-white'
    return 'bg-green-500 text-white'
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🧠 Email Triage AI Demo</h2>
        <p className="text-muted-foreground mb-4">
          Test AI-powered email processing with {mockEmailData.emails.length} sample emails
          <br />
          <span className="text-xs">Works in demo mode without Ollama, or with real local AI if installed</span>
        </p>
        
        <Button 
          onClick={handleTestTriage} 
          disabled={isProcessing}
          size="lg"
        >
          {isProcessing ? '🔄 Processing...' : '🚀 Test Email Triage'}
        </Button>
      </div>

      {spendingStatus && (
        <Card className="p-4 bg-blue-50">
          <h3 className="font-semibold mb-2">💰 AI Spending Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Daily Spent: <span className="font-mono">${spendingStatus.daily_spent.toFixed(4)}</span></div>
            <div>Daily Budget: <span className="font-mono">${spendingStatus.daily_budget}</span></div>
            <div>Remaining: <span className="font-mono">${spendingStatus.remaining_budget.toFixed(4)}</span></div>
            <div>Used: <span className="font-mono">{spendingStatus.percent_used.toFixed(1)}%</span></div>
          </div>
        </Card>
      )}

      {result?.error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
          <p className="text-red-700">{result.error}</p>
          <div className="mt-2 text-sm text-red-600">
            <p>💡 <strong>Likely cause:</strong> Ollama not running locally</p>
            <p>To fix: Install and start Ollama with a model like <code>ollama pull mistral:7b-instruct</code></p>
          </div>
        </Card>
      )}

      {result && !result.error && (
        <div className="space-y-6">
          <Card className="p-4 bg-green-50">
            <h3 className="font-semibold text-green-800 mb-2">
              ✅ Processing Complete 
              {result.processing_stats.cost_usd === 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  🎭 DEMO MODE
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>Emails: <span className="font-mono">{result.processing_stats.total_processed}</span></div>
              <div>Model: <span className="font-mono">{result.processing_stats.ai_model_used}</span></div>
              <div>Time: <span className="font-mono">{result.processing_stats.processing_time_ms}ms</span></div>
              <div>Cost: <span className="font-mono">${result.processing_stats.cost_usd.toFixed(4)}</span></div>
            </div>
            {result.processing_stats.cost_usd === 0 && (
              <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded">
                💡 <strong>Demo Mode:</strong> Ollama not detected. Showing realistic AI results. 
                Install Ollama for real local AI processing!
              </div>
            )}
          </Card>

          <div>
            <h3 className="text-lg font-semibold mb-4">📧 Email Insights ({result.insights.length})</h3>
            <div className="space-y-3">
              {result.insights.map((insight, index) => (
                <Card key={insight.provider_email_id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium">{mockEmailData.emails[index]?.subject}</p>
                      <p className="text-sm text-muted-foreground">From: {mockEmailData.emails[index]?.sender}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(insight.category)}>
                        {insight.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getUrgencyColor(insight.urgency_score)}>
                        {insight.urgency_score}/10
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{insight.summary}</p>
                  
                  {insight.tasks_extracted.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">📋 Extracted Tasks:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {insight.tasks_extracted.map((task, i) => (
                          <li key={i}>• {task}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">🎯 Suggested Actions ({result.suggested_actions.length})</h3>
            <div className="space-y-2">
              {result.suggested_actions.map((action, index) => (
                <Card key={`${action.email_id}-${index}`} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium capitalize">{action.type}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        for {mockEmailData.emails.find(e => e.id === action.email_id)?.subject}
                      </span>
                    </div>
                    <Badge variant="outline">Priority: {action.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{action.reasoning}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 