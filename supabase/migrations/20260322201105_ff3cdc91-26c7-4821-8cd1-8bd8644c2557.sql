-- Create feed_items table for AI-generated news articles
CREATE TABLE public.feed_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('local', 'state', 'federal')),
  relevant_office TEXT NOT NULL,
  source TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;

-- Feed items are public read (civic news for everyone)
CREATE POLICY "Anyone can read feed items"
  ON public.feed_items FOR SELECT
  USING (true);

-- Only service role (edge functions) can insert
CREATE POLICY "Service role can insert feed items"
  ON public.feed_items FOR INSERT
  WITH CHECK (true);