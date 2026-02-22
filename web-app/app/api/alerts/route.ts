import { NextRequest, NextResponse } from "next/server";
import { getNotificationsForUser } from "@/features/alerts/services/processAlerts";
import { getAlerts } from "@/features/alerts/alertStore";
import { AlertStatus } from "@/features/alerts/types";

/**
 * GET /api/alerts
 * Returns the latest unread alerts and count for the authenticated user.
 */
export async function GET(request: NextRequest) {
    try {
        // In a real application, obtain userId from session/JWT
        const userId = 'demo-user';

        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode');

        // Allow fetching ALL alerts if mode=all
        if (mode === 'all') {
            const status = searchParams.get('status') as AlertStatus | undefined;
            const limit = parseInt(searchParams.get('limit') || '50');
            const offset = parseInt(searchParams.get('offset') || '0');

            const alerts = getAlerts(userId, { status, limit, offset });
            return NextResponse.json({ alerts });
        }

        // Default behavior: Fetch dashboard notification state
        const state = getNotificationsForUser(userId);

        // Simulated network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        return NextResponse.json(state);
    } catch (error: any) {
        console.error('[Alerts API GET] Failed:', error);
        return NextResponse.json({ error: "Failed to fetch alerts", detail: error.message }, { status: 500 });
    }
}
