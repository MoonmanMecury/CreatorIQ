import { NextRequest, NextResponse } from "next/server";
import { getUserPreferences, updateUserPreferences } from "@/features/alerts/preferences";

/**
 * GET /api/alerts/preferences
 * Returns the alert preferences for the user.
 */
export async function GET() {
    try {
        const userId = 'demo-user';
        const preferences = getUserPreferences(userId);
        return NextResponse.json(preferences);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
    }
}

/**
 * PUT /api/alerts/preferences
 * Updates user alert preferences.
 */
export async function PUT(request: NextRequest) {
    try {
        const userId = 'demo-user';
        const body = await request.json();

        const updated = updateUserPreferences(userId, body);
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('[Alerts Preferences PUT] Failed:', error);
        return NextResponse.json({ error: "Failed to update preferences", detail: error.message }, { status: 500 });
    }
}
