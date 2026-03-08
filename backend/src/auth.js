import jwt from 'jsonwebtoken';
import { get } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kmsm-dev-secret';

export const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '8h' });

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token ausente' });
  }

  try {
    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [payload.id]);
    if (!user) return res.status(401).json({ message: 'Usuário inválido' });

    const permissions = await get(
      'SELECT can_create, can_edit, can_delete, can_manage_users FROM permissions WHERE user_id = ?',
      [user.id]
    );

    req.user = { ...user, permissions };
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const authorize = (permission) => (req, res, next) => {
  if (req.user.role === 'admin') return next();
  if (!req.user.permissions?.[permission]) {
    return res.status(403).json({ message: 'Sem permissão para esta ação' });
  }
  return next();
};
