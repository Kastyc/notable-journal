import { Router } from 'express';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { auditLog } from '../utils/audit';
import crypto from 'crypto';

const router = Router();

router.use(authenticate);

router.get('/stats', async (req: AuthRequest, res: any) => {
  const { startDate, endDate } = req.query;

  try {
    const params: any[] = [req.user!.id];
    let dateFilter = '';

    if (startDate) {
      params.push(startDate);
      dateFilter += ` AND log_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      dateFilter += ` AND log_date <= $${params.length}`;
    }

    const [moodStats, adherenceStats, symptomStats] = await Promise.all([
      pool.query(
        `SELECT AVG(mood_score) as avg_mood, COUNT(*) as total_logs
         FROM daily_logs
         WHERE user_id = $1 ${dateFilter}`,
        params
      ),
      pool.query(
        `SELECT 
           COUNT(CASE WHEN taken THEN 1 END) as taken_count,
           COUNT(*) as total_count
         FROM medication_logs
         WHERE user_id = $1 ${dateFilter}`,
        params
      ),
      pool.query(
        `SELECT UNNEST(symptoms) as symptom, COUNT(*) as count
         FROM daily_logs
         WHERE user_id = $1 ${dateFilter} AND symptoms IS NOT NULL
         GROUP BY symptom
         ORDER BY count DESC
         LIMIT 10`,
        params
      ),
    ]);

    res.json({
      mood: {
        average: parseFloat(moodStats.rows[0].avg_mood || 0).toFixed(1),
        totalLogs: parseInt(moodStats.rows[0].total_logs || 0),
      },
      adherence: {
        percentage:
          adherenceStats.rows[0].total_count > 0
            ? Math.round(
                (adherenceStats.rows[0].taken_count / adherenceStats.rows[0].total_count) * 100
              )
            : 0,
        taken: parseInt(adherenceStats.rows[0].taken_count || 0),
        total: parseInt(adherenceStats.rows[0].total_count || 0),
      },
      topSymptoms: symptomStats.rows,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/share', async (req: AuthRequest, res: any) => {
  const { dateRange } = req.body;

  try {
    const shareToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const result = await pool.query(
      `INSERT INTO shared_reports (patient_id, share_token, date_range, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user!.id, shareToken, dateRange, expiresAt]
    );

    await auditLog({
      userId: req.user!.id,
      action: 'REPORT_SHARED',
      resourceType: 'shared_report',
      resourceId: result.rows[0].id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      shareUrl: `${process.env.APP_URL || 'http://localhost:3000'}/shared/${shareToken}`,
      expiresAt: result.rows[0].expires_at,
    });
  } catch (error) {
    console.error('Share report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/shared/:token', async (req: any, res: any) => {
  const { token } = req.params;

  try {
    const shareResult = await pool.query(
      `SELECT * FROM shared_reports
       WHERE share_token = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [token]
    );

    if (shareResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or expired' });
    }

    const share = shareResult.rows[0];

    await pool.query(
      'UPDATE shared_reports SET accessed_at = CURRENT_TIMESTAMP WHERE id = $1',
      [share.id]
    );

    const dateRange = share.date_range;
    let days = 7;
    if (dateRange === 'month') days = 30;
    else if (dateRange === '3months') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [logs, medLogs, meds] = await Promise.all([
      pool.query(
        'SELECT * FROM daily_logs WHERE user_id = $1 AND log_date >= $2 ORDER BY log_date DESC',
        [share.patient_id, startDate.toISOString().split('T')[0]]
      ),
      pool.query(
        'SELECT * FROM medication_logs WHERE user_id = $1 AND log_date >= $2 ORDER BY log_date DESC',
        [share.patient_id, startDate.toISOString().split('T')[0]]
      ),
      pool.query('SELECT * FROM medications WHERE user_id = $1 AND is_active = true', [
        share.patient_id,
      ]),
    ]);

    res.json({
      dateRange,
      logs: logs.rows,
      medicationLogs: medLogs.rows,
      medications: meds.rows,
    });
  } catch (error) {
    console.error('Get shared report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
