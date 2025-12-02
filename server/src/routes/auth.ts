import { Router } from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database';
import { generateToken } from '../middleware/auth';
import { auditLog } from '../utils/audit';

const router = Router();

router.post(
  '/signup',
  [
    body('username').trim().isLength({ min: 3, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('userType').isIn(['patient', 'provider']),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, userType } = req.body;

    try {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, user_type)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username, email, user_type`,
        [username, email, passwordHash, userType]
      );

      const user = result.rows[0];

      await auditLog({
        userId: user.id,
        action: 'USER_SIGNUP',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      const token = generateToken({
        id: user.id,
        username: user.username,
        userType: user.user_type,
      });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          userType: user.user_type,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/login',
  [
    body('username').trim().notEmpty(),
    body('password').notEmpty(),
    body('userType').isIn(['patient', 'provider']),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, userType } = req.body;

    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND user_type = $2 AND is_active = true',
        [username, userType]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      await auditLog({
        userId: user.id,
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      const token = generateToken({
        id: user.id,
        username: user.username,
        userType: user.user_type,
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          userType: user.user_type,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
