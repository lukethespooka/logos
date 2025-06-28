-- Add subtask support to the tasks table
ALTER TABLE public.tasks 
ADD COLUMN parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
ADD COLUMN level INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;

-- Add index for better performance on subtask queries
CREATE INDEX idx_tasks_parent_task_id ON public.tasks(parent_task_id);
CREATE INDEX idx_tasks_user_level ON public.tasks(user_id, level);

-- Add constraint to prevent deep nesting (max 2 levels for now)
ALTER TABLE public.tasks 
ADD CONSTRAINT chk_max_nesting_level CHECK (level <= 1);

-- Update RLS policy to handle subtask permissions without recursion
-- Simple policy: users can only access their own tasks
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;
CREATE POLICY "Users can manage their own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id); 