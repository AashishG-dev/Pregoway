const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Manual Env Parsing
const envPath = path.resolve(__dirname, '../.env.local');
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
  try {
    await client.connect();
    console.log("Connected to Database...");

    // 1. CLEANUP
    console.log("Cleaning Database...");
    
    // Truncate public tables
    await client.query(`
      TRUNCATE TABLE 
        public.consultations,
        public.doctor_patients,
        public.doctors,
        public.documents,
        public.health_timeline,
        public.risk_logs,
        public.health_metrics,
        public.daily_checkins,
        public.profiles
      CASCADE;
    `);

    // Clean auth.users 
    await client.query(`DELETE FROM auth.users`);

    console.log("Database Cleaned.");

    // 2. SEEDING
    console.log("Seeding Data...");

    const passwordHash = await bcrypt.hash('password123', 10);

    // --- Users ---
    const user1Id = uuidv4();
    const user2Id = uuidv4();

    const insertUser = async (id, email, name, role) => {
      // NOTE: We manually insert into auth.users. 
      // Supabase might have triggers on this table but we want to ensure we have control.
      await client.query(`
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
        VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, $3, NOW(), $4, $5, NOW(), NOW(), '', '')
      `, [
        id, 
        email, 
        passwordHash, 
        JSON.stringify({ provider: 'email', providers: ['email'] }),
        JSON.stringify({ full_name: name }) 
      ]);
    };

    await insertUser(user1Id, 'user1@example.com', 'Alice User', 'user');
    await insertUser(user2Id, 'user2@example.com', 'Barbara User', 'user');

    
    const upsertProfile = async (id, name, age, weeks, risk) => {
      await client.query(`
        INSERT INTO public.profiles (id, name, email, age, current_week, risk_status, lmp, edd)
        VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '20 weeks', NOW() + INTERVAL '20 weeks')
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          age = EXCLUDED.age,
          current_week = EXCLUDED.current_week,
          risk_status = EXCLUDED.risk_status;
      `, [id, name, `user${id === user1Id ? '1' : '2'}@example.com`, age, weeks, risk]);
    };

    // Wait a brief moment or just run upsert
    // The handle_new_user trigger creates a basic profile. We update it here.
    await upsertProfile(user1Id, 'Alice User', 28, 24, 'low');
    await upsertProfile(user2Id, 'Barbara User', 32, 34, 'high');


    // --- Doctors ---
    const doc1Id = uuidv4();
    const doc2Id = uuidv4();

    await insertUser(doc1Id, 'doctor1@example.com', 'Dr. Smith', 'doctor');
    await insertUser(doc2Id, 'doctor2@example.com', 'Dr. Jones', 'doctor');

    // Insert into public.doctors
    await client.query(`
      INSERT INTO public.doctors (id, full_name, specialization, hospital_name, experience_years, is_verified)
      VALUES 
      ($1, 'Dr. Smith', 'Obstetrics', 'City General', 10, true),
      ($2, 'Dr. Jones', 'Gynecology', 'County Hospital', 15, true)
    `, [doc1Id, doc2Id]);


    // --- Relationships ---
    
    // Assign Alice to Dr. Smith
    await client.query(`
      INSERT INTO public.doctor_patients (doctor_id, patient_id, status)
      VALUES ($1, $2, 'active')
    `, [doc1Id, user1Id]);


    // --- Data for Alice (user1) ---

    // 1. Daily Checkins (Last 7 days)
    for (let i = 0; i < 7; i++) {
        await client.query(`
            INSERT INTO public.daily_checkins (user_id, date, data, streak_count)
            VALUES ($1, CURRENT_DATE - $2 * INTERVAL '1 day', $3, $4)
        `, [
            user1Id, 
            i, 
            JSON.stringify({ mood: 'Happy', symptoms: ['Nausea'], slept_well: true }),
            i + 1 
        ]);
    }

    // 2. Health Metrics
    await client.query(`
        INSERT INTO public.health_metrics (user_id, type, value, unit)
        VALUES 
        ($1, 'WEIGHT', 70.5, 'kg'),
        ($1, 'BP', 120, 'mmHg'),
        ($1, 'HB', 11, 'g/dL')
    `, [user1Id]);

    // 3. Risk Logs
    await client.query(`
        INSERT INTO public.risk_logs (user_id, score, level, insight)
        VALUES ($1, 10, 'green', 'Everything looks normal.')
    `, [user1Id]);

    // 4. Documents
    await client.query(`
        INSERT INTO public.documents (user_id, title, file_url, file_type, status)
        VALUES ($1, 'Blood Test 1', 'https://placehold.co/600x400.png', 'Lab', 'Analyzed')
    `, [user1Id]);

    // 5. Consultations (Chat)
    await client.query(`
        INSERT INTO public.consultations (doctor_id, patient_id, sender_id, message, is_read)
        VALUES 
        ($1, $2, $2, 'Hello Dr. Smith, I have a question about my diet.', true),
        ($1, $2, $1, 'Hi Alice, sure! What would you like to know?', true),
        ($1, $2, $2, 'Is it safe to eat sushi?', false)
    `, [doc1Id, user1Id]);

    // 6. Timeline
    await client.query(`
        INSERT INTO public.health_timeline (user_id, event_type, title, description, event_date, status)
        VALUES 
        ($1, 'APPOINTMENT', 'Routine Checkup', 'Monthly visit', NOW() + INTERVAL '1 week', 'pending'),
        ($1, 'SCAN', 'Ultrasound', '20 week scan', NOW() - INTERVAL '2 weeks', 'completed')
    `, [user1Id]);


    console.log("Seeding Complete!");
    console.log("Credentials:");
    console.log("  User 1: user1@example.com / password123");
    console.log("  User 2: user2@example.com / password123");
    console.log("  Doc 1:  doctor1@example.com / password123");
    console.log("  Doc 2:  doctor2@example.com / password123");

  } catch (err) {
    console.error("Error cleaning/seeding:", err);
  } finally {
    await client.end();
  }
}

run();
