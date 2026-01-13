const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:vlJisifpaNRh7LC0@db.vpgkcsigcjfbphqmsygo.supabase.co:5432/postgres',
});

const schema = `
-- Create Profiles Table (extends Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  phone TEXT UNIQUE,
  age INTEGER,
  lmp DATE,
  edd DATE,
  current_week INTEGER,
  risk_status TEXT DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- Create Daily Check-ins Table
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  data JSONB,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own checkins" ON public.daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Create Health Metrics Table
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT NOT NULL, -- 'WEIGHT', 'BP', 'HB'
  value NUMERIC NOT NULL,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own metrics" ON public.health_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metrics" ON public.health_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create Risk Logs Table (for Real-time)
CREATE TABLE IF NOT EXISTS public.risk_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  score INTEGER,
  level TEXT, -- 'green', 'yellow', 'orange', 'red'
  insight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.risk_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own risk logs" ON public.risk_logs FOR SELECT USING (auth.uid() = user_id);
`;

async function run() {
  try {
    await client.connect();
    console.log("Connected to Database...");
    
    await client.query(schema);
    console.log("Schema applied successfully!");
    
  } catch (err) {
    console.error("Error executing schema:", err);
  } finally {
    await client.end();
  }
}

run();
