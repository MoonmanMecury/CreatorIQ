import {
    UserAlertPreferences,
    PerNicheAlertSetting,
    AlertType,
    AlertSeverity,
    NotificationFrequency,
    AlertThresholds
} from './types';
import { db } from '@/lib/db';

/**
 * PostgreSQL-backed user alert preferences.
 */
function getDefaultThresholds(): AlertThresholds {
    return {
        breakoutRadarScore: 75,
        opportunityIncreaseMinDelta: 10,
        opportunityDeclineMinDelta: -8,
        competitionSpikeMinDelta: 12,
        monetizationImprovedMinDelta: 8,
        emergingOpportunityThreshold: 65
    };
}

/**
 * Retrieves preferences for a user, inserting defaults if none exist.
 */
export async function getUserPreferences(userId: string): Promise<UserAlertPreferences> {
    const prefResult = await db.query(
        `SELECT * FROM user_alert_preferences WHERE user_id = $1`,
        [userId]
    );

    let pref = prefResult.rows[0];

    if (!pref) {
        // Insert defaults
        const allTypes: AlertType[] = [
            'BREAKOUT_DETECTED', 'OPPORTUNITY_INCREASED', 'OPPORTUNITY_DECLINED',
            'COMPETITION_SPIKE', 'MONETIZATION_IMPROVED', 'NEW_EMERGING_OPPORTUNITY',
            'TREND_ACCELERATING', 'FRESHNESS_WINDOW_OPENED'
        ];
        const defaults = getDefaultThresholds();

        await db.query(
            `INSERT INTO user_alert_preferences (
                user_id, enabled_alert_types, minimum_severity, notification_frequency, 
                email_enabled, in_app_enabled, thresholds
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [userId, allTypes, 'LOW', 'INSTANT', false, true, JSON.stringify(defaults)]
        );

        pref = {
            user_id: userId,
            enabled_alert_types: allTypes,
            minimum_severity: 'LOW',
            notification_frequency: 'INSTANT',
            email_enabled: false,
            in_app_enabled: true,
            thresholds: defaults
        };
    }

    // Fetch per-niche settings
    const nicheResult = await db.query(
        `SELECT * FROM niche_alert_settings WHERE user_id = $1`,
        [userId]
    );

    const perNicheSettings: PerNicheAlertSetting[] = nicheResult.rows.map(row => ({
        nicheId: row.niche_id,
        keyword: row.keyword,
        alertsEnabled: row.alerts_enabled,
        enabledTypes: row.enabled_types as AlertType[]
    }));

    return {
        userId: pref.user_id,
        enabledAlertTypes: pref.enabled_alert_types as AlertType[],
        minimumSeverity: pref.minimum_severity as AlertSeverity,
        notificationFrequency: pref.notification_frequency as NotificationFrequency,
        perNicheSettings,
        emailEnabled: pref.email_enabled,
        inAppEnabled: pref.in_app_enabled,
        thresholds: typeof pref.thresholds === 'string' ? JSON.parse(pref.thresholds) : pref.thresholds
    };
}

/**
 * Merges partial updates into a user's existing preferences.
 */
export async function updateUserPreferences(userId: string, updates: Partial<UserAlertPreferences>): Promise<UserAlertPreferences> {
    const current = await getUserPreferences(userId);

    // Construct dynamic update for user_alert_preferences
    const fieldsToUpdate: string[] = [];
    const values: any[] = [userId];
    let counter = 2;

    if (updates.enabledAlertTypes !== undefined) {
        fieldsToUpdate.push(`enabled_alert_types = $${counter++}`);
        values.push(updates.enabledAlertTypes);
    }
    if (updates.minimumSeverity !== undefined) {
        fieldsToUpdate.push(`minimum_severity = $${counter++}`);
        values.push(updates.minimumSeverity);
    }
    if (updates.notificationFrequency !== undefined) {
        fieldsToUpdate.push(`notification_frequency = $${counter++}`);
        values.push(updates.notificationFrequency);
    }
    if (updates.emailEnabled !== undefined) {
        fieldsToUpdate.push(`email_enabled = $${counter++}`);
        values.push(updates.emailEnabled);
    }
    if (updates.inAppEnabled !== undefined) {
        fieldsToUpdate.push(`in_app_enabled = $${counter++}`);
        values.push(updates.inAppEnabled);
    }
    if (updates.thresholds !== undefined) {
        const mergedThresholds = { ...current.thresholds, ...updates.thresholds };
        fieldsToUpdate.push(`thresholds = $${counter++}`);
        values.push(JSON.stringify(mergedThresholds));
    }

    if (fieldsToUpdate.length > 0) {
        await db.query(
            `UPDATE user_alert_preferences SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE user_id = $1`,
            values
        );
    }

    return await getUserPreferences(userId);
}

/**
 * Upserts alert settings for a specific tracked niche.
 */
export async function updatePerNicheSettings(userId: string, nicheSetting: PerNicheAlertSetting): Promise<UserAlertPreferences> {
    await db.query(
        `INSERT INTO niche_alert_settings (user_id, niche_id, keyword, alerts_enabled, enabled_types)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, niche_id) DO UPDATE SET
            keyword = EXCLUDED.keyword,
            alerts_enabled = EXCLUDED.alerts_enabled,
            enabled_types = EXCLUDED.enabled_types`,
        [userId, nicheSetting.nicheId, nicheSetting.keyword, nicheSetting.alertsEnabled, nicheSetting.enabledTypes]
    );

    return await getUserPreferences(userId);
}

