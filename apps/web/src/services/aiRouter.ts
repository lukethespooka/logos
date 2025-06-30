import { AI_MODELS, DEFAULT_ROUTER_CONFIG } from './ai/models'
import { 
  estimateCost, 
  selectLocalModel, 
  selectCloudModel, 
  logInteraction, 
  spendingTracker 
} from './ai/utils'
import { executeLocalRequest, executeCloudRequest } from './ai/providers'
import type { AIRequest, AIResponse, ApiResponse, LocalModel, CloudModel } from './ai/types'
import type { AIRouterConfig } from '../types/sprint3'

class AIRouterService {
  private config: AIRouterConfig
  private dailySpent: number = 0
  private lastResetDate: string = new Date().toDateString()

  constructor(config: AIRouterConfig = DEFAULT_ROUTER_CONFIG) {
    this.config = config
    this.loadDailySpent()
  }

  /**
   * Route AI request to best available model
   */
  async processRequest(request: AIRequest): Promise<ApiResponse<AIResponse>> {
    const startTime = Date.now()
    
    try {
      // Reset daily spending if new day
      this.checkDailyReset()
      
      // Select best model for this request
      const selectedModel = this.selectModel(request)
      
      // Check budget constraints
      const estimatedCost = estimateCost(request, selectedModel)
      if (this.dailySpent + estimatedCost > this.config.daily_budget_usd) {
        return {
          success: false,
          error: {
            code: 'BUDGET_EXCEEDED',
            message: `Daily budget of $${this.config.daily_budget_usd} would be exceeded`
          }
        }
      }

      // Process with selected model
      const response = await this.executeRequest(request, selectedModel)
      
      // Track costs and usage
      this.dailySpent += response.cost_usd
      this.saveDailySpent()
      
      // Log interaction for learning
      await logInteraction(request, response, true)

      return {
        success: true,
        data: {
          ...response,
          response_time_ms: Date.now() - startTime
        }
      }

    } catch (error) {
      console.error('AI Router error:', error)
      
      // Try fallback if enabled
      if (this.config.fallback_enabled && !request.user_context?.fallback_attempted) {
        console.log('Attempting fallback model...')
        return this.processRequest({
          ...request,
          user_context: { ...request.user_context, fallback_attempted: true }
        })
      }

      await logInteraction(request, null, false, error instanceof Error ? error.message : 'Unknown error')

      return {
        success: false,
        error: {
          code: 'PROCESSING_FAILED',
          message: error instanceof Error ? error.message : 'AI processing failed'
        }
      }
    }
  }

  /**
   * Select optimal model based on request and configuration
   */
  private selectModel(request: AIRequest): LocalModel | CloudModel {
    const { user_context } = request
    
    // Force local for privacy-sensitive operations
    if (this.config.privacy_mode || user_context?.privacy_required) {
      return selectLocalModel(request)
    }

    // Estimate costs for local vs cloud
    const localModel = selectLocalModel(request)
    const cloudModel = selectCloudModel(request)
    
    const cloudCost = estimateCost(request, cloudModel)

    // Use cost threshold to decide
    if (cloudCost > this.config.cost_threshold_usd || this.config.prefer_local) {
      return localModel
    }

    return cloudModel
  }

  /**
   * Execute request with specific model
   */
  private async executeRequest(request: AIRequest, model: LocalModel | CloudModel): Promise<AIResponse> {
    const modelConfig = AI_MODELS[model]

    if (modelConfig.provider === 'ollama') {
      return executeLocalRequest(request, model as LocalModel)
    } else {
      return executeCloudRequest(request, model as CloudModel)
    }
  }

  /**
   * Daily spending tracking
   */
  private loadDailySpent(): void {
    const spent = spendingTracker.loadDailySpent()
    this.dailySpent = spent.amount
    this.lastResetDate = spent.date
  }

  private saveDailySpent(): void {
    spendingTracker.saveDailySpent(this.dailySpent)
  }

  private checkDailyReset(): void {
    const today = new Date().toDateString()
    if (spendingTracker.resetIfNewDay(today, this.lastResetDate)) {
      this.dailySpent = 0
      this.lastResetDate = today
      this.saveDailySpent()
    }
  }

  /**
   * Get current spending and limits
   */
  getSpendingStatus() {
    this.checkDailyReset()
    return {
      daily_spent: this.dailySpent,
      daily_budget: this.config.daily_budget_usd,
      remaining_budget: this.config.daily_budget_usd - this.dailySpent,
      percent_used: (this.dailySpent / this.config.daily_budget_usd) * 100
    }
  }

  /**
   * Update router configuration
   */
  updateConfig(newConfig: Partial<AIRouterConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Export singleton instance
export const aiRouter = new AIRouterService()

// Re-export types for convenience
export type { AIRequest, AIResponse } from './ai/types' 