import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { all, get, initDb, run } from './db.js';
import { authenticate, authorize, signToken } from './auth.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(cors());
app.use(express.json());

const defaultPermissionsByRole = {
  admin: { can_create: 1, can_edit: 1, can_delete: 1, can_manage_users: 1 },
  management: { can_create: 1, can_edit: 1, can_delete: 1, can_manage_users: 0 },
  standard: { can_create: 1, can_edit: 0, can_delete: 0, can_manage_users: 0 },
};

const sanitizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const parseKilometers = (value) => Number.parseFloat(value);

const validateRecordPayload = (payload) => {
  const required = ['date', 'time', 'destination', 'address'];
  for (const key of required) {
    if (!sanitizeText(payload[key])) return `${key} é obrigatório`;
  }

  const kilometers = parseKilometers(payload.kilometers);
  if (!Number.isFinite(kilometers) || kilometers < 0) return 'quilometragem inválida';
  return null;
};

const buildCsv = (rows) => {
  const headers = ['id', 'date', 'time', 'destination', 'address', 'route_description', 'kilometers'];
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n');
};

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = sanitizeText(req.body.name);
    const email = sanitizeText(req.body.email).toLowerCase();
    const password = String(req.body.password || '');
    const role = req.body.role || 'standard';
    const permissions = req.body.permissions;

    if (!name || !email || password.length < 6) {
      return res.status(400).json({ message: 'Nome, e-mail e senha (mínimo 6 caracteres) são obrigatórios' });
    }
    const { name, email, password, role = 'standard', permissions } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Dados obrigatórios ausentes' });

    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ message: 'E-mail já cadastrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, passwordHash, role]);
    const created = await run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );

    const perms = permissions || defaultPermissionsByRole[role] || defaultPermissionsByRole.standard;
    await run(
      `INSERT INTO permissions (user_id, can_create, can_edit, can_delete, can_manage_users)
       VALUES (?, ?, ?, ?, ?)`,
      [created.lastID, perms.can_create ? 1 : 0, perms.can_edit ? 1 : 0, perms.can_delete ? 1 : 0, perms.can_manage_users ? 1 : 0]
    );

    const user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [created.lastID]);
    res.status(201).json({ user: { ...user, permissions: perms }, token: signToken(user) });
    const token = signToken(user);
    res.status(201).json({ user: { ...user, permissions: perms }, token });
  } catch (error) {
    res.status(500).json({ message: 'Erro no cadastro', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const identifier = sanitizeText(req.body.identifier).toLowerCase();
  const password = String(req.body.password || '');

  if (!identifier || !password) return res.status(400).json({ message: 'Informe usuário/e-mail e senha' });

  const user = await get('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?', [identifier, identifier]);
  const { email, password } = req.body;
  const user = await get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });

  const permissions = await get('SELECT can_create, can_edit, can_delete, can_manage_users FROM permissions WHERE user_id = ?', [user.id]);
  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, permissions };
  res.json({ user: safeUser, token: signToken(user) });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const identifier = sanitizeText(req.body.identifier).toLowerCase();
  const newPassword = String(req.body.newPassword || '');

  if (!identifier || newPassword.length < 6) {
    return res.status(400).json({ message: 'Informe usuário/e-mail e uma nova senha válida.' });
  }

  const user = await get('SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?', [identifier, identifier]);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  const hash = await bcrypt.hash(newPassword, 10);
  await run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id]);
  res.json({ message: 'Senha redefinida com sucesso.' });
});

app.get('/api/auth/me', authenticate, (req, res) => res.json(req.user));

app.get('/api/users', authenticate, authorize('can_manage_users'), async (_req, res) => {
  const users = await all(
    `SELECT u.id, u.name, u.email, u.role, p.can_create, p.can_edit, p.can_delete, p.can_manage_users
    FROM users u JOIN permissions p ON p.user_id = u.id ORDER BY u.created_at DESC`
  );
  res.json(users);
});

app.put('/api/users/:id/permissions', authenticate, authorize('can_manage_users'), async (req, res) => {
  const { id } = req.params;
  const { role, permissions } = req.body;
  await run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  await run(
    `UPDATE permissions SET can_create = ?, can_edit = ?, can_delete = ?, can_manage_users = ? WHERE user_id = ?`,
    [permissions.can_create ? 1 : 0, permissions.can_edit ? 1 : 0, permissions.can_delete ? 1 : 0, permissions.can_manage_users ? 1 : 0, id]
  );
  res.json({ message: 'Permissões atualizadas' });
});

app.get('/api/kms-records', authenticate, async (req, res) => {
  const { dateFrom, dateTo, destination } = req.query;
  const where = ['r.user_id = ?'];
  const params = [req.user.id];

  if (dateFrom) {
    where.push('r.date >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push('r.date <= ?');
    params.push(dateTo);
  }
  if (destination) {
    where.push('LOWER(r.destination) LIKE ?');
    params.push(`%${String(destination).toLowerCase()}%`);
  }

  const rows = await all(
    `SELECT r.*, rt.google_maps_url FROM kms_records r
     LEFT JOIN routes rt ON rt.kms_record_id = r.id
     WHERE ${where.join(' AND ')}
     ORDER BY r.date DESC, r.time DESC`,
    params
  const rows = await all(
    `SELECT r.*, rt.google_maps_url FROM kms_records r
     LEFT JOIN routes rt ON rt.kms_record_id = r.id
     WHERE r.user_id = ? ORDER BY r.date DESC, r.time DESC`,
    [req.user.id]
  );
  res.json(rows);
});

app.get('/api/kms-records/export', authenticate, async (req, res) => {
  const format = req.query.format === 'csv' ? 'csv' : 'json';
  const rows = await all('SELECT id, date, time, destination, address, route_description, kilometers FROM kms_records WHERE user_id = ? ORDER BY date DESC', [req.user.id]);

  if (format === 'csv') {
    const csv = buildCsv(rows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kms-records.csv"');
    return res.send(csv);
  }

  return res.json(rows);
});

app.post('/api/kms-records', authenticate, authorize('can_create'), async (req, res) => {
  const error = validateRecordPayload(req.body);
  if (error) return res.status(400).json({ message: error });

  const payload = {
    date: sanitizeText(req.body.date),
    time: sanitizeText(req.body.time),
    destination: sanitizeText(req.body.destination),
    address: sanitizeText(req.body.address),
    route_description: sanitizeText(req.body.route_description),
    kilometers: parseKilometers(req.body.kilometers),
    origin_address: sanitizeText(req.body.origin_address),
  };

  const result = await run(
    `INSERT INTO kms_records (user_id, date, time, destination, address, route_description, kilometers)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, payload.date, payload.time, payload.destination, payload.address, payload.route_description, payload.kilometers]
  );

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(payload.origin_address)}&destination=${encodeURIComponent(payload.address)}`;
  await run('INSERT INTO routes (kms_record_id, origin_address, destination_address, google_maps_url) VALUES (?, ?, ?, ?)', [result.lastID, payload.origin_address, payload.address, mapsUrl]);
app.post('/api/kms-records', authenticate, authorize('can_create'), async (req, res) => {
  const { date, time, destination, address, route_description, kilometers, origin_address } = req.body;
  const result = await run(
    `INSERT INTO kms_records (user_id, date, time, destination, address, route_description, kilometers)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, date, time, destination, address, route_description, kilometers]
  );
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin_address || '')}&destination=${encodeURIComponent(address)}`;
  await run(
    `INSERT INTO routes (kms_record_id, origin_address, destination_address, google_maps_url)
     VALUES (?, ?, ?, ?)`,
    [result.lastID, origin_address || '', address, mapsUrl]
  );

  const record = await get('SELECT * FROM kms_records WHERE id = ?', [result.lastID]);
  res.status(201).json({ ...record, google_maps_url: mapsUrl });
});

app.put('/api/kms-records/:id', authenticate, authorize('can_edit'), async (req, res) => {
  const error = validateRecordPayload(req.body);
  if (error) return res.status(400).json({ message: error });

  const { id } = req.params;
  const { id } = req.params;
  const { date, time, destination, address, route_description, kilometers } = req.body;
  await run(
    `UPDATE kms_records
     SET date = ?, time = ?, destination = ?, address = ?, route_description = ?, kilometers = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [
      sanitizeText(req.body.date),
      sanitizeText(req.body.time),
      sanitizeText(req.body.destination),
      sanitizeText(req.body.address),
      sanitizeText(req.body.route_description),
      parseKilometers(req.body.kilometers),
      id,
      req.user.id,
    ]
    [date, time, destination, address, route_description, kilometers, id, req.user.id]
  );
  res.json({ message: 'Registro atualizado' });
});

app.delete('/api/kms-records/:id', authenticate, authorize('can_delete'), async (req, res) => {
  await run('DELETE FROM kms_records WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Registro excluído' });
});

app.get('/api/reports/summary', authenticate, async (req, res) => {
  const [today, weekly, monthly, count] = await Promise.all([
    get("SELECT COALESCE(SUM(kilometers), 0) AS total FROM kms_records WHERE user_id = ? AND date = date('now')", [req.user.id]),
    get("SELECT COALESCE(SUM(kilometers), 0) AS total FROM kms_records WHERE user_id = ? AND date >= date('now', '-7 day')", [req.user.id]),
    get("SELECT COALESCE(SUM(kilometers), 0) AS total FROM kms_records WHERE user_id = ? AND date >= date('now', '-30 day')", [req.user.id]),
    get('SELECT COUNT(*) AS total FROM kms_records WHERE user_id = ?', [req.user.id]),
  ]);
  const weekly = await get(
    `SELECT COALESCE(SUM(kilometers), 0) AS total FROM kms_records
     WHERE user_id = ? AND date >= date('now', '-7 day')`,
    [req.user.id]
  );

  const monthly = await get(
    `SELECT COALESCE(SUM(kilometers), 0) AS total FROM kms_records
     WHERE user_id = ? AND date >= date('now', '-30 day')`,
    [req.user.id]
  );

  const byDestination = await all(
    `SELECT destination AS region, SUM(kilometers) AS total FROM kms_records
     WHERE user_id = ? GROUP BY destination ORDER BY total DESC`,
    [req.user.id]
  );

  const byPeriod = await all(
    `SELECT date AS period, SUM(kilometers) AS total
     FROM kms_records WHERE user_id = ? GROUP BY date ORDER BY date`,
    [req.user.id]
  );

  res.json({
    todayTotal: today.total,
    weeklyTotal: weekly.total,
    monthlyTotal: monthly.total,
    totalRecords: count.total,
    byDestination,
    byPeriod,
  });
});

initDb().then(async () => {
  const admin = await get("SELECT id FROM users WHERE LOWER(name) = 'admin' OR LOWER(email) = 'admin@kmsm.local' OR role = 'admin' LIMIT 1");
  const hash = await bcrypt.hash('Senha@123', 10);

  if (!admin) {
    const inserted = await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
      'Admin',
      'admin@kmsm.local',
      hash,
      'admin',
    ]);
    `SELECT strftime('%Y-%m', date) AS period, SUM(kilometers) AS total
     FROM kms_records WHERE user_id = ? GROUP BY period ORDER BY period`,
    [req.user.id]
  );

  res.json({ weeklyTotal: weekly.total, monthlyTotal: monthly.total, byDestination, byPeriod });
});

initDb().then(async () => {
  const admin = await get('SELECT id FROM users WHERE role = ?', ['admin']);
  if (!admin) {
    const hash = await bcrypt.hash('admin123', 10);
    const inserted = await run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Administrador', 'admin@kmsm.local', hash, 'admin']
    );
    const p = defaultPermissionsByRole.admin;
    await run(
      `INSERT INTO permissions (user_id, can_create, can_edit, can_delete, can_manage_users)
      VALUES (?, ?, ?, ?, ?)`,
      [inserted.lastID, p.can_create, p.can_edit, p.can_delete, p.can_manage_users]
    );
  } else {
    await run("UPDATE users SET name = 'Admin', email = 'admin@kmsm.local', password_hash = ?, role = 'admin' WHERE id = ?", [hash, admin.id]);
    await run(
      `INSERT INTO permissions (user_id, can_create, can_edit, can_delete, can_manage_users)
       VALUES (?, 1, 1, 1, 1)
       ON CONFLICT(user_id) DO UPDATE SET
         can_create = 1,
         can_edit = 1,
         can_delete = 1,
         can_manage_users = 1`,
      [admin.id]
    );
  }

  app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
  });
});
