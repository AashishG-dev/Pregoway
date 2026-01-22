
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase Env Vars!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDummyPatient() {
    const email = "akanksha.unique.demo3@example.com";
    const password = "Password123!";

    console.log("Creating/Updating Dummy Patient:", email);

    // 1. Sign Up (or Sign In if exists)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: "Akanksha Chaudhary",
                role: "patient"
            }
        }
    });

    if (authError) {
        console.log("DEBUG: SignUp Error Object:", JSON.stringify(authError, null, 2));
        console.log("Auth Message:", authError.message);
        // Try Login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (loginError) {
            console.error("Login Failed:", loginError);
            return;
        }
        console.log("Logged in as existing user.");
    } else {
         // If user is already registered but returned (Supabase behavior returns dummy user sometimes if confirm needed)
         if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
             console.log("User exists (Auth returned empty identities). Logging in...");
             const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (loginError) console.error(loginError);
         } else {
             console.log("User Created/Retrieved:", authData.user?.id);
         }
    }

    // Get User ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error("No user found in session.");
        return;
    }

    const userId = user.id;

    // 2. Profile Data
    console.log("Seeding Profile for ID:", userId);
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        name: "Akanksha Chaudhary",
        email: email,
        role: "patient",
        current_week: 20,
        edd: new Date(Date.now() + (20 * 7 * 24 * 60 * 60 * 1000)).toISOString(), // 20 weeks remaining? No, EDD is future.
        lmp: new Date(Date.now() - (20 * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        phone: "+91 98765 43210",
        age: 28,
        blood_group: "O+",
        height: 165,
        weight: 68,
        risk_status: "low"
    });
    if (profileError) console.error("Profile Error:", profileError);

    // 3. Health Metrics (BP, Weight, Kicks)
    console.log("Seeding Metrics...");
    const days = 7;
    const metrics = [];
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // BP
        metrics.push({
            user_id: userId,
            type: 'BP',
            value: `${110 + Math.floor(Math.random() * 10)}/${70 + Math.floor(Math.random() * 10)}`,
            unit: 'mmHg',
            created_at: date.toISOString()
        });

        // Weight
        metrics.push({
            user_id: userId,
            type: 'WEIGHT',
            value: (68 + (i * 0.1)).toFixed(1),
            unit: 'kg',
            created_at: date.toISOString()
        });
    }
    await supabase.from('health_metrics').insert(metrics);

    // 4. Daily Checkins
    console.log("Seeding Checkins...");
    const checkins = [];
    for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        checkins.push({
            user_id: userId,
            date: date.toISOString().split('T')[0],
            data: {
                energy: 4,
                headache: false,
                kicks: 10 + Math.floor(Math.random() * 5),
                symptoms: ["None of the above"]
            }
        });
    }
    await supabase.from('daily_checkins').insert(checkins);

    console.log("-----------------------------------------");
    console.log("DUMMY PATIENT READY");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("-----------------------------------------");
}

createDummyPatient();
