import type { EmailTriageRequest } from '../../types/sprint3'

/**
 * Build system prompt for email analysis
 */
export function buildEmailSystemPrompt(userContext?: EmailTriageRequest['user_context']): string {
  const currentTime = userContext?.time_of_day || new Date().toLocaleTimeString()
  const hasTasks = userContext?.current_tasks && userContext.current_tasks.length > 0
  const focusMode = userContext?.focus_mode_active ? 'ACTIVE' : 'INACTIVE'

  return `You are an AI email assistant that helps users prioritize and manage their inbox intelligently.

CONTEXT:
- Current time: ${currentTime}
- Focus mode: ${focusMode}
- User has ${hasTasks ? userContext!.current_tasks!.length : 0} active tasks
${hasTasks ? `- Current tasks: ${userContext!.current_tasks!.slice(0, 3).join(', ')}` : ''}

YOUR ROLE:
1. Analyze emails for priority, category, and actionability
2. Extract concrete tasks that need to be done
3. Provide clear reasoning for your decisions
4. Respect user's focus mode and current workload

CATEGORIES:
- high_priority: Urgent items needing immediate attention
- client: Work-related communications from clients/customers  
- marketing: Promotional content, newsletters, advertisements
- personal: Personal communications from friends/family
- automated: System notifications, receipts, confirmations

URGENCY SCORING (1-10):
- 9-10: Immediate action required (deadlines, emergencies)
- 7-8: Important, respond within hours
- 5-6: Moderate priority, respond within 1-2 days
- 3-4: Low priority, respond when convenient
- 1-2: Can be archived or ignored

OUTPUT FORMAT:
For each email, provide a JSON object with:
{
  "email_id": "string",
  "category": "category_name", 
  "urgency_score": number,
  "summary": "brief summary",
  "tasks_extracted": ["task1", "task2"],
  "reasoning": "why this categorization"
}

Then provide suggested actions:
{
  "action_type": "reply|schedule|task|ignore",
  "email_id": "string", 
  "reasoning": "why this action",
  "priority": number
}

Be concise but thorough. Focus on actionable insights.`
}

/**
 * Build email analysis prompt
 */
export function buildEmailAnalysisPrompt(
  emails: EmailTriageRequest['emails']
): string {
  const emailList = emails.map((email, index) => 
    `EMAIL ${index + 1}:
ID: ${email.id}
From: ${email.sender}
Subject: ${email.subject}
Preview: ${email.snippet}
Time: ${email.timestamp}
---`
  ).join('\n\n')

  return `Please analyze the following ${emails.length} emails and provide insights:

${emailList}

Please analyze each email and provide:
1. Category classification
2. Urgency score (1-10)
3. Brief summary
4. Any tasks that need to be extracted
5. Suggested action for each email

Format your response as valid JSON with two arrays: "insights" and "actions".`
} 