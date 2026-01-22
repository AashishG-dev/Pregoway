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

const fixRlsSQL = `
-- Drop existing insert policy to avoid conflicts/confusion
DROP POLICY IF EXISTS "Parties send consultations" ON public.consultations;

-- Create a robust Insert Policy
-- Rule: You can insert a message effectively if YOU are the sender.
-- We also verify you are either the doctor or patient in the relation, but arguably
-- checking sender_id = auth.uid() is the most critical and robust check.
CREATE POLICY "Users can insert their own messages" ON public.consultations
FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

-- Ensure Select policy is also correct (Already exists likely, but let's reinforce)
DROP POLICY IF EXISTS "Parties view consultations" ON public.consultations;

CREATE POLICY "Parties view consultations" ON public.consultations
FOR SELECT USING (
  doctor_id = auth.uid() OR patient_id = auth.uid()
);

-- Grant permissions just in case (should be default for public schema but good to ensure)
GRANT ALL ON public.consultations TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE consultations_id_seq TO authenticated; -- if using serial, but we use uuid so less relevant
`;

async function run() {
  try {
    await client.connect();
    console.log("Connected to Database...");
    
    await client.query(fixRlsSQL);
    console.log("✅ RLS Policy for Consultations updated!");

  } catch (err) {
    console.error("❌ Error updating RLS:", err);
  } finally {
    await client.end();
  }
}

run();
