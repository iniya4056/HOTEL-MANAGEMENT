const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

pool
  .query('SELECT NOW()')
  .then(() => {
    console.log('PostgreSQL connected');
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Cannot connect to PostgreSQL. Check backend/.env and that the DB exists.\n', err.message);
    process.exit(1);
  });
