import {
    Alert,
    AlertsState,
    NicheMetricsSnapshot,
    ProcessAlertsResult
} from '../types';
import {
    evaluateAlerts,
    deduplicateAlerts,
    filterAlertsByPreferences
} from '../alertEvaluator';
import {
    saveAlerts,
    getAlerts,
    getUnreadCount
} from '../alertStore';
import { enqueueNotification } from '../notificationQueue';
import { getUserPreferences } from '../preferences';

/**
 * Main orchestration service that evaluates snapshots and persists alerts/notifications.
 */
export async function processAlerts(
    userId: string,
    savedNiches: NicheMetricsSnapshot[],
    previousSnapshots: NicheMetricsSnapshot[]
): Promise<ProcessAlertsResult> {
    const preferences = await getUserPreferences(userId);
    const now = new Date().toISOString();

    const allNewAlerts: Alert[] = [];
    const existingAlerts = await getAlerts(userId, { limit: 200 }); // Recent history for dedup

    for (const current of savedNiches) {
        const previous = previousSnapshots.find(p => p.nicheId === current.nicheId);

        if (previous) {
            // 1. Evaluate changes against previous data
            const changes = evaluateAlerts(previous, current, preferences.thresholds);
            allNewAlerts.push(...changes);
        } else {
            // 2. First-time save evaluation (Emerging Opportunity)
            if (current.opportunityIndex >= preferences.thresholds.emergingOpportunityThreshold) {
                allNewAlerts.push({
                    id: `alert-${current.nicheId}-new-emerging-${Date.now()}`,
                    type: 'NEW_EMERGING_OPPORTUNITY',
                    severity: 'MEDIUM',
                    status: 'UNREAD',
                    nicheId: current.nicheId,
                    keyword: current.keyword,
                    title: `New Emerging Opportunity: ${current.keyword}`,
                    description: `Analysis complete. This niche has an opportunity index of ${current.opportunityIndex}, making it a strong entry candidate.`,
                    recommendedAction: "Review the full content strategy and growth blueprint for this niche",
                    metricChanged: "opportunityIndex",
                    previousValue: 0,
                    currentValue: current.opportunityIndex,
                    changeDelta: current.opportunityIndex,
                    changePercent: 100,
                    createdAt: now,
                    readAt: null,
                    relatedUrl: `/trends?keyword=${encodeURIComponent(current.keyword)}`
                });
            }
        }
    }

    // 3. Deduplicate against recent history (24 hour window)
    const uniqueAlerts = deduplicateAlerts(allNewAlerts, existingAlerts, 24);

    // 4. Filter by user preferences (types, severity, niche toggles)
    const finalAlerts = filterAlertsByPreferences(uniqueAlerts, preferences);

    // 5. Persist the alerts that passed filters
    if (finalAlerts.length > 0) {
        await saveAlerts(userId, finalAlerts);

        // 6. Enqueue notifications
        for (const alert of finalAlerts) {
            // Always enqueue in-app if enabled
            if (preferences.inAppEnabled) {
                enqueueNotification(alert, userId, 'INSTANT', 'IN_APP');
            }

            // Enqueue email if enabled
            if (preferences.emailEnabled) {
                enqueueNotification(alert, userId, preferences.notificationFrequency, 'EMAIL');
            }
        }
    }

    return {
        generatedAlerts: finalAlerts,
        queuedNotifications: [], // Simplified for this logic as we use in-app polling mainly
        suppressedCount: allNewAlerts.length - finalAlerts.length,
        processedAt: now
    };
}

/**
 * Returns the current notification state for the user's dashboard bell.
 */
export async function getNotificationsForUser(userId: string): Promise<AlertsState> {
    const alerts = await getAlerts(userId, { status: 'UNREAD', limit: 50 });
    const unreadCount = await getUnreadCount(userId);

    return {
        alerts,
        unreadCount,
        lastCheckedAt: new Date().toISOString()
    };
}
