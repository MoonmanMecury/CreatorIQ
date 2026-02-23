import { Alert, NotificationFrequency, NotificationQueueItem, AlertType, AlertSeverity, AlertStatus } from './types';
import { db } from '@/lib/db';

/**
 * PostgreSQL-backed notification queue.
 */
export async function enqueueNotification(
    alert: Alert,
    userId: string,
    frequency: NotificationFrequency,
    channel: 'IN_APP' | 'EMAIL'
): Promise<NotificationQueueItem> {
    const now = new Date();
    let scheduledFor = now;

    if (frequency === 'DAILY_DIGEST') {
        const tomorrow = new Date(now);
        tomorrow.setUTCDate(now.getUTCDate() + 1);
        tomorrow.setUTCHours(8, 0, 0, 0);
        scheduledFor = tomorrow;
    } else if (frequency === 'WEEKLY_DIGEST') {
        const nextMonday = new Date(now);
        nextMonday.setUTCDate(now.getUTCDate() + (1 + 7 - now.getUTCDay()) % 7 || 7);
        nextMonday.setUTCHours(8, 0, 0, 0);
        scheduledFor = nextMonday;
    }

    const id = `notif-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const scheduledForIso = scheduledFor.toISOString();

    await db.query(
        `INSERT INTO notification_queue (id, user_id, alert_id, scheduled_for, delivered, channel)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, userId, alert.id, scheduledForIso, false, channel]
    );

    return {
        id,
        alert,
        userId,
        scheduledFor: scheduledForIso,
        delivered: false,
        deliveredAt: null,
        channel
    };
}

/**
 * Retrieves all undelivered notifications for a user that are ready for delivery.
 */
export async function getPendingNotifications(userId: string, channel: 'IN_APP' | 'EMAIL'): Promise<NotificationQueueItem[]> {
    const now = new Date().toISOString();
    const result = await db.query(
        `SELECT n.*, a.type as a_type, a.severity as a_severity, a.status as a_status, 
                a.niche_id as a_niche_id, a.keyword as a_keyword, a.title as a_title, 
                a.description as a_description, a.recommended_action as a_recommended_action,
                a.metric_changed as a_metric_changed, a.previous_value as a_previous_value,
                a.current_value as a_current_value, a.change_delta as a_change_delta,
                a.change_percent as a_change_percent, a.created_at as a_created_at,
                a.read_at as a_read_at, a.related_url as a_related_url
         FROM notification_queue n
         JOIN alerts a ON n.alert_id = a.id
         WHERE n.user_id = $1 AND n.channel = $2 AND n.delivered = false AND n.scheduled_for <= $3`,
        [userId, channel, now]
    );

    return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        scheduledFor: new Date(row.scheduled_for).toISOString(),
        delivered: row.delivered,
        deliveredAt: row.delivered_at ? new Date(row.delivered_at).toISOString() : null,
        channel: row.channel as 'IN_APP' | 'EMAIL',
        alert: {
            id: row.alert_id,
            type: row.a_type as AlertType,
            severity: row.a_severity as AlertSeverity,
            status: row.a_status as AlertStatus,
            nicheId: row.a_niche_id,
            keyword: row.a_keyword,
            title: row.a_title,
            description: row.a_description,
            recommendedAction: row.a_recommended_action,
            metricChanged: row.a_metric_changed,
            previousValue: Number(row.a_previous_value),
            currentValue: Number(row.a_current_value),
            changeDelta: Number(row.a_change_delta),
            changePercent: Number(row.a_change_percent),
            createdAt: new Date(row.a_created_at).toISOString(),
            readAt: row.a_read_at ? new Date(row.a_read_at).toISOString() : null,
            relatedUrl: row.a_related_url
        }
    }));
}

/**
 * Marks a specific queue item as successfully delivered.
 */
export async function markDelivered(itemId: string): Promise<void> {
    const now = new Date().toISOString();
    await db.query(
        `UPDATE notification_queue SET delivered = true, delivered_at = $1 WHERE id = $2`,
        [now, itemId]
    );
}

/**
 * Removes all successfully delivered items from the queue.
 */
export async function clearDelivered(): Promise<void> {
    await db.query(`DELETE FROM notification_queue WHERE delivered = true`);
}

/**
 * Returns current statistics of the notification queue.
 */
export async function getQueueStats(): Promise<{ pending: number, delivered: number, total: number }> {
    const result = await db.query(
        `SELECT 
            count(*) as total,
            count(*) FILTER (WHERE delivered = true) as delivered,
            count(*) FILTER (WHERE delivered = false) as pending
         FROM notification_queue`
    );
    const row = result.rows[0];
    return {
        total: parseInt(row.total, 10),
        delivered: parseInt(row.delivered, 10),
        pending: parseInt(row.pending, 10)
    };
}

