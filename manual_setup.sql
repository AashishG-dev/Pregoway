-- Create Documents Table for Vault
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- 'Lab', 'Scan', 'Rx', 'Other'
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'Analyzed', -- 'Pending', 'Analyzed'
  risk_status TEXT DEFAULT 'Normal' -- 'Normal', 'High'
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "Users can view own docs" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own docs" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own docs" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Create Storage Bucket 'vault'
-- Note: This is usually done via Dashboard > Storage > Create Bucket, or via client-side code if allowed.
-- SQL for creating buckets depends on the extensions installed (pg_net/storage-api).
-- Standard way if storage schema is available:
insert into storage.buckets (id, name, public) 
values ('vault', 'vault', true)
on conflict (id) do nothing;

-- Storage Policies
-- Allow authenticated users to upload to 'vault' bucket
create policy "Authenticated can upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'vault' );

-- Allow authenticated users to view files in 'vault' bucket
create policy "Authenticated can view"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'vault' );
