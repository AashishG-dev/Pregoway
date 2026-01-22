
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function test() {
    await client.connect();
    try {
        const res = await client.query('SELECT count(*) FROM auth.users');
        console.log("Auth Users Count:", res.rows[0].count);
    } catch (err) {
        console.error("Auth Query Error:", err.message);
    } finally {
        await client.end();
    }
}
test();
