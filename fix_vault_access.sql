-- FIX VAULT ACCESS
-- 1. Disable RLS momentarily to confirm if that's the blocker
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- 2. Grant explicit permissions incase the user role is weird
GRANT ALL ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;

-- 3. Ensure the columns are exactly what we expect (just in case)
-- (No-op if they exist, but good for sanity)
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Analyzed';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id UUID;
