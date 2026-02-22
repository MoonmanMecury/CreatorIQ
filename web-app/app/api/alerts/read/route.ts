import { NextRequest, NextResponse } from "next/server";
import { markAsRead, markAllAsRead } from "@/features/alerts/alertStore";

/**
 * POST /api/alerts/read
 * Marks specific unread alerts as read.
 */
export async function POST(request: NextRequest) {
    try {
        const userId = 'demo-user';
        const { alertIds, all } = await request.json();

        if (all === true) {
            const updated = markAllAsRead(userId);
            return NextResponse.json({ updated });
        }

        if (!Array.isArray(alertIds)) {
            return NextResponse.json({ error: "alertIds array is required" }, { status: 400 });
        }

        const updated = markAsRead(userId, alertIds);
        return NextResponse.json({ updated });
    } catch (error: any) {
        console.error('[Alerts Read API POST] Failed:', error);
        return NextResponse.json({ error: "Failed to update alert status", detail: error.message }, { status: 500 });
    }
}
