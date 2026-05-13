require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const file = process.argv[2];

if (!file) {
    console.error('Usage: node scripts/runMigration.js <migration-file>');
    process.exit(1);
}

const migrationPath = path.resolve(__dirname, '..', file);
const sql = fs.readFileSync(migrationPath, 'utf8');

db.query(sql)
    .then(() => {
        console.log(`Migration applied: ${file}`);
        return db.end();
    })
    .catch(async (err) => {
        console.error(err.message);
        await db.end();
        process.exit(1);
    });
