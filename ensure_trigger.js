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

const triggerSQL = `
-- 1. Ensure Function Exists (Just to be safe, exact same logic as before)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_doctor BOOLEAN;
  experience_years INTEGER;
BEGIN
  -- Determine Role
  is_doctor := (new.raw_user_meta_data->>'role' = 'doctor');
  
  -- Handle Experience Cast safely
  BEGIN
    experience_years := (new.raw_user_meta_data->>'experience_years')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    experience_years := 0;
  END;

  IF is_doctor THEN
    INSERT INTO public.doctors (
      id, 
      full_name, 
      specialization, 
      hospital_name, 
      experience_years, 
      license_number, 
      is_verified
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', 'Doctor'),
      new.raw_user_meta_data->>'specialization',
      new.raw_user_meta_data->>'hospital_name',
      COALESCE(experience_years, 0),
      new.raw_user_meta_data->>'license_number',
      false
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Default to Patient Profile
    INSERT INTO public.profiles (id, email, name, created_at)
    VALUES (
       new.id, 
       new.email, 
       COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 
       now()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. DROP TRIGGER IF EXISTS (To avoid duplicates/errors)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. CREATE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

async function run() {
  try {
    await client.connect();
    console.log("Connected to Database...");
    
    await client.query(triggerSQL);
    console.log("✅ CRITICAL FIX: 'on_auth_user_created' Trigger successfully created/recreated!");

  } catch (err) {
    console.error("❌ Error creating trigger:", err);
  } finally {
    await client.end();
  }
}

run();
