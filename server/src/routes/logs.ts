import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { auditLog } from '../utils/audit';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: any) => {
  const { startDate, endDate } = req.query;

  try {
    let query = 'SELECT * FROM daily_logs WHERE user_id = $1';
    const params: any[] = [req.user!.id];

    if (startDate) {
      params.push(startDate);
      query += ` AND log_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND log_date <= $${params.length}`;
    }

    query += ' ORDER BY log_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post(
  '/',
  [
    body('mood').optional().isString(),
    body('moodScore').optional().isInt({ min: 1, max: 5 }),
    body('symptoms').optional().isArray(),
    body('sideEffects').optional().isArray(),
    body('notes').optional().isString(),
    body('logDate').isDate(),
  ],
  async (req: AuthRequest, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mood, moodScore, symptoms, sideEffects, notes, logDate } = req.body;

    try {
      const existing = await pool.query(
        'SELECT id FROM daily_logs WHERE user_id = $1 AND log_date = $2',
        [req.user!.id, logDate]
      );

      let result;
      if (existing.rows.length > 0) {
        result = await pool.query(
          `UPDATE daily_logs
           SET mood = $1, mood_score = $2, symptoms = $3, side_effects = $4, notes = $5
           WHERE id = $6
           RETURNING *`,
          [mood, moodScore, symptoms, sideEffects, notes, existing.rows[0].id]
        );
      } else {
        result = await pool.query(
          `INSERT INTO daily_logs (user_id, mood, mood_score, symptoms, side_effects, notes, log_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [req.user!.id, mood, moodScore, symptoms, sideEffects, notes, logDate]
        );
      }

      await auditLog({
        userId: req.user!.id,
        action: existing.rows.length > 0 ? 'DAILY_LOG_UPDATED' : 'DAILY_LOG_CREATED',
        resourceType: 'daily_log',
        resourceId: result.rows[0].id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(existing.rows.length > 0 ? 200 : 201).json(result.rows[0]);
    } catch (error) {
      console.error('Save log error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
