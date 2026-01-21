const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Manual Env Parsing
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const firstEqual = line.indexOf('=');
    if (firstEqual === -1) return acc;
    const key = line.substring(0, firstEqual).trim();
    let val = line.substring(firstEqual + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
    }
    acc[key] = val.trim();
    return acc;
}, {});

const client = new Client({
    connectionString: envConfig.DATABASE_URL || 'postgresql://postgres:p0Ehjx20DFvu2GRF@db.cmtlzvybkgxkpjzbctkf.supabase.co:5432/postgres',
});

const schema = `
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
CREATE POLICY "Users can view own docs" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own docs" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own docs" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Create Storage Bucket
insert into storage.buckets (id, name, public) 
values ('vault', 'vault', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Authenticated can upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'vault' );

create policy "Authenticated can view"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'vault' );
`;

async function run() {
    try {
        await client.connect();
        console.log("Connected to Database...");

        await client.query(schema);
        console.log("Vault Schema & Storage applied successfully!");

    } catch (err) {
        console.error("Error executing schema:", err);
    } finally {
        await client.end();
    }
}

run();
