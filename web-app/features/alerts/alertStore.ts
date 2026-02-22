import { Alert, AlertStatus } from './types';

/**
 * In-memory store for alerts.
 * IMPORTANT: This should be replaced with PostgreSQL or another persistent database in production.
 */
const alertStore: Map<string, Alert[]> = new Map(); // userId → Alert[]

/**
 * Appends new alerts to the user's alert history. Caps at 200 alerts per user.
 * 
 * @param userId - ID of the user.
 * @param alerts - List of new alerts to save.
 */
export function saveAlerts(userId: string, alerts: Alert[]): void {
    const currentHistory = alertStore.get(userId) || [];
    const updatedHistory = [...alerts, ...currentHistory];

    // Cap at 200 items, keeping the most recent
    alertStore.set(userId, updatedHistory.slice(0, 200));
}

/**
 * Retrieves alerts for a specific user with optional filtering and pagination.
 * 
 * @param userId - ID of the user.
 * @param options - Filtering and pagination options.
 * @returns Array of alerts.
 */
export function getAlerts(userId: string, options?: { status?: AlertStatus, limit?: number, offset?: number }): Alert[] {
    let list = alertStore.get(userId) || [];

    if (options?.status) {
        list = list.filter(a => a.status === options.status);
    }

    const offset = options?.offset || 0;
    const limit = options?.limit || 50;

    return list.slice(offset, offset + limit);
}

/**
 * Updates status of specific alerts to 'READ'.
 * 
 * @param userId - ID of the user.
 * @param alertIds - IDs of alerts to mark as read.
 * @returns Number of successfully updated alerts.
 */
export function markAsRead(userId: string, alertIds: string[]): number {
    const list = alertStore.get(userId) || [];
    let updatedCount = 0;
    const now = new Date().toISOString();

    const updatedList = list.map(a => {
        if (alertIds.includes(a.id) && a.status === 'UNREAD') {
            updatedCount++;
            return { ...a, status: 'READ' as AlertStatus, readAt: now };
        }
        return a;
    });

    if (updatedCount > 0) {
        alertStore.set(userId, updatedList);
    }

    return updatedCount;
}

/**
 * Marks all 'UNREAD' alerts for a user as 'READ'.
 * 
 * @param userId - ID of the user.
 * @returns Number of successfully updated alerts.
 */
export function markAllAsRead(userId: string): number {
    const list = alertStore.get(userId) || [];
    let updatedCount = 0;
    const now = new Date().toISOString();

    const updatedList = list.map(a => {
        if (a.status === 'UNREAD') {
            updatedCount++;
            return { ...a, status: 'READ' as AlertStatus, readAt: now };
        }
        return a;
    });

    if (updatedCount > 0) {
        alertStore.set(userId, updatedList);
    }

    return updatedCount;
}

/**
 * Changes status of an alert to 'DISMISSED'.
 * 
 * @param userId - ID of the user.
 * @param alertId - ID of the alert to dismiss.
 * @returns True if alert was found and updated.
 */
export function dismissAlert(userId: string, alertId: string): boolean {
    const list = alertStore.get(userId) || [];
    let found = false;

    const updatedList = list.map(a => {
        if (a.id === alertId) {
            found = true;
            return { ...a, status: 'DISMISSED' as AlertStatus };
        }
        return a;
    });

    if (found) {
        alertStore.set(userId, updatedList);
    }

    return found;
}

/**
 * Returns current count of 'UNREAD' alerts.
 * 
 * @param userId - ID of the user.
 */
export function getUnreadCount(userId: string): number {
    const list = alertStore.get(userId) || [];
    return list.filter(a => a.status === 'UNREAD').length;
}

/**
 * Populates the store with realistic demo data for testing.
 * DEMO ONLY — remove in production.
 * 
 * @param userId - ID of the user.
 * @param keyword - Seed keyword for data generation.
 */
export function seedDemoAlerts(userId: string, keyword: string): void {
    const now = new Date();

    const demoAlerts: Alert[] = [
        {
            id: `alert-${userId}-breakout-${Date.now()}-1`,
            type: 'BREAKOUT_DETECTED',
            severity: 'CRITICAL',
            status: 'UNREAD',
            nicheId: 'demo-niche-1',
            keyword,
            title: `Breakout Detected: ${keyword}`,
            description: `Radar score surged from 45 to 88 — this niche is showing breakout momentum.`,
            recommendedAction: "Publish content immediately to capitalize on the breakout window.",
            metricChanged: "radarScore",
            previousValue: 45,
            currentValue: 88,
            changeDelta: 43,
            changePercent: 95.5,
            createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
            readAt: null,
            relatedUrl: `/trends?keyword=${encodeURIComponent(keyword)}`
        },
        {
            id: `alert-${userId}-opp-up-${Date.now()}-2`,
            type: 'OPPORTUNITY_INCREASED',
            severity: 'HIGH',
            status: 'UNREAD',
            nicheId: 'demo-niche-1',
            keyword,
            title: `Opportunity Score Up +12 pts: ${keyword}`,
            description: `Opportunity index improved from 62 to 74. Conditions have improved for entering this niche.`,
            recommendedAction: "Review your content strategy — the entry window has widened.",
            metricChanged: "opportunityIndex",
            previousValue: 62,
            currentValue: 74,
            changeDelta: 12,
            changePercent: 19.4,
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
            readAt: null,
            relatedUrl: `/trends?keyword=${encodeURIComponent(keyword)}`
        },
        {
            id: `alert-${userId}-comp-spike-${Date.now()}-3`,
            type: 'COMPETITION_SPIKE',
            severity: 'MEDIUM',
            status: 'READ',
            nicheId: 'demo-niche-1',
            keyword,
            title: `Competition Spike: ${keyword}`,
            description: `Competition score increased by 15 points. New creators may be entering this space.`,
            recommendedAction: "Double down on your differentiation strategy.",
            metricChanged: "competitionScore",
            previousValue: 35,
            currentValue: 50,
            changeDelta: 15,
            changePercent: 42.9,
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
            readAt: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
            relatedUrl: `/trends?keyword=${encodeURIComponent(keyword)}`
        },
        {
            id: `alert-${userId}-mon-up-${Date.now()}-4`,
            type: 'MONETIZATION_IMPROVED',
            severity: 'MEDIUM',
            status: 'UNREAD',
            nicheId: 'demo-niche-1',
            keyword,
            title: `Monetization Potential Up: ${keyword}`,
            description: `Monetization score improved from 58 to 68. New revenue pathways available.`,
            recommendedAction: "Review your monetization plan for new affiliate opportunities.",
            metricChanged: "monetizationScore",
            previousValue: 58,
            currentValue: 68,
            changeDelta: 10,
            changePercent: 17.2,
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
            readAt: null,
            relatedUrl: `/trends?keyword=${encodeURIComponent(keyword)}`
        }
    ];

    saveAlerts(userId, demoAlerts);
}
