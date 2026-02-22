import {
    Alert,
    AlertThresholds,
    AlertType,
    NicheMetricsSnapshot,
    UserAlertPreferences,
    AlertSeverity
} from './types';

/**
 * Pure function to evaluate metric changes between two snapshots and generate alerts.
 * 
 * @param previous - The older metrics snapshot.
 * @param current - The newest metrics snapshot.
 * @param thresholds - Thresholds to determine if an alert should fire.
 * @returns Array of triggered alerts.
 */
export function evaluateAlerts(
    previous: NicheMetricsSnapshot,
    current: NicheMetricsSnapshot,
    thresholds: AlertThresholds
): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date().toISOString();

    const createBaseAlert = (type: AlertType, severity: AlertSeverity, metric: string, prevValue: number, currValue: number): Alert => {
        const delta = currValue - prevValue;
        const percent = prevValue !== 0 ? (delta / prevValue) * 100 : 0;

        return {
            id: `alert-${current.nicheId}-${type}-${Date.now()}`,
            type,
            severity,
            status: 'UNREAD',
            nicheId: current.nicheId,
            keyword: current.keyword,
            title: '', // Set by specific evaluation
            description: '', // Set by specific evaluation
            recommendedAction: '', // Set by specific evaluation
            metricChanged: metric,
            previousValue: prevValue,
            currentValue: currValue,
            changeDelta: delta,
            changePercent: Number(percent.toFixed(1)),
            createdAt: now,
            readAt: null,
            relatedUrl: `/trends?keyword=${encodeURIComponent(current.keyword)}`
        };
    };

    // 1. BREAKOUT_DETECTED
    if (current.radarScore > thresholds.breakoutRadarScore && previous.radarScore <= thresholds.breakoutRadarScore) {
        const alert = createBaseAlert('BREAKOUT_DETECTED', 'CRITICAL', 'radarScore', previous.radarScore, current.radarScore);
        alert.title = `Breakout Detected: ${current.keyword}`;
        alert.description = `Radar score surged from ${previous.radarScore} to ${current.radarScore} — this niche is showing breakout momentum.`;
        alert.recommendedAction = "Publish content immediately to capitalize on the breakout window before competition increases";
        alerts.push(alert);
    }

    // 2. OPPORTUNITY_INCREASED
    const oppDelta = current.opportunityIndex - previous.opportunityIndex;
    if (oppDelta >= thresholds.opportunityIncreaseMinDelta) {
        const severity: AlertSeverity = oppDelta >= 20 ? 'HIGH' : 'MEDIUM';
        const alert = createBaseAlert('OPPORTUNITY_INCREASED', severity, 'opportunityIndex', previous.opportunityIndex, current.opportunityIndex);
        alert.title = `Opportunity Score Up +${oppDelta} pts: ${current.keyword}`;
        alert.description = `Opportunity index improved from ${previous.opportunityIndex} to ${current.opportunityIndex}. Conditions have improved for entering this niche.`;
        alert.recommendedAction = "Review your content strategy for this niche — the entry window has widened";
        alerts.push(alert);
    }

    // 3. OPPORTUNITY_DECLINED
    if (oppDelta <= thresholds.opportunityDeclineMinDelta) {
        const severity: AlertSeverity = oppDelta <= -20 ? 'HIGH' : (oppDelta <= -10 ? 'MEDIUM' : 'LOW');
        const alert = createBaseAlert('OPPORTUNITY_DECLINED', severity, 'opportunityIndex', previous.opportunityIndex, current.opportunityIndex);
        alert.title = `Opportunity Declining: ${current.keyword}`;
        alert.description = `Opportunity index dropped from ${previous.opportunityIndex} to ${current.opportunityIndex}. Niche conditions are becoming less favorable.`;
        alert.recommendedAction = "Consider accelerating your publishing schedule before the window closes further";
        alerts.push(alert);
    }

    // 4. COMPETITION_SPIKE
    const compDelta = current.competitionScore - previous.competitionScore;
    if (compDelta >= thresholds.competitionSpikeMinDelta) {
        const severity: AlertSeverity = compDelta >= 20 ? 'HIGH' : 'MEDIUM';
        const alert = createBaseAlert('COMPETITION_SPIKE', severity, 'competitionScore', previous.competitionScore, current.competitionScore);
        alert.title = `Competition Spike: ${current.keyword}`;
        alert.description = `Competition score increased by ${compDelta} points. New creators or brands may be entering this space.`;
        alert.recommendedAction = "Double down on your differentiation strategy and increase publishing frequency";
        alerts.push(alert);
    }

    // 5. MONETIZATION_IMPROVED
    const monDelta = current.monetizationScore - previous.monetizationScore;
    if (monDelta >= thresholds.monetizationImprovedMinDelta) {
        const alert = createBaseAlert('MONETIZATION_IMPROVED', 'MEDIUM', 'monetizationScore', previous.monetizationScore, current.monetizationScore);
        alert.title = `Monetization Potential Up: ${current.keyword}`;
        alert.description = `Monetization score improved from ${previous.monetizationScore} to ${current.monetizationScore}. New revenue pathways may be available.`;
        alert.recommendedAction = "Review your monetization plan — consider activating affiliate or sponsorship outreach";
        alerts.push(alert);
    }

    // 6. TREND_ACCELERATING
    const growthDelta = current.growthScore - previous.growthScore;
    if (current.growthScore > 75 && growthDelta >= 8) {
        const alert = createBaseAlert('TREND_ACCELERATING', 'HIGH', 'growthScore', previous.growthScore, current.growthScore);
        alert.title = `Trend Accelerating: ${current.keyword}`;
        alert.description = `Growth score reached ${current.growthScore} — this topic is gaining significant search momentum.`;
        alert.recommendedAction = "Prioritize publishing trend-responsive content within the next 7 days";
        alerts.push(alert);
    }

    // 7. FRESHNESS_WINDOW_OPENED
    if (current.saturationScore < 40 && previous.saturationScore >= 40) {
        const alert = createBaseAlert('FRESHNESS_WINDOW_OPENED', 'MEDIUM', 'saturationScore', previous.saturationScore, current.saturationScore);
        alert.title = `Freshness Window Opened: ${current.keyword}`;
        alert.description = `Saturation dropped below 40 — fewer competitors are actively publishing in this niche right now.`;
        alert.recommendedAction = "Increase your upload frequency temporarily to claim ranking positions while the window is open";
        alerts.push(alert);
    }

    return alerts;
}

/**
 * Removes duplicate alerts of the same type and niche that fired recently.
 * 
 * @param newAlerts - Alerts generated in the current run.
 * @param existingAlerts - Historical alerts already in the store.
 * @param windowHours - How many hours back to check for duplicates.
 * @returns Filtered array of unique alerts.
 */
export function deduplicateAlerts(newAlerts: Alert[], existingAlerts: Alert[], windowHours: number = 24): Alert[] {
    const windowMs = windowHours * 60 * 60 * 1000;
    const now = Date.now();

    return newAlerts.filter(na => {
        const isDuplicate = existingAlerts.some(ea => {
            const isSameTarget = ea.nicheId === na.nicheId && ea.type === na.type;
            const isWithinWindow = (now - new Date(ea.createdAt).getTime()) < windowMs;
            return isSameTarget && isWithinWindow;
        });
        return !isDuplicate;
    });
}

/**
 * Filters generated alerts based on user-defined preferences and overrides.
 * 
 * @param alerts - Unique alerts to be processed.
 * @param preferences - User settings and niche-specific overrides.
 * @returns Alerts that pass all preference filters.
 */
export function filterAlertsByPreferences(alerts: Alert[], preferences: UserAlertPreferences): Alert[] {
    const severityOrder: Record<AlertSeverity, number> = {
        'LOW': 0,
        'MEDIUM': 1,
        'HIGH': 2,
        'CRITICAL': 3
    };

    const minSeverityScore = severityOrder[preferences.minimumSeverity];

    return alerts.filter(alert => {
        // 1. Check if alert type is enabled globally
        if (!preferences.enabledAlertTypes.includes(alert.type)) return false;

        // 2. Check if severity meets minimum threshold
        if (severityOrder[alert.severity] < minSeverityScore) return false;

        // 3. Apply per-niche overrides
        const nicheSetting = preferences.perNicheSettings.find(s => s.nicheId === alert.nicheId);
        if (nicheSetting) {
            if (!nicheSetting.alertsEnabled) return false;
            if (nicheSetting.enabledTypes.length > 0 && !nicheSetting.enabledTypes.includes(alert.type)) return false;
        }

        return true;
    });
}
