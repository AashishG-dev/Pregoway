const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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

    // Change column type to TEXT
    await client.query(`
      ALTER TABLE public.health_metrics 
      ALTER COLUMN value TYPE TEXT;
    `);

    console.log("Successfully changed health_metrics.value to TEXT.");

  } catch (err) {
    console.error("Error executing migration:", err);
  } finally {
    await client.end();
  }
}

run();
