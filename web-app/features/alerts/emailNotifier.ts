import { Alert, EmailNotificationPayload, NotificationFrequency } from './types';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    return {
        to: userEmail,
        subject,
        previewText,
        alerts,
        digestPeriod,
        unsubscribeUrl: `${baseUrl}/settings/alerts`,
        dashboardUrl: `${baseUrl}/dashboard`
    };
}

/**
 * Generates the HTML body for the email.
 */
function buildEmailHtml(payload: EmailNotificationPayload): string {
    const alertItems = payload.alerts.map(alert => `
        <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <div style="font-weight: 600; color: #1a202c; font-size: 16px; margin-bottom: 4px;">${alert.title}</div>
            <div style="color: #4a5568; font-size: 14px; margin-bottom: 8px;">${alert.description}</div>
            <div style="display: flex; gap: 12px; font-size: 12px; color: #718096;">
                <span style="background-color: #edf2f7; padding: 2px 8px; border-radius: 4px;">${alert.type.replace(/_/g, ' ')}</span>
                <span style="color: ${alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? '#e53e3e' : alert.severity === 'MEDIUM' ? '#d69e2e' : '#3182ce'}; font-weight: 600;">
                    ${alert.severity} Severity
                </span>
            </div>
        </div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #2d3748; background-color: #f7fafc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .header { margin-bottom: 32px; text-align: center; }
                .logo { font-size: 24px; font-weight: 700; color: #2b6cb0; text-decoration: none; }
                .title { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1a202c; }
                .period { color: #718096; font-size: 14px; margin-bottom: 32px; }
                .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #a0aec0; text-align: center; }
                .btn { display: inline-block; padding: 12px 24px; background-color: #3182ce; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 24px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <a href="${payload.dashboardUrl}" class="logo">CreatorIQ</a>
                </div>
                <div class="title">${payload.subject}</div>
                <div class="period">${payload.digestPeriod}</div>
                
                <div class="alerts">
                    ${alertItems}
                </div>

                <div style="text-align: center;">
                    <a href="${payload.dashboardUrl}" class="btn">View All Alerts</a>
                </div>

                <div class="footer">
                    <p>You're receiving this because you've enabled notifications for your tracked niches.</p>
                    <p><a href="${payload.unsubscribeUrl}" style="color: #4299e1;">Manage preferences</a> or <a href="${payload.unsubscribeUrl}" style="color: #4299e1;">unsubscribe</a>.</p>
                    <p>&copy; ${new Date().getFullYear()} CreatorIQ. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

/**
 * Sends an email using Resend.
 * 
 * @param payload - The email content to send.
 */
export async function sendEmail(payload: EmailNotificationPayload): Promise<{ success: boolean, messageId: string | null, error: string | null }> {
    try {
        const { data, error } = await resend.emails.send({
            from: 'CreatorIQ <alerts@creatoriq.app>',
            to: payload.to,
            subject: payload.subject,
            html: buildEmailHtml(payload),
            text: payload.previewText, // Fallback text
        });

        if (error) {
            console.error('[Resend Error]:', error);
            return { success: false, messageId: null, error: error.message };
        }

        return {
            success: true,
            messageId: data?.id || null,
            error: null
        };
    } catch (err: any) {
        console.error('[sendEmail Exception]:', err);
        return { success: false, messageId: null, error: err.message };
    }
}
