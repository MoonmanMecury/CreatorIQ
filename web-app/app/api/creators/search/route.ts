import { NextRequest, NextResponse } from 'next/server';
import { searchChannels } from '@/features/creators/services/analyzeCreator';

/**
 * GET /api/creators/search?q=xxx
 * Searches for YouTube channels using real data.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    try {
        const results = await searchChannels(query);
        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Channel search error:', error);
        return NextResponse.json({ error: "Failed to search channels" }, { status: 500 });
    }
}
