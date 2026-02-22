import { NextRequest, NextResponse } from 'next/server';
import { generateInsights } from '@/features/insights/services/generateInsights';

/**
 * GET /api/insights?keyword=<keyword>
 *
 * Returns a full InsightsResponse for the given keyword.
 * Includes a 600ms simulated delay to demonstrate loading states in the UI.
 *
 * Query params:
 *   keyword (required) — the niche keyword to analyse
 *
 * Responses:
 *   200 — InsightsResponse JSON
 *   400 — { error: string } if keyword is missing or empty
 *   500 — { error: string, detail: string } on unexpected failure
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword || keyword.trim() === '') {
        return NextResponse.json(
            { error: 'Missing required query parameter: keyword' },
            { status: 400 },
        );
    }

    // Simulate network latency to showcase loading states
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
        const data = await generateInsights(keyword);
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        const detail = err instanceof Error ? err.message : 'Unknown error';
        console.error('[/api/insights] Failed to generate insights:', detail);
        return NextResponse.json(
            {
                error: 'Failed to generate insights. Please try again.',
                detail,
            },
            { status: 500 },
        );
    }
}
