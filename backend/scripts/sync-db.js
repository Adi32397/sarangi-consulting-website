require('dotenv').config();
const mysql = require('mysql2/promise');

async function syncDatabase() {
    console.log("Starting database synchronization...");

    // 1. Connect to Local Database
    const localDb = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });
    console.log("✅ Connected to Local Database");

    // 2. Connect to Live Database
    const liveDb = await mysql.createConnection({
        host: process.env.LIVE_DB_HOST,
        port: process.env.LIVE_DB_PORT,
        user: process.env.LIVE_DB_USER,
        password: process.env.LIVE_DB_PASSWORD,
        database: process.env.LIVE_DB_NAME,
        ssl: { rejectUnauthorized: false }
    });
    console.log("✅ Connected to Live TiDB Database");

    const tablesToSync = ['Banners', 'Settings', 'PricingCard'];

    for (const table of tablesToSync) {
        console.log(`\nSyncing table: ${table}...`);
        
        try {
            // Get all rows from local table
            const [rows] = await localDb.query(`SELECT * FROM ${table}`);
            console.log(`Found ${rows.length} records in local ${table}.`);

            if (rows.length === 0) continue;

            // Delete existing rows in live table to ensure exact match (optional but cleaner)
            await liveDb.query(`DELETE FROM ${table}`);
            console.log(`Cleared existing records in live ${table}.`);

            // Insert rows into live table
            for (const row of rows) {
                const columns = Object.keys(row).map(c => `\`${c}\``).join(', ');
                const placeholders = Object.keys(row).map(() => '?').join(', ');
                const values = Object.values(row).map(v => 
                    (v !== null && typeof v === 'object' && !(v instanceof Date)) ? JSON.stringify(v) : v
                );

                await liveDb.query(
                    `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
                    values
                );
            }
            console.log(`✅ Successfully synced ${rows.length} records into live ${table}.`);

        } catch (error) {
            console.error(`❌ Error syncing table ${table}:`, error.message);
        }
    }

    await localDb.end();
    await liveDb.end();
    console.log("\n🎉 Database synchronization complete!");
}

syncDatabase().catch(err => {
    console.error("Critical Error:", err);
    process.exit(1);
});
