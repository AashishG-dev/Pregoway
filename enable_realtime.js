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

const realtimeSQL = `
-- Enable Realtime for Chat Messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;

-- Enable Realtime for Doctor-Patient Requests (so dashboard updates instantly)
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_patients;

-- Verify
SELECT * FROM pg_publication_tables WHERE publication_name = 'supabase_realtime';
`;

async function run() {
  try {
    await client.connect();
    console.log("Connected to Database...");
    
    // Note: This might fail if the table is already added, but it's safe to try or we catch the error.
    // Supabase doesn't have "IF NOT EXISTS" for publication tables easily in vanilla SQL standard,
    // so we wrap in a block or just let it throw if already exists.
    
    // Actually, "ALTER PUBLICATION ... ADD TABLE" throws if table is already in it.
    // Let's do a safe check logic or just run it and ignore specific error code.
    // Simpler: Just run it. If it fails, it's likely already added.
    
    try {
        await client.query('ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations');
        console.log("✅ Realtime enabled for 'consultations'");
    } catch (e) {
        console.log("ℹ️ Realtime skipping 'consultations' (already enabled or error):", e.message);
    }

    try {
        await client.query('ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_patients');
        console.log("✅ Realtime enabled for 'doctor_patients'");
    } catch (e) {
         console.log("ℹ️ Realtime skipping 'doctor_patients' (already enabled or error):", e.message);
    }
    
  } catch (err) {
    console.error("❌ Error enabling realtime:", err);
  } finally {
    await client.end();
  }
}

run();
