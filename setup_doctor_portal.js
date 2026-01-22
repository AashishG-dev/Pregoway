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
  connectionString: envConfig.DATABASE_URL,
});

const schema = `
-- Create Doctors Table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  specialization TEXT,
  hospital_name TEXT,
  experience_years INTEGER,
  license_number TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Doctors
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors can view own profile" ON public.doctors FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Doctors can update own profile" ON public.doctors FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Doctors can insert own profile" ON public.doctors FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public can view verified doctors" ON public.doctors FOR SELECT USING (true);


-- Create Doctor-Patient Relationship Table
CREATE TABLE IF NOT EXISTS public.doctor_patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'archived'
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(doctor_id, patient_id)
);

-- Enable RLS for Relationships
ALTER TABLE public.doctor_patients ENABLE ROW LEVEL SECURITY;

-- Doctors can view their patients
CREATE POLICY "Doctors can view assigned patients" ON public.doctor_patients 
  FOR SELECT USING (auth.uid() = doctor_id);

-- Patients can view their doctors
CREATE POLICY "Patients can view assigned doctors" ON public.doctor_patients 
  FOR SELECT USING (auth.uid() = patient_id);

-- Users can request doctors (insert)
CREATE POLICY "Users can request doctors" ON public.doctor_patients 
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Doctors can accept requests (update status)
CREATE POLICY "Doctors can manage requests" ON public.doctor_patients 
  FOR UPDATE USING (auth.uid() = doctor_id);


-- Create Consultations / Chat Table
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id),
  patient_id UUID REFERENCES public.profiles(id),
  sender_id UUID REFERENCES auth.users(id), -- who sent the message
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Both parties can view messages they are involved in
CREATE POLICY "Parties view consultations" ON public.consultations 
  FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

-- Both parties can send messages
CREATE POLICY "Parties send consultations" ON public.consultations 
  FOR INSERT WITH CHECK (
    (auth.uid() = doctor_id) OR 
    (auth.uid() = patient_id)
  );


-- Helper View: Doctor Dashboard Metrics (Optional but useful)
-- Counts total active patients for a doctor
CREATE OR REPLACE VIEW public.doctor_dashboard_stats AS
SELECT 
  doctor_id,
  COUNT(*) FILTER (WHERE status = 'active') as active_patients,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_requests
FROM public.doctor_patients
GROUP BY doctor_id;

`;

async function run() {
  try {
    await client.connect();
    console.log("Connected to Database...");

    await client.query(schema);
    console.log("Doctor Portal Schema applied successfully!");

  } catch (err) {
    console.error("Error executing schema:", err);
  } finally {
    await client.end();
  }
}

run();
