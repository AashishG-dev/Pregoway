-- NUCLEAR OPTION: Drop and Recreate Timeline Table
-- Run this in Supabase SQL Editor to fix schema mismatches

DROP TABLE IF EXISTS public.health_timeline;

CREATE TABLE public.health_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  event_type TEXT NOT NULL, -- 'scan', 'visit', 'lab', 'birth'
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'missed'
  week INT DEFAULT 0, -- Added week column explicitly just in case
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.health_timeline ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own timeline" ON public.health_timeline FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own timeline" ON public.health_timeline FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own timeline" ON public.health_timeline FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own timeline" ON public.health_timeline FOR DELETE USING (auth.uid() = user_id);
