const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manual Env Parsing
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key.trim()] = val.trim();
  return acc;
}, {});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Env Vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const email = `test.pregoway.${Date.now()}@gmail.com`;
  const password = "TestPassword123!";

  console.log(`🔍 Attempting SignUp for: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("❌ SignUp Failed:", error.message);
  } else {
    console.log("✅ SignUp Successful!");
    
    if (data.session) {
        console.log("🎉 SESSION RECEIVED: Email Verification is DISABLED. You are good to go!");
    } else {
        console.log("⚠️ NO SESSION: Email Verification is STILL ENABLED. You must disable it in Supabase Dashboard.");
    }
  }
}

testSignup();
