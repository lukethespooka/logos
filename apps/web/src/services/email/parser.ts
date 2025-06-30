import type { 
  EmailTriageRequest, 
  EmailTriageResponse, 
  EmailInsight, 
  EmailCategory 
} from '../../types/sprint3'

/**
 * Parse AI response into structured data
 */
export function parseAIResponse(
  aiContent: string, 
  originalEmails: EmailTriageRequest['emails']
): { insights: Omit<EmailInsight, 'id' | 'user_id' | 'ai_model_used'>[], actions: EmailTriageResponse['suggested_actions'] } {
  try {
    // Try to extract JSON from response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    let parsedData: any;

    if (jsonMatch) {
      parsedData = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback: parse structured text response
      parsedData = parseTextResponse(aiContent, originalEmails);
    }

    const insights = (parsedData.insights || []).map((insight: any, index: number) => ({
      provider_email_id: insight.email_id || originalEmails[index]?.id || `email_${index}`,
      provider: 'gmail' as const,
      category: validateCategory(insight.category),
      summary: insight.summary || 'No summary provided',
      tasks_extracted: Array.isArray(insight.tasks_extracted) ? insight.tasks_extracted : [],
      urgency_score: Math.max(1, Math.min(10, parseInt(insight.urgency_score) || 5)),
      processed_at: new Date().toISOString()
    }));

    const actions = (parsedData.actions || []).map((action: any) => ({
      type: action.action_type || action.type || 'ignore',
      email_id: action.email_id,
      reasoning: action.reasoning || 'No reasoning provided',
      priority: parseInt(action.priority) || 5
    }));

    return { insights, actions };

  } catch (error) {
    console.error('Failed to parse AI response:', error);
    
    // Fallback: create basic insights
    return {
      insights: originalEmails.map((email) => ({
        provider_email_id: email.id,
        provider: 'gmail' as const,
        category: categorizeFallback(email),
        summary: `Email from ${email.sender}: ${email.subject}`,
        tasks_extracted: [],
        urgency_score: 5,
        processed_at: new Date().toISOString()
      })),
      actions: originalEmails.map(email => ({
        type: 'ignore' as const,
        email_id: email.id,
        reasoning: 'AI analysis failed, marked for manual review',
        priority: 3
      }))
    };
  }
}

/**
 * Parse text-based AI response as fallback
 */
function parseTextResponse(content: string, originalEmails: EmailTriageRequest['emails']) {
  const insights = originalEmails.map((email, index) => {
    // Look for email-specific analysis in the text
    const emailSection = content.split(`EMAIL ${index + 1}`)[1]?.split('EMAIL')[0] || content;
    
    return {
      email_id: email.id,
      category: extractCategoryFromText(emailSection),
      urgency_score: extractUrgencyFromText(emailSection),
      summary: extractSummaryFromText(emailSection, email),
      tasks_extracted: extractTasksFromText(emailSection),
      reasoning: 'Parsed from text analysis'
    };
  });

  const actions = insights.map(insight => ({
    action_type: insight.urgency_score > 7 ? 'reply' : 'ignore',
    email_id: insight.email_id,
    reasoning: `Based on urgency score of ${insight.urgency_score}`,
    priority: insight.urgency_score
  }));

  return { insights, actions };
}

/**
 * Validate and sanitize category
 */
function validateCategory(category: string): EmailCategory {
  const validCategories: EmailCategory[] = ['high_priority', 'client', 'marketing', 'personal', 'automated'];
  const normalized = category?.toLowerCase().replace(/[^a-z_]/g, '') as EmailCategory;
  return validCategories.includes(normalized) ? normalized : 'personal';
}

/**
 * Fallback categorization based on email content
 */
function categorizeFallback(email: EmailTriageRequest['emails'][0]): EmailCategory {
  const subject = email.subject.toLowerCase();
  const sender = email.sender.toLowerCase();

  if (subject.includes('urgent') || subject.includes('asap') || subject.includes('emergency')) {
    return 'high_priority';
  }
  
  if (sender.includes('noreply') || sender.includes('no-reply') || subject.includes('receipt')) {
    return 'automated';
  }
  
  if (subject.includes('newsletter') || subject.includes('unsubscribe') || subject.includes('promo')) {
    return 'marketing';
  }
  
  if (sender.includes('@company.com') || subject.includes('project') || subject.includes('meeting')) {
    return 'client';
  }

  return 'personal';
}

// Text parsing utilities
function extractCategoryFromText(text: string): string {
  const categories = ['high_priority', 'client', 'marketing', 'personal', 'automated'];
  for (const category of categories) {
    if (text.toLowerCase().includes(category)) {
      return category;
    }
  }
  return 'personal';
}

function extractUrgencyFromText(text: string): number {
  const urgencyMatch = text.match(/urgency[:\s]*(\d+)/i);
  if (urgencyMatch) {
    return Math.max(1, Math.min(10, parseInt(urgencyMatch[1])));
  }
  return 5;
}

function extractSummaryFromText(text: string, email: EmailTriageRequest['emails'][0]): string {
  // Look for summary-like content
  const summaryMatch = text.match(/summary[:\s]*([^\n]+)/i);
  if (summaryMatch) {
    return summaryMatch[1].trim();
  }
  return `Email from ${email.sender}: ${email.subject}`;
}

function extractTasksFromText(text: string): string[] {
  const tasks: string[] = [];
  const taskPatterns = [
    /task[:\s]*([^\n]+)/gi,
    /action[:\s]*([^\n]+)/gi,
    /todo[:\s]*([^\n]+)/gi
  ];

  for (const pattern of taskPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 0) {
        tasks.push(match[1].trim());
      }
    }
  }

  return tasks.slice(0, 5); // Limit to 5 tasks per email
} 