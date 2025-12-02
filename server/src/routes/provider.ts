import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { pool } from '../config/database';
import { authenticate, requireProvider, AuthRequest } from '../middleware/auth';
import { auditLog } from '../utils/audit';

const router = Router();

router.use(authenticate);
router.use(requireProvider);

router.get('/patients', async (req: AuthRequest, res: any) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.created_at,
              pp.access_granted_at, pp.is_active
       FROM provider_patients pp
       JOIN users u ON pp.patient_id = u.id
       WHERE pp.provider_id = $1 AND pp.is_active = true
       ORDER BY u.username`,
      [req.user!.id]
    );

    const patients = await Promise.all(
      result.rows.map(async (patient) => {
        const [logs, meds] = await Promise.all([
          pool.query(
            'SELECT COUNT(*) as count FROM daily_logs WHERE user_id = $1',
            [patient.id]
          ),
          pool.query(
            'SELECT COUNT(*) as count FROM medications WHERE user_id = $1 AND is_active = true',
            [patient.id]
          ),
        ]);

        return {
          ...patient,
          totalLogs: parseInt(logs.rows[0].count),
          activeMedications: parseInt(meds.rows[0].count),
        };
      })
    );

    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/patients/:patientId/data', [param('patientId').isUUID()], async (req: AuthRequest, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { patientId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const accessCheck = await pool.query(
      'SELECT id FROM provider_patients WHERE provider_id = $1 AND patient_id = $2 AND is_active = true',
      [req.user!.id, patientId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this patient' });
    }

    let dateFilter = '';
    const params: any[] = [patientId];

    if (startDate) {
      params.push(startDate);
      dateFilter += ` AND log_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      dateFilter += ` AND log_date <= $${params.length}`;
    }

    const [logs, medLogs, meds, notes] = await Promise.all([
      pool.query(
        `SELECT * FROM daily_logs WHERE user_id = $1 ${dateFilter} ORDER BY log_date DESC`,
        params
      ),
      pool.query(
        `SELECT ml.*, m.name as medication_name
         FROM medication_logs ml
         JOIN medications m ON ml.medication_id = m.id
         WHERE ml.user_id = $1 ${dateFilter}
         ORDER BY ml.log_date DESC`,
        params
      ),
      pool.query(
        'SELECT * FROM medications WHERE user_id = $1 AND is_active = true ORDER BY time_of_day',
        [patientId]
      ),
      pool.query(
        'SELECT * FROM provider_notes WHERE provider_id = $1 AND patient_id = $2 ORDER BY created_at DESC',
        [req.user!.id, patientId]
      ),
    ]);

    await auditLog({
      userId: req.user!.id,
      action: 'PROVIDER_ACCESSED_PATIENT_DATA',
      resourceType: 'patient',
      resourceId: patientId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      logs: logs.rows,
      medicationLogs: medLogs.rows,
      medications: meds.rows,
      providerNotes: notes.rows,
    });
  } catch (error) {
    console.error('Get patient data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post(
  '/patients/:patientId/notes',
  [param('patientId').isUUID(), body('noteText').trim().isLength({ min: 1 })],
  async (req: AuthRequest, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patientId } = req.params;
    const { noteText } = req.body;

    try {
      const accessCheck = await pool.query(
        'SELECT id FROM provider_patients WHERE provider_id = $1 AND patient_id = $2 AND is_active = true',
        [req.user!.id, patientId]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this patient' });
      }

      const result = await pool.query(
        `INSERT INTO provider_notes (provider_id, patient_id, note_text)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [req.user!.id, patientId, noteText]
      );

      await auditLog({
        userId: req.user!.id,
        action: 'PROVIDER_NOTE_CREATED',
        resourceType: 'provider_note',
        resourceId: result.rows[0].id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: { patientId },
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create note error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/patients/:patientId/medications',
  [
    param('patientId').isUUID(),
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

    const { patientId } = req.params;
    const { name, dosage, frequency, timeOfDay } = req.body;

    try {
      const accessCheck = await pool.query(
        'SELECT id FROM provider_patients WHERE provider_id = $1 AND patient_id = $2 AND is_active = true',
        [req.user!.id, patientId]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this patient' });
      }

      const result = await pool.query(
        `INSERT INTO medications (user_id, name, dosage, frequency, time_of_day, prescribed_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [patientId, name, dosage, frequency, timeOfDay, req.user!.username]
      );

      await auditLog({
        userId: req.user!.id,
        action: 'PROVIDER_PRESCRIBED_MEDICATION',
        resourceType: 'medication',
        resourceId: result.rows[0].id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        details: { patientId },
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Prescribe medication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
