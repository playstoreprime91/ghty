import fs from 'fs';
import path from 'path';
import pool from './db.js';

const sqlFile = path.join(process.cwd(), 'migration.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

(async function run() {
  try {
    console.log('Uruchamiam migracje...');
    await pool.query(sql);
    console.log('Migracje wykonane.');
    await pool.end();
  } catch (err) {
    console.error('Błąd migracji:', err);
    process.exit(1);
  }
})();
