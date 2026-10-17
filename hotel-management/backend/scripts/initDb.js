
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

const run = async (file) => {
  const sql = fs.readFileSync(path.join(__dirname, '..', '..', 'database', file), 'utf8');
  await pool.query(sql);
  console.log(`Ran database/${file}`);
};

(async () => {
  try {
    await run('schema.sql');
    if (process.argv.includes('--seed')) await run('seed.sql');
  } catch (err) {
    console.error('DB init failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
