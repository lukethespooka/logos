import type { AIRequest, LocalModel, CloudModel } from './types'
import { AI_MODELS, MODEL_SELECTION } from './models'

/**
 * Estimate tokens for a request
 */
export function estimateTokens(request: AIRequest): number {
  const { prompt, system_prompt = '', max_tokens = 1000 } = request
  const inputTokens = Math.ceil((prompt.length + system_prompt.length) / 4) // ~4 chars per token
  return inputTokens + max_tokens // Input + expected output
}

/**
 * Estimate cost for request with specific model
 */
export function estimateCost(request: AIRequest, model: LocalModel | CloudModel): number {
  const modelConfig = AI_MODELS[model]
  const estimatedTokens = estimateTokens(request)
  return (estimatedTokens / 1000) * modelConfig.cost_per_1k_tokens
}

/**
 * Select best local model for request
 */
export function selectLocalModel(request: AIRequest): LocalModel {
  const { interaction_type, max_tokens = 1000 } = request

  // Code-related tasks
  if (interaction_type === 'task_generation') {
    return MODEL_SELECTION.CODE_TASKS[0]
  }

  // Quick tasks - use fast model
  if (max_tokens < 1000 || interaction_type === 'focus_suggestion') {
    return MODEL_SELECTION.QUICK_TASKS[0]
  }

  // Complex analysis - use most capable
  if (interaction_type === 'email_triage' || interaction_type === 'brief') {
    return MODEL_SELECTION.COMPLEX_ANALYSIS[0]
  }

  // Default to balanced model
  return 'llama3.2:1b'
}

/**
 * Select best cloud model for request
 */
export function selectCloudModel(request: AIRequest): CloudModel {
  const { interaction_type, max_tokens = 1000 } = request

  // Complex reasoning - use best model
  if (interaction_type === 'email_triage' && max_tokens > 2000) {
    return MODEL_SELECTION.CLOUD_COMPLEX[0]
  }

  // Quick tasks - use cost-effective model
  return MODEL_SELECTION.CLOUD_QUICK[0]
}

/**
 * Log interaction for analytics and learning
 */
export async function logInteraction(
  request: AIRequest,
  response: { model_used: LocalModel | CloudModel; tokens_used: number; cost_usd: number; response_time_ms: number } | null,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  const interaction = {
    interaction_type: request.interaction_type,
    model_used: response?.model_used || 'unknown',
    tokens_used: response?.tokens_used || 0,
    cost_usd: response?.cost_usd || 0,
    response_time_ms: response?.response_time_ms || 0,
    success,
    error_message: errorMessage,
    timestamp: new Date().toISOString()
  }

  // Store in localStorage for now (would be database in production)
  const interactions = JSON.parse(localStorage.getItem('ai_interactions') || '[]')
  interactions.push(interaction)
  
  // Keep only last 100 interactions
  if (interactions.length > 100) {
    interactions.splice(0, interactions.length - 100)
  }
  
  localStorage.setItem('ai_interactions', JSON.stringify(interactions))
}

/**
 * Daily spending tracking utilities
 */
export const spendingTracker = {
  loadDailySpent(): { amount: number; date: string } {
    const stored = localStorage.getItem('ai_daily_spent')
    const today = new Date().toDateString()
    
    if (stored) {
      const data = JSON.parse(stored)
      if (data.date === today) {
        return { amount: data.amount, date: today }
      }
    }
    
    return { amount: 0, date: today }
  },

  saveDailySpent(amount: number): void {
    const today = new Date().toDateString()
    localStorage.setItem('ai_daily_spent', JSON.stringify({
      date: today,
      amount: amount
    }))
  },

  resetIfNewDay(currentDate: string, lastResetDate: string): boolean {
    return currentDate !== lastResetDate
  }
} 