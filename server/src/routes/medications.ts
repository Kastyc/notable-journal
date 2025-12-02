import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { auditLog } from '../utils/audit';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: any) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, name, dosage, frequency, time_of_day, prescribed_by, is_active, created_at, updated_at
       FROM medications
       WHERE user_id = $1 AND is_active = true
       ORDER BY time_of_day`,
      [req.user!.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 255 }),
    body('dosage').trim().isLength({ min: 1, max: 100 }),
    body('frequency').isIn(['once', 'twice', 'three', 'asneeded']),
    body('timeOfDay').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('prescribedBy').optional().trim().isLength({ max: 255 }),
  ],
  async (req: AuthRequest, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, dosage, frequency, timeOfDay, prescribedBy } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO medications (user_id, name, dosage, frequency, time_of_day, prescribed_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.user!.id, name, dosage, frequency, timeOfDay, prescribedBy || null]
      );

      await auditLog({
        userId: req.user!.id,
        action: 'MEDICATION_CREATED',
        resourceType: 'medication',
        resourceId: result.rows[0].id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create medication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('name').trim().isLength({ min: 1, max: 255 }),
    body('dosage').trim().isLength({ min: 1, max: 100 }),
    body('frequency').isIn(['once', 'twice', 'three', 'asneeded']),
    body('timeOfDay').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  ],
  async (req: AuthRequest, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, dosage, frequency, timeOfDay } = req.body;

    try {
      const result = await pool.query(
        `UPDATE medications
         SET name = $1, dosage = $2, frequency = $3, time_of_day = $4
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [name, dosage, frequency, timeOfDay, id, req.user!.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      await auditLog({
        userId: req.user!.id,
        action: 'MEDICATION_UPDATED',
        resourceType: 'medication',
        resourceId: id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update medication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete('/:id', [param('id').isUUID()], async (req: AuthRequest, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE medications SET is_active = false WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    await auditLog({
      userId: req.user!.id,
      action: 'MEDICATION_DELETED',
      resourceType: 'medication',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post(
  '/log',
  [
    body('medicationId').isUUID(),
    body('taken').isBoolean(),
    body('logDate').isDate(),
  ],
  async (req: AuthRequest, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { medicationId, taken, logDate } = req.body;

    try {
      const medCheck = await pool.query(
        'SELECT id FROM medications WHERE id = $1 AND user_id = $2',
        [medicationId, req.user!.id]
      );

      if (medCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      const result = await pool.query(
        `INSERT INTO medication_logs (user_id, medication_id, taken, skipped, log_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [req.user!.id, medicationId, taken, !taken, logDate]
      );

      await auditLog({
        userId: req.user!.id,
        action: 'MEDICATION_LOGGED',
        resourceType: 'medication_log',
        resourceId: result.rows[0].id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: { medicationId, taken },
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Log medication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/logs', async (req: AuthRequest, res: any) => {
  const { startDate, endDate } = req.query;

  try {
    let query = `
      SELECT ml.*, m.name as medication_name
      FROM medication_logs ml
      JOIN medications m ON ml.medication_id = m.id
      WHERE ml.user_id = $1
    `;
    const params: any[] = [req.user!.id];

    if (startDate) {
      params.push(startDate);
      query += ` AND ml.log_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND ml.log_date <= $${params.length}`;
    }

    query += ' ORDER BY ml.log_date DESC, ml.logged_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get medication logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
