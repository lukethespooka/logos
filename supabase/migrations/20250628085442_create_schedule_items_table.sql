-- Create the schedule_items table
CREATE TABLE public.schedule_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    color TEXT DEFAULT 'bg-blue-500' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE public.schedule_items IS 'Stores calendar/schedule items for users.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can manage their own schedule items"
ON public.schedule_items FOR ALL
USING (auth.uid() = user_id);
