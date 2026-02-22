import { NextRequest, NextResponse } from 'next/server';
import { getMonetizationInsights, buildMonetizationInput } from '@/features/monetization/services/getMonetizationInsights';

/**
 * GET /api/monetization?keyword=xxx
 * Returns full monetization analysis for a niche.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
        return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    try {
        // 800ms simulated delay as per spec
        await new Promise(resolve => setTimeout(resolve, 600));

        // SIMULATED UPSTREAM DATA — seeded from keyword
        // In production, these would be calls to the Step 2 and Step 3 internal APIs or services
        const seed = keyword.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const pseudoRandom = (offset: number) => (Math.sin(seed + offset) + 1) / 2;

        const mockInsightsData = {
            main_topic: keyword,
            niche_score: Math.floor(pseudoRandom(1) * 60 + 30),
            score: Math.floor(pseudoRandom(1) * 60 + 30),
            trend_velocity: Math.floor(pseudoRandom(2) * 80 + 10),
            competition_density: pseudoRandom(3) > 0.7 ? 'HIGH' : pseudoRandom(3) > 0.3 ? 'MEDIUM' : 'LOW',
            revenue_potential: Math.floor(pseudoRandom(4) * 90 + 5),
            top_regions: ['US', 'UK', 'CA'],
            trend_data: [],
            keyword_clusters: [],
            subtopics: [],
            opportunity_insights: {
                underserved_angles: [],
                emerging_keywords: [],
                recommended_format: 'Long-form'
            },
            is_mock: true
        };

        const mockOpportunityData = {
            keyword,
            opportunityIndex: Math.floor(pseudoRandom(5) * 70 + 20),
            classification: 'STRONG' as const,
            signals: {
                weakCompetition: Math.floor(pseudoRandom(6) * 100),
                underservedDemand: Math.floor(pseudoRandom(7) * 100),
                smallCreatorAdvantage: Math.floor(pseudoRandom(8) * 100),
                freshnessGap: Math.floor(pseudoRandom(9) * 100)
            },
            breakoutVideos: [
                { channelSubscribers: 150000 },
                { channelSubscribers: 45000 }
            ],
            underservedKeywords: [],
            competitionInsights: [],
            entryInsights: [],
            computedAt: new Date().toISOString()
        };

        // Build input using mapper
        const input = buildMonetizationInput(
            keyword,
            mockInsightsData as any,
            mockOpportunityData as any
        );

        // Call pure logic
        const insights = getMonetizationInsights(input);

        return NextResponse.json(insights);

    } catch (error: any) {
        console.error(`Monetization API error for keyword "${keyword}":`, error);
        return NextResponse.json(
            {
                error: "Failed to compute monetization insights",
                detail: error.message || "Unknown error"
            },
            { status: 500 }
        );
    }
}
