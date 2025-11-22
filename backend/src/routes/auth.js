import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/init.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      'SELECT u.*, array_agg(ur.role) as roles FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id WHERE u.username = $1 GROUP BY u.id',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, roles: user.roles },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];

    await pool.query(
      'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
      [user.id, role || 'operator']
    );

    res.status(201).json({ message: 'Utilisateur créé', user });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user.roles.includes('admin')) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  next();
};

export default router;
