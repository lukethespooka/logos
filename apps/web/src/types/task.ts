export interface Task {
  id: string;
  title: string;
  description: string | null;
  urgency: "High" | "Medium" | "Low";
  status: 'todo' | 'in_progress' | 'done';
  completed_at: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  sort_order?: number;
  parent_task_id?: string | null;
  level: number;
  subtasks?: Task[];
  user_id: string;
  provider?: string;
  external_id?: string;
  metadata?: Record<string, any>;
}

export interface TaskFilters {
  search: string;
  urgency: ("High" | "Medium" | "Low")[];
  status: ("active" | "completed")[];
  overdue: boolean;
  include_subtasks?: boolean;
  include_completed?: boolean;
  limit?: number;
  offset?: number;
} 