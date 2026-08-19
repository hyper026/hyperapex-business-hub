require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error('JWT_SECRET is required.');

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || false, credentials: true }));
app.use(express.json({ limit: '1mb' }));

let pool;
function getPool() {
  if (!pool) pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true
  });
  return pool;
}

function signUser(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });
}

function auth(requiredRoles = []) {
  return async (req, res, next) => {
    try {
      const header = req.get('authorization') || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'Authentication required.' });
      const payload = jwt.verify(token, jwtSecret);
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Insufficient permissions.' });
      }
      req.user = payload;
      next();
    } catch (_error) {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
  };
}

app.get('/api/health', async (_req, res) => {
  try {
    await getPool().query('SELECT 1');
    res.json({ status: 'ok', service: 'hyperapex-business-hub-api', database: 'ok' });
  } catch (_error) {
    res.status(503).json({ status: 'degraded', service: 'hyperapex-business-hub-api', database: 'unavailable' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  try {
    const [rows] = await getPool().query(
      'SELECT id, full_name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1', [email]
    );
    const user = rows[0];
    if (!user || user.status !== 'ACTIVE' || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.json({ token: signUser(user), user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } });
  } catch (_error) {
    res.status(500).json({ error: 'Unable to complete login.' });
  }
});

app.get('/api/auth/me', auth(), async (req, res) => {
  try {
    const [rows] = await getPool().query(
      'SELECT id, full_name, email, role, status FROM users WHERE id = ? LIMIT 1', [req.user.sub]
    );
    if (!rows[0] || rows[0].status !== 'ACTIVE') return res.status(401).json({ error: 'Account unavailable.' });
    res.json({ user: rows[0] });
  } catch (_error) {
    res.status(500).json({ error: 'Unable to load account.' });
  }
});

app.get('/api/services', async (_req, res) => {
  try {
    const [rows] = await getPool().query('SELECT id, category, name, slug, description FROM services WHERE active = TRUE ORDER BY category, name');
    res.json(rows);
  } catch (_error) {
    res.status(500).json({ error: 'Unable to load services.' });
  }
});

app.get('/api/clients', auth(['ADMIN', 'STAFF', 'SPECIALIST']), async (_req, res) => {
  try {
    const [rows] = await getPool().query('SELECT id, client_type, name, email, phone, address, status, created_at FROM clients ORDER BY created_at DESC');
    res.json(rows);
  } catch (_error) {
    res.status(500).json({ error: 'Unable to load clients.' });
  }
});

app.post('/api/clients', auth(['ADMIN', 'STAFF']), async (req, res) => {
  const { client_type = 'INDIVIDUAL', name, email = null, phone = null, address = null, notes = null } = req.body;
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Client name is required.' });
  try {
    const [result] = await getPool().execute(
      'INSERT INTO clients (client_type, name, email, phone, address, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [client_type, String(name).trim(), email, phone, address, notes]
    );
    res.status(201).json({ id: result.insertId, message: 'Client created.' });
  } catch (_error) {
    res.status(500).json({ error: 'Unable to create client.' });
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
app.listen(port, () => console.log(`Hyperapex Business Hub API listening on port ${port}`));
