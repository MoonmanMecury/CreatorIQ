import { Alert, NotificationFrequency, NotificationQueueItem } from './types';

/**
 * In-memory store for notification queue items.
 * IMPORTANT: This should be replaced with a database-backed queue (Redis or PostgreSQL) in production.
 */
const queue: NotificationQueueItem[] = [];

/**
 * Creates and stores a notification queue item scheduled for delivery.
 * 
 * @param alert - The alert triggering the notification.
 * @param userId - Target user ID.
 * @param frequency - How quickly to deliver.
 * @param channel - Delivery channel (In-App or Email).
 * @returns The created queue item.
 */
export function enqueueNotification(
    alert: Alert,
    userId: string,
    frequency: NotificationFrequency,
    channel: 'IN_APP' | 'EMAIL'
): NotificationQueueItem {
    const now = new Date();
    let scheduledFor = now;

    if (frequency === 'DAILY_DIGEST') {
        // Schedule for 08:00 UTC tomorrow
        const tomorrow = new Date(now);
        tomorrow.setUTCDate(now.getUTCDate() + 1);
        tomorrow.setUTCHours(8, 0, 0, 0);
        scheduledFor = tomorrow;
    } else if (frequency === 'WEEKLY_DIGEST') {
        // Schedule for next Monday 08:00 UTC
        const nextMonday = new Date(now);
        nextMonday.setUTCDate(now.getUTCDate() + (1 + 7 - now.getUTCDay()) % 7 || 7);
        nextMonday.setUTCHours(8, 0, 0, 0);
        scheduledFor = nextMonday;
    }
    // INSTANT defaults to current time

    const newItem: NotificationQueueItem = {
        id: `notif-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        alert,
        userId,
        scheduledFor: scheduledFor.toISOString(),
        delivered: false,
        deliveredAt: null,
        channel
    };

    queue.push(newItem);
    return newItem;
}

/**
 * Retrieves all undelivered notifications for a user that are ready for delivery.
 * 
 * @param userId - ID of the user.
 * @param channel - Specific delivery channel.
 * @returns Array of pending items.
 */
export function getPendingNotifications(userId: string, channel: 'IN_APP' | 'EMAIL'): NotificationQueueItem[] {
    const now = new Date().getTime();
    return queue.filter(item =>
        item.userId === userId &&
        item.channel === channel &&
        !item.delivered &&
        new Date(item.scheduledFor).getTime() <= now
    );
}

/**
 * Marks a specific queue item as successfully delivered.
 * 
 * @param itemId - ID of the queue item.
 */
export function markDelivered(itemId: string): void {
    const item = queue.find(i => i.id === itemId);
    if (item) {
        item.delivered = true;
        item.deliveredAt = new Date().toISOString();
    }
}

/**
 * Removes all successfully delivered items from the in-memory queue.
 * (Garbage collection equivalent for MVP).
 */
export function clearDelivered(): void {
    const undelivered = queue.filter(item => !item.delivered);
    queue.length = 0; // Clear array while keeping reference
    queue.push(...undelivered);
}

/**
 * Returns current statistics of the notification queue.
 * 
 * @returns Object with counts.
 */
export function getQueueStats(): { pending: number, delivered: number, total: number } {
    const delivered = queue.filter(i => i.delivered).length;
    return {
        delivered,
        pending: queue.length - delivered,
        total: queue.length
    };
}
