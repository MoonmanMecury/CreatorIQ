import { Alert, EmailNotificationPayload, NotificationFrequency } from './types';

/**
 * Builds a structured payload for email delivery based on alerts and frequency.
 * 
 * @param userId - ID of the target user.
 * @param userEmail - Recipient email address.
 * @param alerts - List of alerts to include.
 * @param frequency - How the alerts are being delivered (Instant, Daily Digest, Weekly).
 * @returns Populated email payload.
 */
export function buildEmailPayload(
    userId: string,
    userEmail: string,
    alerts: Alert[],
    frequency: NotificationFrequency
): EmailNotificationPayload {
    let subject = '';
    let previewText = '';
    let digestPeriod = '';

    const n = alerts.length;
    const now = new Date();

    if (frequency === 'INSTANT') {
        subject = `CreatorIQ Alert: ${alerts[0]?.title || 'System Update'}`;
        previewText = alerts[0]?.description || 'Important change detected in your tracked niches.';
        digestPeriod = now.toLocaleDateString();
    } else if (frequency === 'DAILY_DIGEST') {
        subject = `Your CreatorIQ Daily Digest — ${n} new alerts`;
        previewText = `Summary of the latest changes in your tracked niches for ${now.toLocaleDateString()}.`;
        digestPeriod = `Daily Digest — ${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()}`;
    } else {
        subject = `Your CreatorIQ Weekly Summary — ${n} updates`;
        previewText = `A weekly overview of market opportunities and alerts.`;
        digestPeriod = `Weekly Summary — Week of ${now.toLocaleDateString()}`;
    }

    return {
        to: userEmail,
        subject,
        previewText,
        alerts,
        digestPeriod,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings/alerts`,
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`
    };
}

/**
 * Mock function to simulate "sending" an email.
 * STUB — In production, this should integrate with an email service provider like SendGrid, Resend, or AWS SES.
 * 
 * @param payload - The email content to "send".
 */
export async function sendEmail(payload: EmailNotificationPayload): Promise<{ success: boolean, messageId: string | null, error: string | null }> {
    // STUB — Perform logging instead of real delivery
    console.log('--- EMAIL NOTIFICATION STUB ---');
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Digest: ${payload.digestPeriod}`);
    console.log(`Alert Count: ${payload.alerts.length}`);
    console.log('--------------------------------');

    // Simulated network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        success: true,
        messageId: `stub-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        error: null
    };
}
