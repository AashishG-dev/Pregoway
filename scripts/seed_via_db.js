const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error("No DATABASE_URL found");
    process.exit(1);
}

const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

const { v4: uuidv4 } = require('uuid');

async function seed() {
    try {
        await client.connect();
        console.log("Connected to DB");

        // 1. Find User by Email (We assume user creates account manually or via UI to avoid auth.users insert restrictions)
        const email = "akanksha.manual@example.com"; // Use this email for manual signup
        
        console.log(`Checking for user: ${email}...`);
        const userRes = await client.query(`SELECT id FROM auth.users WHERE email = $1`, [email]);

        if (userRes.rows.length === 0) {
            console.error("----------------------------------------------------------------");
            console.error("USER NOT FOUND. PLEASE SIGN UP MANUALLY FIRST!");
            console.error(`1. Go to http://localhost:3000/auth/signup`);
            console.error(`2. Sign up with Email: ${email}`);
            console.error(`3. Password: Password123!`);
            console.error("4. Run this script again.");
            console.error("----------------------------------------------------------------");
            process.exit(1);
        }

        const userId = userRes.rows[0].id;
        console.log("Found User ID:", userId);

        // 2. Insert into public.profiles
        await client.query(`
            INSERT INTO public.profiles (
                id, name, email, role, current_week, edd, lmp, phone, age, blood_group, height, weight, risk_status
            ) VALUES (
                $1, 'Akanksha Chaudhary', $2, 'patient', 26, 
                now() + interval '14 weeks', 
                now() - interval '26 weeks', 
                '+91 99887 76655', 
                29, 'B+', 162, 70, 'moderate'
            )
            ON CONFLICT (id) DO UPDATE SET
                current_week = 26,
                risk_status = 'moderate';
        `, [userId, email]);

        // 3. Clear old metrics for this user to avoid duplicates for the demo
        await client.query(`DELETE FROM public.health_metrics WHERE user_id = $1`, [userId]);
        await client.query(`DELETE FROM public.daily_checkins WHERE user_id = $1`, [userId]);

        // 4. Insert Metrics
        // BP
        await client.query(`
            INSERT INTO public.health_metrics (user_id, type, value, unit, created_at)
            VALUES 
            ($1, 'BP', '122/81', 'mmHg', now() - interval '2 days'),
            ($1, 'BP', '118/79', 'mmHg', now() - interval '1 days'),
            ($1, 'BP', '125/83', 'mmHg', now());
        `, [userId]);

        // Weight
        await client.query(`
            INSERT INTO public.health_metrics (user_id, type, value, unit, created_at)
            VALUES 
            ($1, 'WEIGHT', '69.5', 'kg', now() - interval '7 days'),
            ($1, 'WEIGHT', '70.2', 'kg', now());
        `, [userId]);

        // Checkins
        await client.query(`
            INSERT INTO public.daily_checkins (user_id, date, data)
            VALUES 
            ($1, (now() - interval '1 day')::date, '{"energy": 3, "kicks": 12, "symptoms": ["Mild Headache"]}'),
            ($1, now()::date, '{"energy": 4, "kicks": 15, "symptoms": ["None"]}');
        `, [userId]);

        console.log("-------------------------------------------");
        console.log("SEED COMPLETE");
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("-------------------------------------------");

    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await client.end();
    }
}

seed();
