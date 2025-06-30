import type { 
  AIProvider, 
  LocalModel, 
  CloudModel, 
  InteractionType,
  ApiResponse 
} from '../../types/sprint3'

export interface AIRequest {
  prompt: string
  system_prompt?: string
  interaction_type: InteractionType
  max_tokens?: number
  temperature?: number
  user_context?: Record<string, any>
}

export interface AIResponse {
  content: string
  model_used: LocalModel | CloudModel
  provider: AIProvider
  tokens_used: number
  cost_usd: number
  response_time_ms: number
  cached?: boolean
}

export type { AIProvider, LocalModel, CloudModel, InteractionType, ApiResponse } 