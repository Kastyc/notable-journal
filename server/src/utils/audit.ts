import { pool } from '../config/database';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

export const auditLog = async (entry: AuditLogEntry): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.userId || null,
        entry.action,
        entry.resourceType,
        entry.resourceId || null,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.details ? JSON.stringify(entry.details) : null,
      ]
    );
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};
