import type { EmailTriageRequest, EmailCategory } from '../../types/sprint3'

/**
 * Split emails into batches
 */
export function createBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Get triage statistics from stored interactions
 */
export async function getTriageStats(): Promise<{
  total_processed: number;
  avg_urgency: number;
  category_breakdown: Record<EmailCategory, number>;
  processing_history: any[];
}> {
  // Get stored interactions for email triage
  const interactions = JSON.parse(localStorage.getItem('ai_interactions') || '[]');
  const emailInteractions = interactions.filter((i: any) => i.interaction_type === 'email_triage');

  const totalProcessed = emailInteractions.reduce((sum: number, i: any) => sum + (i.emails_processed || 1), 0);
  const avgUrgency = emailInteractions.length > 0 
    ? emailInteractions.reduce((sum: number, i: any) => sum + (i.avg_urgency || 5), 0) / emailInteractions.length 
    : 5;

  return {
    total_processed: totalProcessed,
    avg_urgency: avgUrgency,
    category_breakdown: {
      high_priority: 0,
      client: 0,
      marketing: 0,
      personal: 0,
      automated: 0
    },
    processing_history: emailInteractions.slice(-10) // Last 10 interactions
  };
}

// Mock data for testing
export const mockEmailData: EmailTriageRequest = {
  emails: [
    {
      id: 'email_1',
      subject: 'Urgent: Project deadline moved up',
      sender: 'manager@company.com',
      snippet: 'Hi team, we need to move the project deadline to Friday instead of next week...',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      id: 'email_2', 
      subject: 'Weekly Newsletter - Tech Updates',
      sender: 'newsletter@techsite.com',
      snippet: 'This week in technology: AI breakthroughs, new frameworks, and industry news...',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
    },
    {
      id: 'email_3',
      subject: 'Meeting notes and action items',
      sender: 'colleague@company.com', 
      snippet: 'Thanks for the productive meeting today. Here are the key action items we discussed...',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    },
    {
      id: 'email_4',
      subject: 'Your Amazon order has shipped',
      sender: 'ship-confirm@amazon.com',
      snippet: 'Good news! Your order #123-456789 has shipped and is on its way...',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
    }
  ],
  user_context: {
    current_tasks: ['Complete project proposal', 'Review code changes', 'Prepare presentation'],
    focus_mode_active: false,
    time_of_day: new Date().toLocaleTimeString()
  }
} 