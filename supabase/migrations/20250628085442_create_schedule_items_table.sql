-- Create the schedule_items table
CREATE TABLE public.schedule_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    color TEXT DEFAULT 'bg-blue-500' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    provider_data JSONB DEFAULT NULL
);

-- Add comments for clarity
COMMENT ON TABLE public.schedule_items IS 'Stores calendar/schedule items for users.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can manage their own schedule items"
ON public.schedule_items FOR ALL
USING (auth.uid() = user_id);

-- Create function to get user schedule
CREATE OR REPLACE FUNCTION public.get_user_schedule(
  p_user_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE,
  p_providers TEXT[] DEFAULT NULL,
  p_include_tasks BOOLEAN DEFAULT true,
  p_include_completed BOOLEAN DEFAULT false,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  color TEXT,
  provider_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Return schedule items
  RETURN QUERY
  SELECT 
    si.id,
    si.user_id,
    si.title,
    si.start_time,
    si.end_time,
    si.color,
    si.provider_data,
    si.created_at,
    si.updated_at
  FROM public.schedule_items si
  WHERE si.user_id = p_user_id
    AND si.start_time >= p_start_date
    AND si.end_time <= p_end_date
    AND (p_providers IS NULL OR 
         (si.provider_data->>'provider')::TEXT = ANY(p_providers))
  ORDER BY si.start_time ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
