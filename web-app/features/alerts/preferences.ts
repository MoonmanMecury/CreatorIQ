import {
    UserAlertPreferences,
    PerNicheAlertSetting,
    AlertType,
    AlertSeverity,
    NotificationFrequency,
    AlertThresholds
} from './types';

/**
 * In-memory store for user alert preferences.
 * IMPORTANT: This should be backed by a relational database (PostgreSQL) in production.
 */
const preferencesStore: Map<string, UserAlertPreferences> = new Map();

/**
 * Generates default preferences for a new user.
 * 
 * @param userId - ID of the user.
 * @returns Default preference object.
 */
export function getDefaultPreferences(userId: string): UserAlertPreferences {
    const allTypes: AlertType[] = [
        'BREAKOUT_DETECTED',
        'OPPORTUNITY_INCREASED',
        'OPPORTUNITY_DECLINED',
        'COMPETITION_SPIKE',
        'MONETIZATION_IMPROVED',
        'NEW_EMERGING_OPPORTUNITY',
        'TREND_ACCELERATING',
        'FRESHNESS_WINDOW_OPENED'
    ];

    const defaultThresholds: AlertThresholds = {
        breakoutRadarScore: 75,
        opportunityIncreaseMinDelta: 10,
        opportunityDeclineMinDelta: -8,
        competitionSpikeMinDelta: 12,
        monetizationImprovedMinDelta: 8,
        emergingOpportunityThreshold: 65
    };

    return {
        userId,
        enabledAlertTypes: allTypes,
        minimumSeverity: 'LOW',
        notificationFrequency: 'INSTANT',
        perNicheSettings: [],
        emailEnabled: false,
        inAppEnabled: true,
        thresholds: defaultThresholds
    };
}

/**
 * Retrieves preferences for a user, returning defaults if none are stored.
 * 
 * @param userId - ID of the user.
 * @returns Stored or default preferences.
 */
export function getUserPreferences(userId: string): UserAlertPreferences {
    return preferencesStore.get(userId) || getDefaultPreferences(userId);
}

/**
 * Merges partial updates into a user's existing preferences.
 * 
 * @param userId - ID of the user.
 * @param updates - Object containing partial preference updates.
 * @returns The resulting merged preferences.
 */
export function updateUserPreferences(userId: string, updates: Partial<UserAlertPreferences>): UserAlertPreferences {
    const current = getUserPreferences(userId);
    const updated = {
        ...current,
        ...updates,
        // Ensure nested objects are merged correctly if present in updates
        thresholds: updates.thresholds ? { ...current.thresholds, ...updates.thresholds } : current.thresholds
    };

    preferencesStore.set(userId, updated);
    return updated;
}

/**
 * Upserts alert settings for a specific tracked niche.
 * 
 * @param userId - ID of the user.
 * @param nicheSetting - The niche-specific setting to apply.
 * @returns Fully updated preference object.
 */
export function updatePerNicheSettings(userId: string, nicheSetting: PerNicheAlertSetting): UserAlertPreferences {
    const current = getUserPreferences(userId);
    const index = current.perNicheSettings.findIndex(s => s.nicheId === nicheSetting.nicheId);

    const newPerNicheSettings = [...current.perNicheSettings];
    if (index >= 0) {
        newPerNicheSettings[index] = nicheSetting;
    } else {
        newPerNicheSettings.push(nicheSetting);
    }

    const updated = { ...current, perNicheSettings: newPerNicheSettings };
    preferencesStore.set(userId, updated);
    return updated;
}
