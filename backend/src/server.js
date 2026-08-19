require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 4000);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || false }));
app.use(express.json({ limit: '1mb' }));

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      enableKeepAlive: true
    });
  }
  return pool;
}

app.get('/api/health', async (_req, res) => {
  try {
    await getPool().query('SELECT 1');
    res.json({ status: 'ok', service: 'hyperapex-business-hub-api', database: 'ok' });
  } catch (_error) {
    res.status(503).json({ status: 'degraded', service: 'hyperapex-business-hub-api', database: 'unavailable' });
  }
});

app.get('/api/services', async (_req, res) => {
  try {
    const [rows] = await getPool().query(
      'SELECT id, category, name, slug, description FROM services WHERE active = TRUE ORDER BY category, name'
    );
    res.json(rows);
  } catch (_error) {
    res.status(500).json({ error: 'Unable to load services.' });
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));

app.listen(port, () => {
  console.log(`Hyperapex Business Hub API listening on port ${port}`);
});
