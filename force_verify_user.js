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

async function run() {
  const targetEmail = '29.aashishgupta1@gmail.com'; 

  try {
    await client.connect();
    console.log(`Checking user: ${targetEmail}`);

    // 1. Get User ID
    const res = await client.query(`SELECT id, email, email_confirmed_at FROM auth.users WHERE email = $1`, [targetEmail]);
    
    if (res.rows.length === 0) {
      console.error("❌ User not found in Auth table! Did you sign up?");
      return;
    }

    const user = res.rows[0];
    console.log(`✅ User Found: ${user.id}`);

    // 2. Force Verify Email
    if (!user.email_confirmed_at) {
      console.log("⚠️ Email not confirmed. Forcing confirmation...");
      await client.query(`UPDATE auth.users SET email_confirmed_at = now() WHERE id = $1`, [user.id]);
      console.log("✅ Email Confirmed.");
    } else {
      console.log("✅ Email already confirmed.");
    }

    // 3. Ensure Doctor Profile Exists
    console.log("Checking Doctors table...");
    await client.query(`
      INSERT INTO public.doctors (id, full_name, specialization, hospital_name, experience_years, is_verified)
      VALUES ($1, 'Dr. Aashish Gupta', 'General', 'City Hospital', 5, true)
      ON CONFLICT (id) DO UPDATE 
      SET is_verified = true; -- Make sure they are verified
    `, [user.id]);
    
    console.log("✅ Doctor Profile Ensured.");

    // 4. Update Metadata just in case
    await client.query(`
      UPDATE auth.users 
      SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        '"doctor"'
      )
      WHERE id = $1
    `, [user.id]);
    console.log("✅ Metadata Updated to role: doctor");

    console.log("🎉 ACCOUNT FIXED! Try logging in now.");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
