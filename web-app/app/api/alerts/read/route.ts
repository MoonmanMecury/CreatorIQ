import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUserFromRequest";
import { markAsRead, markAllAsRead } from "@/features/alerts/alertStore";

/**
 * POST /api/alerts/read
 * Marks specific unread alerts as read.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = user.userId;
        const { alertIds, all } = await request.json();

        if (all === true) {
            const updated = await markAllAsRead(userId);
            return NextResponse.json({ updated });
        }

        if (!Array.isArray(alertIds)) {
            return NextResponse.json({ error: "alertIds array is required" }, { status: 400 });
        }

        const updated = await markAsRead(userId, alertIds);
        return NextResponse.json({ updated });
    } catch (error: any) {
        console.error('[Alerts Read API POST] Failed:', error);
        return NextResponse.json({ error: "Failed to update alert status", detail: error.message }, { status: 500 });
    }
}
