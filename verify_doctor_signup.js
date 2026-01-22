const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testDoctorSignup() {
    // Use a cleaner email
    const testEmail = `doctor.test.${Date.now()}@test.com`;
    const testPassword = 'password123';

    console.log(`\n--- START DIAGNOSTIC ---`);

    // 0. Check if Table Exists
    const { data: tableCheck, error: tableError } = await supabase
        .from('doctors')
        .select('count', { count: 'exact', head: true });
    
    if (tableError) {
        console.error("❌ Critical: 'doctors' table not accessible:", tableError.message);
    } else {
        console.log("✅ 'doctors' table exists and is accessible.");
    }

    console.log(`1. Attempting to Sign Up Doctor: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
            data: {
                full_name: 'Test Doctor',
                role: 'doctor',
                specialization: 'Cardiology',
                hospital_name: 'General Hospital',
                license_number: 'TEST-123',
                experience_years: 10
            }
        }
    });

    if (authError) {
        console.error("❌ Auth Signup Failed:", authError.message);
        return;
    }

    console.log("✅ Auth Signup Successful:", authData.user?.id);
    
    // Give the trigger a moment to fire
    console.log("Waiting 3s for trigger...");
    await new Promise(r => setTimeout(r, 3000));

    console.log("2. Verifying 'doctors' table entry...");
    
    const { data: doctorData, error: dbError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', authData.user?.id);
        // .single() sometimes errors if 0 rows, let's use list

    if (dbError) {
        console.error("❌ Database Fetch Error:", dbError.message);
    } else if (doctorData.length === 0) {
        console.error("❌ Doctor Entry Not Found in DB.");
        console.log("   Possible Causes:");
        console.log("   - Trigger 'handle_new_user' failed or didn't run.");
        console.log("   - RLS policy prevented insertion (unlikely for Trigger with SECURITY DEFINER).");
        console.log("   - Metadata 'role' was not passed correctly.");
    } else {
        console.log("✅ Doctor Database Entry Found!");
        console.log(doctorData[0]);
    }
}

testDoctorSignup();
