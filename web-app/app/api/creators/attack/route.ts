import { NextRequest, NextResponse } from 'next/server';
import { runAttackEngine } from '@/features/creators/opportunity/services/attackEngine';

/**
 * GET /api/creators/attack?channelId=xxx
 * Returns real-time creator opportunity attack analysis.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
        return NextResponse.json({ error: "channelId is required" }, { status: 400 });
    }

    try {
        const result = await runAttackEngine(channelId);

        // Simple heuristic for cache vs fresh for the header (orchestrator handles real cache)
        const response = NextResponse.json(result);
        response.headers.set('X-Cache', 'MISS'); // In a real setup, we'd check if it was a cache hit

        return response;
    } catch (error: any) {
        console.error(`Attack API error for channel "${channelId}":`, error);
        return NextResponse.json({
            error: "Internal Server Error",
            detail: error.message,
            phase: "orchestration"
        }, { status: 500 });
    }
}
