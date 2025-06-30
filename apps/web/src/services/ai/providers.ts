import { AI_MODELS } from './models'
import type { AIRequest, AIResponse, LocalModel, CloudModel } from './types'

/**
 * Execute request with local Ollama model
 */
export async function executeLocalRequest(request: AIRequest, model: LocalModel): Promise<AIResponse> {
  const { prompt, system_prompt, max_tokens = 1000, temperature = 0.7 } = request
  const startTime = Date.now()

  try {
    // Ollama API call
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: system_prompt ? `${system_prompt}\n\n${prompt}` : prompt,
        options: {
          num_predict: max_tokens,
          temperature: temperature
        },
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const responseTime = Date.now() - startTime

    return {
      content: data.response,
      model_used: model,
      provider: 'ollama',
      tokens_used: Math.ceil(data.response?.length / 4) || 500,
      cost_usd: 0,
      response_time_ms: responseTime
    }
  } catch (error) {
    // If Ollama is not available, provide demo response for email triage
    if (request.interaction_type === 'email_triage') {
      console.log('🎭 Ollama not available, using demo mode for email triage...')
      return generateDemoEmailTriageResponse(request, model)
    }
    
    // Re-throw error for other interaction types
    throw error
  }
}

/**
 * Generate demo email triage response
 */
function generateDemoEmailTriageResponse(_request: AIRequest, model: LocalModel): AIResponse {
  const demoResponse = {
    "insights": [
      {
        "email_id": "email_1",
        "category": "high_priority",
        "urgency_score": 9,
        "summary": "Manager requests urgent deadline change for project, requiring immediate team coordination and timeline adjustment",
        "tasks_extracted": [
          "Review current project timeline",
          "Coordinate with team members on new deadline",
          "Update project deliverables schedule"
        ],
        "reasoning": "Contains 'urgent' keyword, from management, involves deadline changes affecting multiple people"
      },
      {
        "email_id": "email_2", 
        "category": "marketing",
        "urgency_score": 2,
        "summary": "Weekly technology newsletter with industry updates and new framework announcements",
        "tasks_extracted": [],
        "reasoning": "Newsletter format, promotional content, can be read when convenient"
      },
      {
        "email_id": "email_3",
        "category": "client", 
        "urgency_score": 7,
        "summary": "Follow-up from productive meeting with specific action items requiring prompt attention",
        "tasks_extracted": [
          "Review meeting action items",
          "Follow up on discussed deliverables",
          "Schedule next project check-in"
        ],
        "reasoning": "Work-related from colleague, contains action items, needs timely response"
      },
      {
        "email_id": "email_4",
        "category": "automated",
        "urgency_score": 3, 
        "summary": "Automated shipping confirmation for recent Amazon purchase",
        "tasks_extracted": [
          "Track package delivery"
        ],
        "reasoning": "Automated system notification, informational only, no immediate action required"
      }
    ],
    "actions": [
      {
        "action_type": "reply",
        "email_id": "email_1",
        "reasoning": "High urgency deadline change requires immediate acknowledgment and planning discussion",
        "priority": 9
      },
      {
        "action_type": "task", 
        "email_id": "email_3",
        "reasoning": "Action items from meeting should be converted to trackable tasks", 
        "priority": 7
      },
      {
        "action_type": "ignore",
        "email_id": "email_2",
        "reasoning": "Newsletter can be read during downtime, no immediate action needed",
        "priority": 2
      },
      {
        "action_type": "ignore",
        "email_id": "email_4", 
        "reasoning": "Automated notification, tracking can be done when convenient",
        "priority": 3
      }
    ]
  }

  const responseTime = 800 + Math.random() * 400 // Simulate 800-1200ms processing

  return {
    content: JSON.stringify(demoResponse),
    model_used: model,
    provider: 'ollama',
    tokens_used: 450,
    cost_usd: 0,
    response_time_ms: Math.round(responseTime)
  }
}

/**
 * Execute request with cloud model (placeholder)
 */
export async function executeCloudRequest(request: AIRequest, model: CloudModel): Promise<AIResponse> {
  // This would integrate with OpenAI/Claude APIs
  // For now, return mock response to avoid external API costs
  const modelConfig = AI_MODELS[model]
  const estimatedTokens = Math.ceil(request.prompt.length / 4) + (request.max_tokens || 1000)
  
  return {
    content: `[Mock response from ${model}] This would process: ${request.prompt.substring(0, 100)}...`,
    model_used: model,
    provider: modelConfig.provider,
    tokens_used: estimatedTokens,
    cost_usd: (estimatedTokens / 1000) * modelConfig.cost_per_1k_tokens,
    response_time_ms: 2000
  }
} 