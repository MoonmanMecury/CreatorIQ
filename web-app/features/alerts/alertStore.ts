import { Alert, AlertStatus, AlertSeverity, AlertType } from './types';
import { db } from '@/lib/db';

/**
 * Maps a database row to the Alert interface.
 */
function rowToAlert(row: any): Alert {
    return {
        id: row.id,
        type: row.type as AlertType,
        severity: row.severity as AlertSeverity,
        status: row.status as AlertStatus,
        nicheId: row.niche_id,
        keyword: row.keyword,
        title: row.title,
        description: row.description,
        recommendedAction: row.recommended_action,
        metricChanged: row.metric_changed,
        previousValue: Number(row.previous_value),
        currentValue: Number(row.current_value),
        changeDelta: Number(row.change_delta),
        changePercent: Number(row.change_percent),
        relatedUrl: row.related_url,
        createdAt: new Date(row.created_at).toISOString(),
        readAt: row.read_at ? new Date(row.read_at).toISOString() : null
    };
}

/**
 * Appends new alerts to the database.
 */
export async function saveAlerts(userId: string, alerts: Alert[]): Promise<void> {
    for (const alert of alerts) {
        await db.query(
            `INSERT INTO alerts (
                id, user_id, type, severity, status, niche_id, keyword, title, 
                description, recommended_action, metric_changed, previous_value, 
                current_value, change_delta, change_percent, related_url, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO NOTHING`,
            [
                alert.id, userId, alert.type, alert.severity, alert.status, alert.nicheId,
                alert.keyword, alert.title, alert.description, alert.recommendedAction,
                alert.metricChanged, alert.previousValue, alert.currentValue,
                alert.changeDelta, alert.changePercent, alert.relatedUrl, alert.createdAt
            ]
        );
    }
}

/**
 * Retrieves alerts for a specific user with filtering and pagination.
 */
export async function getAlerts(userId: string, options?: { status?: AlertStatus, limit?: number, offset?: number }): Promise<Alert[]> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const statusClause = options?.status ? `AND status = $4` : '';
    const params = options?.status
        ? [userId, limit, offset, options.status]
        : [userId, limit, offset];

    const result = await db.query(
        `SELECT * FROM alerts WHERE user_id = $1 ${statusClause} ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        params
    );
    return result.rows.map(rowToAlert);
}

/**
 * Updates status of specific alerts to 'READ'.
 */
export async function markAsRead(userId: string, alertIds: string[]): Promise<number> {
    const now = new Date().toISOString();
    const result = await db.query(
        `UPDATE alerts SET status = 'READ', read_at = $1 
         WHERE user_id = $2 AND id = ANY($3) AND status = 'UNREAD'`,
        [now, userId, alertIds]
    );
    return result.rowCount ?? 0;
}

/**
 * Marks all 'UNREAD' alerts for a user as 'READ'.
 */
export async function markAllAsRead(userId: string): Promise<number> {
    const now = new Date().toISOString();
    const result = await db.query(
        `UPDATE alerts SET status = 'READ', read_at = $1 
         WHERE user_id = $2 AND status = 'UNREAD'`,
        [now, userId]
    );
    return result.rowCount ?? 0;
}

/**
 * Changes status of an alert to 'DISMISSED'.
 */
export async function dismissAlert(userId: string, alertId: string): Promise<boolean> {
    const result = await db.query(
        `UPDATE alerts SET status = 'DISMISSED' 
         WHERE user_id = $1 AND id = $2`,
        [userId, alertId]
    );
    return (result.rowCount ?? 0) > 0;
}

/**
 * Returns current count of 'UNREAD' alerts.
 */
export async function getUnreadCount(userId: string): Promise<number> {
    const result = await db.query(
        `SELECT count(*) FROM alerts WHERE user_id = $1 AND status = 'UNREAD'`,
        [userId]
    );
    return parseInt(result.rows[0].count, 10);
}

