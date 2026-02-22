/**
 * @file types.ts
 * Type definitions for the Alerts & Notifications System.
 */

/** Types of alerts that can be triggered by niche metric changes. */
export type AlertType =
    | 'BREAKOUT_DETECTED'
    | 'OPPORTUNITY_INCREASED'
    | 'OPPORTUNITY_DECLINED'
    | 'COMPETITION_SPIKE'
    | 'MONETIZATION_IMPROVED'
    | 'NEW_EMERGING_OPPORTUNITY'
    | 'TREND_ACCELERATING'
    | 'FRESHNESS_WINDOW_OPENED'

/** Severity levels for filtering and visual prioritization. */
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

/** Lifecycle status of an individual alert. */
export type AlertStatus = 'UNREAD' | 'READ' | 'DISMISSED'

/** Frequency options for external notifications (Email/Digest). */
export type NotificationFrequency = 'INSTANT' | 'DAILY_DIGEST' | 'WEEKLY_DIGEST'

/** A point-in-time snapshot of metrics for a specific niche. */
export interface NicheMetricsSnapshot {
    /** Reference to the saved niche ID. */
    nicheId: string
    /** The keyword being tracked. */
    keyword: string
    /** ISO timestamp when these metrics were recorded. */
    capturedAt: string
    /** 0-100 score representing overall entry potential. */
    opportunityIndex: number
    /** 0-100 trend velocity score. */
    radarScore: number
    /** 0-100 score for revenue potential. */
    monetizationScore: number
    /** 0-100 score for market saturation/difficulty. */
    competitionScore: number
    /** 0-100 score for search volume/interest. */
    demandScore: number
    /** 0-100 score for relative growth speed. */
    growthScore: number
    /** 0-100 inverse of saturation; higher means "fresher". */
    saturationScore: number
}

/** Represents a proactive notification triggered by a metric change. */
export interface Alert {
    /** Unique alert ID e.g. "alert-{uuid}". */
    id: string
    /** Category of the alert. */
    type: AlertType
    /** Severity level for UI and notifications. */
    severity: AlertSeverity
    /** Current status in the user's inbox. */
    status: AlertStatus
    /** Which saved niche triggered this. */
    nicheId: string
    /** The niche keyword. */
    keyword: string
    /** Short headline e.g. "Breakout Detected: ai tools". */
    title: string
    /** 1-2 sentence explanation of what changed. */
    description: string
    /** Specific thing the user should do. */
    recommendedAction: string
    /** Internal key of the metric that triggered this. */
    metricChanged: string
    /** Value before change. */
    previousValue: number
    /** Value after change. */
    currentValue: number
    /** Arithmetic difference (currentValue - previousValue). */
    changeDelta: number
    /** Percentage change rounded to 1 decimal. */
    changePercent: number
    /** ISO timestamp of when the alert was generated. */
    createdAt: string
    /** ISO timestamp when user marked it as read, or null. */
    readAt: string | null
    /** Deeplink to the relevant trends/insights page. */
    relatedUrl: string
}

/** Configuration for sensitivity of the alert evaluation engine. */
export interface AlertThresholds {
    /** Radar score above which BREAKOUT fires. */
    breakoutRadarScore: number
    /** Minimum point increase in opportunityIndex to fire. */
    opportunityIncreaseMinDelta: number
    /** Minimum point decrease in opportunityIndex to fire. */
    opportunityDeclineMinDelta: number
    /** Minimum competition increase to fire. */
    competitionSpikeMinDelta: number
    /** Minimum monetization increase to fire. */
    monetizationImprovedMinDelta: number
    /** opportunityIndex threshold for a newly saved niche. */
    emergingOpportunityThreshold: number
}

/** Global and per-niche alert settings for a user. */
export interface UserAlertPreferences {
    /** Reference to the user ID. */
    userId: string
    /** Alert types that are currently enabled. */
    enabledAlertTypes: AlertType[]
    /** Threshold for showing alerts in the UI. */
    minimumSeverity: AlertSeverity
    /** How often to send summarized external notifications. */
    notificationFrequency: NotificationFrequency
    /** Overrides for specific niches. */
    perNicheSettings: PerNicheAlertSetting[]
    /** Whether email delivery is active. */
    emailEnabled: boolean
    /** Whether dashboard bell notifications are active. */
    inAppEnabled: boolean
    /** Custom thresholds for the evaluation engine. */
    thresholds: AlertThresholds
}

/** Specific alert overrides for a tracked niche. */
export interface PerNicheAlertSetting {
    /** Target niche ID. */
    nicheId: string
    /** Keyword for display. */
    keyword: string
    /** Master toggle for this niche. */
    alertsEnabled: boolean
    /** Types enabled specifically for this niche (overrides global). */
    enabledTypes: AlertType[]
}

/** Internal tracking for notification delivery. */
export interface NotificationQueueItem {
    /** Unique ID. */
    id: string
    /** The alert to be delivered. */
    alert: Alert
    /** Target user ID. */
    userId: string
    /** ISO timestamp for scheduled delivery. */
    scheduledFor: string
    /** Status of delivery. */
    delivered: boolean
    /** ISO timestamp of delivery. */
    deliveredAt: string | null
    /** Delivery method. */
    channel: 'IN_APP' | 'EMAIL'
}

/** Runtime state for the alerts UI. */
export interface AlertsState {
    /** List of recent alerts. */
    alerts: Alert[]
    /** Number of alerts with 'UNREAD' status. */
    unreadCount: number
    /** Timestamp of last poll or manual check. */
    lastCheckedAt: string | null
}

/** Payload structure for email templates. */
export interface EmailNotificationPayload {
    /** Recipient email. */
    to: string
    /** Email subject. */
    subject: string
    /** Short text for mail client preview. */
    previewText: string
    /** List of alerts included in this email/digest. */
    alerts: Alert[]
    /** Readable period description (e.g. "Daily Digest"). */
    digestPeriod: string
    /** URL to opt-out of emails. */
    unsubscribeUrl: string
    /** URL to the app dashboard. */
    dashboardUrl: string
}

/** Results summary after an alert processing run. */
export interface ProcessAlertsResult {
    /** New alerts added to the store. */
    generatedAlerts: Alert[]
    /** New items added to the notification queue. */
    queuedNotifications: NotificationQueueItem[]
    /** Count of alerts that matched but were filtered by preferences. */
    suppressedCount: number
    /** ISO timestamp of the processing run. */
    processedAt: string
}
