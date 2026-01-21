-- NUCLEAR OPTION 2: Reset Vault Backend
-- Creating Storage Bucket 'vault' and 'documents' table.

-- 1. Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, 
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'Analyzed', 
  risk_status TEXT DEFAULT 'Normal'
);

-- 2. Enable RLS on Table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own docs" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own docs" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own docs" ON public.documents;

CREATE POLICY "Users can view own docs" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own docs" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own docs" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- 3. Create Storage Bucket 'vault'
-- Since standard SQL might fail for buckets if not superuser, we try the insert method.
-- If this fails, user MUST create bucket manually in Dashboard -> Storage -> New Bucket -> 'vault' -> Public/Private (Private is safer but needs policies).
-- We will try to make it public for simplicity if private fails, but policies below handle private.

INSERT INTO storage.buckets (id, name, public)
VALUES ('vault', 'vault', true) -- Try public first to avoid complicated download token issues for MVP
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Storage Policies (CRITICAL)
-- Must allow authenticated users to Select/Insert/Delete in 'vault' bucket.

DROP POLICY IF EXISTS "Authenticated can upload vault" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view vault" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete vault" ON storage.objects;

CREATE POLICY "Authenticated can upload vault"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'vault' );

CREATE POLICY "Authenticated can view vault"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'vault' );

CREATE POLICY "Authenticated can delete vault"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'vault' );
