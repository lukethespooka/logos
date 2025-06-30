import { aiRouter } from './aiRouter'
import { buildEmailSystemPrompt, buildEmailAnalysisPrompt } from './email/prompts'
import { parseAIResponse } from './email/parser'
import { createBatches, getTriageStats, mockEmailData } from './email/mockData'
import type { 
  EmailTriageRequest, 
  EmailTriageResponse, 
  EmailInsight, 
  ApiResponse 
} from '../types/sprint3'

class EmailTriageService {
  
  /**
   * Process a batch of emails and generate insights
   */
  async triageEmails(request: EmailTriageRequest): Promise<ApiResponse<EmailTriageResponse>> {
    try {
      if (!request.emails || request.emails.length === 0) {
        return {
          success: false,
          error: {
            code: 'NO_EMAILS',
            message: 'No emails provided for triage'
          }
        }
      }

      const startTime = Date.now()
      const insights: EmailInsight[] = []
      const suggestedActions: EmailTriageResponse['suggested_actions'] = []

      // Process emails in batches to avoid overwhelming AI
      const batchSize = 5
      const emailBatches = createBatches(request.emails, batchSize)
      
      let totalCost = 0
      let totalTokens = 0

      for (const batch of emailBatches) {
        const batchResult = await this.processBatch(batch, request.user_context)
        
        if (batchResult.success && batchResult.data) {
          insights.push(...batchResult.data.insights)
          suggestedActions.push(...batchResult.data.actions)
          totalCost += batchResult.data.cost
          totalTokens += batchResult.data.tokens
        }
      }

      // Sort insights by urgency score (highest first)
      insights.sort((a, b) => b.urgency_score - a.urgency_score)
      
      // Sort actions by priority
      suggestedActions.sort((a, b) => b.priority - a.priority)

      const processingTime = Date.now() - startTime

      return {
        success: true,
        data: {
          insights,
          suggested_actions: suggestedActions,
          processing_stats: {
            total_processed: request.emails.length,
            ai_model_used: insights[0]?.ai_model_used || 'llama3.1:8b',
            processing_time_ms: processingTime,
            cost_usd: totalCost
          }
        },
        meta: {
          cost_usd: totalCost,
          processing_time_ms: processingTime,
          ai_model_used: insights[0]?.ai_model_used || 'llama3.1:8b'
        }
      }

    } catch (error) {
      console.error('Email triage error:', error)
      return {
        success: false,
        error: {
          code: 'TRIAGE_FAILED',
          message: error instanceof Error ? error.message : 'Email triage processing failed'
        }
      }
    }
  }

  /**
   * Process a batch of emails
   */
  private async processBatch(
    emails: EmailTriageRequest['emails'], 
    userContext?: EmailTriageRequest['user_context']
  ) {
    const systemPrompt = buildEmailSystemPrompt(userContext)
    const userPrompt = buildEmailAnalysisPrompt(emails)

    const aiResponse = await aiRouter.processRequest({
      prompt: userPrompt,
      system_prompt: systemPrompt,
      interaction_type: 'email_triage',
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent analysis
      user_context: {
        privacy_required: true, // Force local processing for email content
        batch_size: emails.length
      }
    })

    if (!aiResponse.success || !aiResponse.data) {
      return {
        success: false,
        error: aiResponse.error
      }
    }

    // Parse AI response into structured insights
    const parsed = parseAIResponse(aiResponse.data.content, emails)

    return {
      success: true,
      data: {
        insights: parsed.insights.map(insight => ({
          ...insight,
          id: crypto.randomUUID(),
          user_id: 'current_user', // Would get from auth context
          ai_model_used: aiResponse.data!.model_used
        })),
        actions: parsed.actions,
        cost: aiResponse.data.cost_usd,
        tokens: aiResponse.data.tokens_used
      }
    }
  }

  /**
   * Get triage statistics
   */
  async getTriageStats() {
    return getTriageStats()
  }

  /**
   * Test triage with mock data
   */
  async testWithMockData() {
    console.log('🧪 Testing Email Triage with mock data...')
    const result = await this.triageEmails(mockEmailData)
    
    if (result.success) {
      console.log('✅ Triage successful:', result.data)
      return result.data
    } else {
      console.error('❌ Triage failed:', result.error)
      return null
    }
  }
}

// Export singleton instance
export const emailTriageService = new EmailTriageService()

// Re-export for convenience
export { mockEmailData } from './email/mockData' 