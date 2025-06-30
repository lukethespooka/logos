import type { 
  LocalModel, 
  CloudModel, 
  AIRouterConfig, 
  AIModelConfig 
} from '../../types/sprint3'

// AI Model configurations with cost and performance data
export const AI_MODELS: Record<LocalModel | CloudModel, AIModelConfig> = {
  // Local Models (Ollama) - Updated to match actually installed models
  'llama3.2:1b': {
    name: 'llama3.2:1b',
    provider: 'ollama',
    cost_per_1k_tokens: 0.0, // Free local processing
    privacy_level: 'high',
    max_tokens: 2048,
    timeout_ms: 15000
  },
  'llama3.2:3b': {
    name: 'llama3.2:3b',
    provider: 'ollama',
    cost_per_1k_tokens: 0.0,
    privacy_level: 'high',
    max_tokens: 8192,
    timeout_ms: 25000
  },
  'all-minilm:l6-v2': {
    name: 'all-minilm:l6-v2',
    provider: 'ollama',
    cost_per_1k_tokens: 0.0,
    privacy_level: 'high',
    max_tokens: 512,
    timeout_ms: 10000
  },
  
  // Cloud Models
  'gpt-4o-mini': {
    name: 'gpt-4o-mini',
    provider: 'openai',
    cost_per_1k_tokens: 0.00015, // $0.15 per 1M tokens
    privacy_level: 'medium',
    max_tokens: 16384,
    timeout_ms: 10000
  },
  'gpt-4': {
    name: 'gpt-4',
    provider: 'openai',
    cost_per_1k_tokens: 0.03, // $30 per 1M tokens
    privacy_level: 'medium',
    max_tokens: 8192,
    timeout_ms: 15000
  },
  'claude-3.5-sonnet': {
    name: 'claude-3.5-sonnet',
    provider: 'claude',
    cost_per_1k_tokens: 0.003, // $3 per 1M tokens
    privacy_level: 'medium',
    max_tokens: 8192,
    timeout_ms: 12000
  }
}

// Default router configuration
export const DEFAULT_ROUTER_CONFIG: AIRouterConfig = {
  cost_threshold_usd: 0.01, // Switch to local if cost > 1 cent
  daily_budget_usd: 2.0,    // $2 daily budget
  prefer_local: true,       // Privacy-first approach
  fallback_enabled: true,   // Fall back to cloud if local fails
  privacy_mode: true        // Use local models for sensitive data
}

// Model selection strategies - Updated to use available models
export const MODEL_SELECTION = {
  // Code-related tasks - use the smaller, faster model
  CODE_TASKS: ['llama3.2:1b'] as LocalModel[],
  
  // Quick tasks - fast models
  QUICK_TASKS: ['llama3.2:1b'] as LocalModel[],
  
  // Complex analysis - most capable (but may need memory check)
  COMPLEX_ANALYSIS: ['llama3.2:1b'] as LocalModel[], // Using 1b model to avoid memory issues
  
  // Cloud fallbacks
  CLOUD_QUICK: ['gpt-4o-mini'] as CloudModel[],
  CLOUD_COMPLEX: ['claude-3.5-sonnet', 'gpt-4'] as CloudModel[]
} as const 